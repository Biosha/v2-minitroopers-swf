import { FightResult, PrismaClient } from "@minitroopers/prisma";
import {
  checkNameValide,
  getFightState,
  parseToPartialUser,
  PowerDiff,
  shuffle,
  UserExtended,
} from "@minitroopers/shared";
import { Request, Response } from "express";
import Env from "../Env.js";
import { sendError } from "../utils/httpErrors.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { Ruffle } from "../utils/Ruffle.js";
import {
  auth,
  generateBattleData,
  getRaidTroopers,
  IncludeAllUserData,
} from "../utils/UserHelper.js";

const Fights = {
  getOpponents:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        const user = await auth(prisma, req);

        if (!Env.DISABLE_GAME_LIMITS) {
          if (!getFightState(user.fights).some((x) => x === "pending")) {
            return sendError(res, 400, "No fight left");
          }
        }

        const alreadySeens = user.fights.map((x) => x.opponentName);
        alreadySeens.push(user.armyName);

        const users = await prisma.user.findMany({
          where: {
            armyName: {
              notIn: alreadySeens,
            },
            power: Env.DISABLE_GAME_LIMITS
              ? {}
              : {
                  gte: user.power - PowerDiff,
                  lte: user.power + PowerDiff,
                },
          },
          orderBy: {
            power: "asc",
          },
          take: 10,
          include: {
            troopers: true,
          },
        });

        const opponents = shuffle(users)
          .slice(0, 4)
          .map((x) => parseToPartialUser(x));

        return res.send({ opponents });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load opponents";
        return sendError(res, 401, message);
      }
    },

  createFight:
    (prisma: PrismaClient, ruffle: Ruffle) =>
    async (req: Request, res: Response) => {
      try {
        if (
          !req.body.opponentName ||
          typeof req.body.opponentName !== "string" ||
          !checkNameValide(req.body.opponentName)
        ) {
          return sendError(res, 400, "Invalid opponent");
        }

        const user = await auth(prisma, req);

        if (!Env.DISABLE_GAME_LIMITS) {
          if (!getFightState(user.fights).some((x) => x === "pending")) {
            return sendError(res, 400, "No fight left");
          }
        }

        const opponent = await prisma.user.findFirst({
          where: {
            armyName: {
              equals: req.body.opponentName as string,
              mode: "insensitive",
            },
          },
          include: {
            troopers: true,
          },
        });

        if (!opponent) {
          return sendError(res, 404, "Opponent not found");
        }

        if (opponent.armyName.toLowerCase() === user.armyName.toLowerCase()) {
          return sendError(res, 400, "Cannot fight yourself");
        }

        const alreadyFought = user.fights.some(
          (fight) =>
            fight.opponentName?.toLowerCase() ===
            opponent.armyName.toLowerCase(),
        );
        if (!Env.DISABLE_GAME_LIMITS && alreadyFought) {
          return sendError(res, 400, "Already fought this opponent today");
        }

        if (
          !Env.DISABLE_GAME_LIMITS &&
          (opponent.power < user.power - PowerDiff ||
            opponent.power > user.power + PowerDiff)
        ) {
          return sendError(res, 400, "Opponent power difference too large");
        }

        const { returnedUser, fightId } = await generateFight(
          user,
          opponent as UserExtended,
          prisma,
          ruffle,
        );

        return res.send({ user: sanitizeUser(returnedUser), fightId });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create fight";
        return sendError(res, 400, message);
      }
    },

  getFight: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      const fightId = req.query.fightId;

      if (!fightId || typeof fightId !== "string") {
        return sendError(res, 400, "Invalid fight id");
      }

      const fight = await prisma.fight.findFirst({
        where: {
          id: fightId,
        },
      });

      if (!fight) {
        return sendError(res, 404, "Fight not found");
      }

      return res.send({
        left: {
          armyName: fight.userName,
          prefix: fight.userPrefix,
        },
        right: {
          armyName: fight.opponentName,
          prefix: fight.opponentPrefix,
        },
        data: fight.fightInputSWFData,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load fight";
      return sendError(res, 400, message);
    }
  },

  getTroopersRaid:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        const user = await auth(prisma, req);

        const { troopers, level } = await getRaidTroopers(
          prisma,
          user.armyName,
        );
        return res.send({ troopers, level });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load raid troopers";
        return sendError(res, 401, message);
      }
    },
};

const generateFight = async (
  user: UserExtended,
  opponent: Omit<UserExtended, "history" | "fights">,
  prisma: PrismaClient,
  ruffle: Ruffle,
) => {
  const flashvars = "data=" + generateBattleData(user, opponent);
  const simulateData = await ruffle.runBattle(flashvars);

  return prisma.$transaction(async (tx) => {
    const fight = await tx.fight.create({
      data: {
        userId: user.id,
        userName: user.armyName,
        userPrefix: user.prefix,
        opponentName: opponent.armyName,
        opponentPrefix: opponent.prefix,
        result: simulateData.result,
        fightInputSWFData: flashvars,
      },
    });

    const returnedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        gold: {
          increment: simulateData.result === FightResult.win ? 2 : 1,
        },
        fights: {
          connect: fight,
        },
        history: {
          create: {
            type: "war",
            options: {
              result: simulateData.result,
              opponent: {
                armyName: opponent.armyName,
                prefix: opponent.prefix,
              },
              fightId: fight.id,
            },
          },
        },
      },
      include: IncludeAllUserData(),
    });

    return {
      returnedUser,
      fightId: fight.id,
      swfData: flashvars,
    };
  });
};

export default Fights;
