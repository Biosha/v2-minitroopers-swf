import { EternaltwinNodeClient } from "@eternaltwin/client-node";
import { AuthType } from "@eternaltwin/core/auth/auth-type";
import { RfcOauthClient } from "@eternaltwin/oauth-client-http/rfc-oauth-client";
import { PrismaClient } from "@minitroopers/prisma";
import { Request, Response } from "express";
import urlJoin from "url-join";
import Env from "../Env.js";
import { sendError } from "../utils/httpErrors.js";
import { toAuthUserDto } from "../utils/userDto.js";
import { IncludeAllUserData } from "../utils/UserHelper.js";

const oauthClient = new RfcOauthClient({
  authorizationEndpoint: new URL(urlJoin(Env.ETWIN_URL, "oauth/authorize")),
  tokenEndpoint: new URL(urlJoin(Env.ETWIN_URL, "oauth/token")),
  callbackEndpoint: new URL(urlJoin(Env.SELF_URL, "oauth/callback")),
  clientId: Env.ETWIN_CLIENT_ID,
  clientSecret: Env.ETWIN_CLIENT_SECRET,
});

const OAuth = {
  redirect: (_req: Request, res: Response) => {
    try {
      res.send({
        url: oauthClient.getAuthorizationUri("base", ""),
      });
    } catch {
      return sendError(res, 500, "OAuth redirect failed");
    }
  },
  token: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      if (!req.query.code || typeof req.query.code !== "string") {
        return sendError(res, 400, "Invalid code");
      }

      const token = await oauthClient.getAccessToken(req.query.code);
      const etwinClient = new EternaltwinNodeClient(new URL(Env.ETWIN_URL));
      const self = await etwinClient.getAuthSelf({ auth: token.accessToken });
      if (self.type !== AuthType.AccessToken) {
        return sendError(res, 401, "Invalid auth type");
      }

      const { user: etwinUser } = self;
      const existingUser = await prisma.user.findFirst({
        where: { id: etwinUser.id },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: etwinUser.id,
            connexionToken: token.accessToken,
            name: etwinUser.displayName.current.value,
            armyName: "",
            armyUrl: "",
          },
          select: { id: true },
        });
      } else {
        await prisma.user.update({
          where: { id: etwinUser.id },
          data: {
            name: etwinUser.displayName.current.value,
            connexionToken: token.accessToken,
          },
          select: { id: true },
        });
      }

      const user = await prisma.user.findFirst({
        where: { id: etwinUser.id, connexionToken: token.accessToken },
        include: IncludeAllUserData(),
      });

      if (!user) {
        return sendError(res, 500, "User not found after OAuth");
      }

      res.send(toAuthUserDto(user, token.accessToken));
    } catch (error) {
      console.error(error);
      return sendError(res, 500, "OAuth token exchange failed");
    }
  },
};

export default OAuth;
