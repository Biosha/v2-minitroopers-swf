import { MissionType, PrismaClient } from "@minitroopers/prisma";
import {
  BuyingMissionCost,
  checkNameValide,
  getReferralPrice,
} from "@minitroopers/shared";
import { Request, Response } from "express";
import { sendError } from "../utils/httpErrors.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { toAuthUserDto, toPublicUserDto } from "../utils/userDto.js";
import { auth, getClientIp, IncludeAllUserData } from "../utils/UserHelper.js";

const STARTING_GOLD = 0;

const Users = {
  create: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      if (
        req.body.army == null ||
        req.body.color == null ||
        req.body.prefix == null ||
        req.body.trooper == null ||
        req.body.userId == null
      ) {
        return sendError(res, 400, "Invalid request");
      }

      const user = await auth(prisma, req);

      if (user.troopers.length > 0) {
        return sendError(res, 400, "Army already exists");
      }

      if (typeof req.body.army != "string" || !checkNameValide(req.body.army)) {
        return sendError(res, 400, "Invalid army name");
      }

      if (!(
        typeof req.body.color === "number" &&
        Number.isInteger(req.body.color) &&
        req.body.color >= 0 &&
        req.body.color <= 5
      )) {
        return sendError(res, 400, "Invalid color");
      }

      if (!(
        typeof req.body.prefix === "number" &&
        Number.isInteger(req.body.prefix) &&
        req.body.prefix >= 0 &&
        req.body.prefix <= 5
      )) {
        return sendError(res, 400, "Invalid prefix");
      }

      const existingName = await prisma.user.findFirst({
        where: {
          armyName: { equals: req.body.army as string, mode: "insensitive" },
        },
      });

      if (existingName) {
        return sendError(res, 409, "Army name already taken");
      }

      const existingTodayTrooper = await prisma.trooperDay.findFirst({
        where: {
          id: req.body.trooper,
        },
      });

      if (!existingTodayTrooper) {
        return sendError(res, 400, "Invalid trooper");
      }

      const newIp = getClientIp(req);

      const army = await prisma.$transaction(async (tx) => {
        let refArmy = null;
        if (
          req.body.referralName != null &&
          typeof req.body.referralName === "string" &&
          req.body.referralName != "" &&
          checkNameValide(req.body.referralName)
        ) {
          refArmy = await tx.user.findFirst({
            where: {
              armyName: {
                equals: req.body.referralName as string,
                mode: "insensitive",
              },
            },
            include: {
              sponsoredUsers: true,
            },
          });

          if (refArmy?.id) {
            await tx.user.update({
              where: { id: refArmy.id },
              data: {
                gold: {
                  increment: refArmy.referralGold,
                },
                history: {
                  create: {
                    type: "recruit",
                    options: {
                      armyName: req.body.army,
                      reward: refArmy.referralGold,
                      success: true,
                    },
                  },
                },
                referralGold: getReferralPrice(
                  refArmy.sponsoredUsers.length + 1,
                ),
              },
            });
          }
        }

        return tx.user.update({
          where: { id: user.id },
          data: {
            armyName: req.body.army,
            prefix: req.body.prefix,
            color: req.body.color,
            power: 5,
            sponsoredById: refArmy?.id,
            gold: STARTING_GOLD,
            troopers: {
              create: {
                name: existingTodayTrooper.name,
                group: req.body.color,
                seed: existingTodayTrooper.seed,
                choices: [],
              },
            },
            ...(newIp
              ? {
                  ipAddressUser: {
                    create: [{ ip: newIp }],
                  },
                }
              : {}),
            history: {
              create: [
                {
                  type: "creation",
                },
              ],
            },
          },
          include: IncludeAllUserData(),
        });
      });

      res.send(sanitizeUser(army));
    } catch (error) {
      console.error(error);
      return sendError(res, 401, "Unauthorized");
    }
  },
  signin: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      const user = await auth(prisma, req);
      const token = Buffer.from(
        req.headers.authorization!.split(" ")[1],
        "base64",
      )
        .toString()
        .split(":")[1];

      res.send(toAuthUserDto(user, token));
    } catch (error) {
      console.error(error);
      return sendError(res, 401, "Unauthorized");
    }
  },
  get: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      if (!req.query.army || typeof req.query.army != "string") {
        return sendError(res, 400, "Invalid army");
      }

      const name: string = req.query.army;
      const full: boolean = req.query.full === "true";

      if (!checkNameValide(name)) {
        return sendError(res, 400, "Invalid army name");
      }

      let requesterId: string | null = null;
      try {
        const requester = await auth(prisma, req);
        requesterId = requester.id;
      } catch {
        requesterId = null;
      }

      if (full) {
        if (!requesterId) {
          return sendError(
            res,
            403,
            "Full profile requires owner authentication",
          );
        }

        const owner = await prisma.user.findFirst({
          where: {
            armyName: { equals: name, mode: "insensitive" },
            id: requesterId,
          },
          include: IncludeAllUserData(),
        });

        if (!owner) {
          return sendError(res, 404, "Army not found");
        }

        return res.send(sanitizeUser(owner));
      }

      const user = await prisma.user.findFirst({
        where: {
          armyName: { equals: name, mode: "insensitive" },
        },
        select: {
          armyName: true,
          prefix: true,
          exterminationUnlockAt: true,
          infiltrationUnlockAt: true,
          epicUnlockAt: true,
        },
      });

      if (!user) {
        return sendError(res, 404, "Army not found");
      }

      res.send(toPublicUserDto(user));
    } catch (error) {
      console.error(error);
      return sendError(res, 500, "Failed to load army");
    }
  },

  unlockMission:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        if (
          req.body.missionType == null ||
          typeof req.body.missionType != "string"
        ) {
          return sendError(res, 400, "Invalid mission type");
        }

        const missionType = req.body.missionType as MissionType;
        if (!["infiltrate", "exterminate", "epic"].includes(missionType)) {
          return sendError(res, 400, "Invalid mission type");
        }

        const user = await auth(prisma, req);

        if (user.gold < BuyingMissionCost) {
          return sendError(res, 400, "Not enough gold");
        }

        const data: {
          gold: { decrement: number };
          infiltrationUnlockAt?: Date;
          exterminationUnlockAt?: Date;
          epicUnlockAt?: Date;
        } = {
          gold: {
            decrement: BuyingMissionCost,
          },
        };

        if (missionType === "infiltrate") {
          if (user.infiltrationUnlockAt != null) {
            return sendError(res, 400, "Mission already unlocked");
          }
          data.infiltrationUnlockAt = new Date();
        } else if (missionType === "exterminate") {
          if (user.exterminationUnlockAt != null) {
            return sendError(res, 400, "Mission already unlocked");
          }
          data.exterminationUnlockAt = new Date();
        } else if (missionType === "epic") {
          if (user.epicUnlockAt != null) {
            return sendError(res, 400, "Mission already unlocked");
          }
          data.epicUnlockAt = new Date();
        }

        const updatedCount = await prisma.user.updateMany({
          where: {
            id: user.id,
            gold: { gte: BuyingMissionCost },
          },
          data,
        });

        if (updatedCount.count === 0) {
          return sendError(res, 400, "Not enough gold");
        }

        const army = await prisma.user.findFirst({
          where: { id: user.id },
          include: IncludeAllUserData(),
        });

        res.send(sanitizeUser(army));
      } catch (error) {
        console.error(error);
        return sendError(res, 401, "Unauthorized");
      }
    },
};

export default Users;
