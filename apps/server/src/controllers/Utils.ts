import { PrismaClient } from "@minitroopers/prisma";
import { checkNameValide, UserRanking } from "@minitroopers/shared";
import { Request, Response } from "express";
import { sendError } from "../utils/httpErrors.js";

const Utils = {
  checkNameAvailability:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        if (!checkNameValide(req.query.name as string)) {
          return res.send({ status: "error" });
        }

        const existingName = await prisma.user.findFirst({
          where: {
            armyName: { equals: req.query.name as string, mode: "insensitive" },
          },
        });

        if (existingName) {
          return res.send({ status: "error" });
        }

        return res.send({ status: "available" });
      } catch (error) {
        console.error(error);
        return sendError(res, 500, "Failed to check name availability");
      }
    },
  checkArmyExist:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        if (!checkNameValide(req.query.name as string)) {
          return res.send({ status: false });
        }

        const existingName = await prisma.user.count({
          where: {
            armyName: { equals: req.query.name as string, mode: "insensitive" },
          },
        });

        return res.send({ status: existingName > 0 });
      } catch (error) {
        console.error(error);
        return sendError(res, 500, "Failed to check army");
      }
    },
  getTodayTrooper:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        const todayTroopers = await prisma.trooperDay.findMany();

        if (todayTroopers?.length != 5) {
          return sendError(res, 503, "Today troopers are not ready");
        }

        return res.send(todayTroopers);
      } catch (error) {
        console.error(error);
        return sendError(res, 500, "Failed to load today troopers");
      }
    },

  getRanking: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      if (
        req.query.name != null &&
        typeof req.query.name === "string" &&
        !checkNameValide(req.query.name)
      ) {
        return sendError(res, 400, "Invalid army name");
      }

      const currentArmyName =
        typeof req.query.name === "string" ? req.query.name : null;

      const users = await prisma.user.findMany({
        orderBy: {
          power: "desc",
        },
        take: 25,
        include: {
          troopers: true,
          sponsoredUsers: true,
        },
      });

      let currentUser: (typeof users)[number] | null = null;

      if (
        currentArmyName &&
        !users.some((x) => x.armyName === currentArmyName)
      ) {
        currentUser = await prisma.user.findFirst({
          where: {
            armyName: currentArmyName,
          },
          include: {
            troopers: true,
            sponsoredUsers: true,
          },
        });
      }

      const toRanking = (
        user: (typeof users)[number],
        rank: number | null,
        isOwner: boolean,
      ): UserRanking => ({
        rank,
        armyName: user.armyName,
        power: user.power,
        faction: user.color,
        size: user.troopers.length,
        recruits: user.sponsoredUsers.length,
        gold: isOwner ? user.gold : null,
        isOwner,
      });

      const formattedUsers: UserRanking[] = users.map((user) =>
        toRanking(user, null, user.armyName === currentArmyName),
      );

      if (currentUser) {
        const armyRanking =
          (await prisma.user.count({
            where: {
              power: {
                gt: currentUser.power,
              },
            },
          })) + 1;

        formattedUsers.push(toRanking(currentUser, armyRanking, true));
      }

      return res.send(formattedUsers);
    } catch (error) {
      console.error(error);
      return sendError(res, 500, "Failed to load ranking");
    }
  },
};

export default Utils;
