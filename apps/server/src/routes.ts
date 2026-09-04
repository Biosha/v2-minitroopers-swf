import { PrismaClient } from "@minitroopers/prisma";
import { Express, Request, Response } from "express";
import Fights from "./controllers/Fights.js";
import Missions from "./controllers/Missions.js";
import OAuth from "./controllers/OAuth.js";
import Raids from "./controllers/Raids.js";
import Troopers from "./controllers/Troopers.js";
import Users from "./controllers/Users.js";
import Utils from "./controllers/Utils.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { Ruffle } from "./utils/Ruffle.js";
import ServerState from "./utils/ServerState.js";

const initRoutes = (app: Express, prisma: PrismaClient, ruffle: Ruffle) => {
  app.get("/api/is-ready", (req: Request, res: Response<boolean>) => {
    res.status(200).send(ServerState.isReady());
  });

  // OAuth (EternalTwin)
  app.get("/api/oauth/redirect", asyncHandler(OAuth.redirect));
  app.get("/api/oauth/token", asyncHandler(OAuth.token(prisma)));

  // Utils
  app.get(
    "/api/util/checkNameAvailability",
    asyncHandler(Utils.checkNameAvailability(prisma)),
  );
  app.get(
    "/api/util/checkArmyExist",
    asyncHandler(Utils.checkArmyExist(prisma)),
  );
  app.get(
    "/api/util/getTodayTroopers",
    asyncHandler(Utils.getTodayTrooper(prisma)),
  );
  app.get("/api/util/getRanking", asyncHandler(Utils.getRanking(prisma)));

  // User
  app.post("/api/user/create", asyncHandler(Users.create(prisma)));
  app.get("/api/user/signin/eternal", asyncHandler(Users.signin(prisma)));
  app.get("/api/user/get", asyncHandler(Users.get(prisma)));
  app.post(
    "/api/user/unlockMission",
    asyncHandler(Users.unlockMission(prisma)),
  );

  // Trooper
  app.post(
    "/api/trooper/updateConfig",
    asyncHandler(Troopers.updateConfig(prisma)),
  );
  app.post(
    "/api/trooper/chooseSkill",
    asyncHandler(Troopers.chooseSkill(prisma)),
  );
  app.post("/api/trooper/add", asyncHandler(Troopers.add(prisma)));

  // Fight
  app.get("/api/fight/getOpponents", asyncHandler(Fights.getOpponents(prisma)));
  app.post(
    "/api/fight/createFight",
    asyncHandler(Fights.createFight(prisma, ruffle)),
  );
  app.get("/api/fight/getFight", asyncHandler(Fights.getFight(prisma)));
  app.get(
    "/api/fight/getTroopersRaid",
    asyncHandler(Fights.getTroopersRaid(prisma)),
  );

  // Mission
  app.post(
    "/api/mission/createMission",
    asyncHandler(Missions.createMission(prisma, ruffle)),
  );
  app.get("/api/mission/getMission", asyncHandler(Missions.getMission(prisma)));

  // Raid
  app.post(
    "/api/raid/createRaid",
    asyncHandler(Raids.createRaid(prisma, ruffle)),
  );
};

export default initRoutes;
