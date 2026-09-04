import { FightResult, MissionType, PrismaClient } from "@minitroopers/prisma";
import {
  BackgroundType,
  ClientMode,
  getMissionState,
  getTrooperPref,
  objectObfuscator,
  Rand,
  randomMinMax,
  RatSkills,
  Serializer,
  SkillEnum,
  TrooperType,
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
  IncludeAllUserData,
} from "../utils/UserHelper.js";

const Missions = {
  createMission:
    (prisma: PrismaClient, ruffle: Ruffle) =>
    async (req: Request, res: Response) => {
      try {
        if (
          !req.body.missionType ||
          typeof req.body.missionType !== "string" ||
          !["exterminate", "infiltrate"].includes(req.body.missionType)
        ) {
          return sendError(res, 400, "Invalid mission type");
        }
        const missionType: MissionType = req.body.missionType;

        const user = await auth(prisma, req);

        if (!Env.DISABLE_GAME_LIMITS) {
          if (
            !getMissionState(user.missions, missionType).some(
              (x) => x === "pending",
            )
          ) {
            return sendError(res, 400, "No missions left");
          }
        }

        const { returnedUser, missionId } = await generateMission(
          user,
          missionType,
          prisma,
          ruffle,
        );

        return res.send({
          user: sanitizeUser(returnedUser),
          fightId: missionId,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create mission";
        return sendError(res, 400, message);
      }
    },

  getMission: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      const missionId = req.query.missionId;

      if (!missionId || typeof missionId !== "string") {
        return sendError(res, 400, "Invalid mission id");
      }

      const mission = await prisma.mission.findFirst({
        where: {
          id: missionId,
        },
      });

      if (!mission) {
        return sendError(res, 404, "Mission not found");
      }

      return res.send({
        data: mission.missionInputSWFData,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load mission";
      return sendError(res, 400, message);
    }
  },
};

const generateMission = async (
  user: UserExtended,
  missionType: MissionType,
  prisma: PrismaClient,
  ruffle: Ruffle,
) => {
  switch (missionType) {
    case "exterminate":
      return generateMissionExterminate(user, prisma, ruffle);
    case "infiltrate":
      return generateMissionInfiltrate(user, prisma, ruffle);
    case "epic":
      throw new Error("Epic missions are not implemented");
    default:
      throw new Error("Invalid mission type");
  }
};

const generateMissionExterminate = async (
  user: UserExtended,
  prisma: PrismaClient,
  ruffle: Ruffle,
) => {
  if (user.exterminationUnlockAt == null) {
    throw new Error("Mission not unlocked");
  }

  const flashvars = "data=" + generateBattleDataExterminate(user);
  const simulateData = await ruffle.runBattle(flashvars);

  return prisma.$transaction(async (tx) => {
    const mission = await tx.mission.create({
      data: {
        userId: user.id,
        type: MissionType.exterminate,
        result: simulateData.result,
        missionInputSWFData: flashvars,
      },
    });

    const returnedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        gold: {
          increment: simulateData.result === FightResult.win ? 4 : 0,
        },
        ratsCount: {
          increment: simulateData.result === FightResult.win ? 1 : 0,
        },
        missions: {
          connect: mission,
        },
      },
      include: IncludeAllUserData(),
    });

    return {
      returnedUser,
      missionId: mission.id,
      swfData: flashvars,
    };
  });
};

const generateBattleDataExterminate = (user: UserExtended) => {
  const leftTrooperIndexes = user.troopers.map((trooper, index) => index);

  const rats = { troopers: generatesRats(user) };

  const rightTrooperIndexes = rats.troopers.map(
    (_trooper, index) => index + user.troopers.length,
  );

  const rand = new Rand();
  rand.initSeed(BigInt(Date.now() + randomMinMax(1, 999)), 7);
  const seed = 10000000 + rand.random(90000000);

  const data = {
    mode: ClientMode.BATTLE(
      {
        id: seed,
        bg: {
          gfx: "bg/attic.jpg",
          id: BackgroundType.BG_ATTIC,
        },
        armies: [
          {
            troopers: user.troopers.map((trooper, index) => ({
              name: trooper.name,
              seed: trooper.seed,
              type: TrooperType.HUMAN,
              id: index,
              choices: trooper.choices ?? [],
              force: [],
              pref: getTrooperPref(trooper),
            })),
            faction: user.color,
            __UP2: leftTrooperIndexes,
          },
          {
            troopers: rats.troopers.map((rat, index) => ({
              name: "Rat",
              seed: rat.seed,
              type: TrooperType.RAT,
              id: index + user.troopers.length,
              choices: [],
              force: rat.skills.map(
                (skill) => new SkillEnum(SkillEnum.__construct__[skill], skill),
              ),
              pref: null,
            })),
            faction: 0,
            __UP2: rightTrooperIndexes,
          },
        ],
      },
      0,
    ),
    gfx: Env.SELF_URL + `/assets/swf/army.swf`,
  };

  const obfuscatedData = objectObfuscator(data);
  const serialized = Serializer.serialize(obfuscatedData);
  return encodeURIComponent(serialized);
};

const generatesRats = (user: UserExtended) => {
  const ratsCount = user.ratsCount + 1;

  const rand = new Rand();
  rand.initSeed(BigInt(Date.now()));

  return Array(ratsCount)
    .fill(null)
    .map(() => {
      const ratSeed = rand.random(90000000) + 10000000;

      const availableSkills = [...RatSkills];
      const selectedSkills: number[] = [];

      for (let i = 0; i < 2; i++) {
        const skillIndex = rand.random(availableSkills.length);
        selectedSkills.push(availableSkills[skillIndex]);
        availableSkills.splice(skillIndex, 1);
      }
      return {
        seed: ratSeed,
        skills: selectedSkills,
      };
    });
};

const generateMissionInfiltrate = async (
  user: UserExtended,
  prisma: PrismaClient,
  ruffle: Ruffle,
) => {
  if (user.infiltrationUnlockAt == null) {
    throw new Error("Mission not unlocked");
  }

  const generatedMission = await generateBattleDataInfiltrate(
    prisma,
    user,
    ruffle,
  );

  return prisma.$transaction(async (tx) => {
    const mission = await tx.mission.create({
      data: {
        userId: user.id,
        type: MissionType.infiltrate,
        result: generatedMission.result,
        missionInputSWFData: generatedMission.data,
      },
    });

    const returnedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        gold: {
          increment: generatedMission.result === FightResult.win ? 4 : 0,
        },
        missions: {
          connect: mission,
        },
      },
      include: IncludeAllUserData(),
    });

    return {
      returnedUser,
      missionId: mission.id,
      swfData: generatedMission.data,
    };
  });
};

const generateBattleDataInfiltrate = async (
  prisma: PrismaClient,
  user: UserExtended,
  ruffle: Ruffle,
) => {
  const opponent = await findInfiltrateOpponent(prisma, user);

  if (!opponent) {
    throw new Error("No infiltration opponent available");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      infiltrationOpponentDate: new Date(),
      infiltrationOpponentArmy: opponent.id,
    },
  });

  const flashvars =
    "data=" +
    generateBattleData(user, opponent, {
      gfx: "bg/sewer.jpg",
      id: BackgroundType.BG_SEWER,
    });

  const simulateData = await ruffle.runBattle(flashvars);

  return {
    result: simulateData.result,
    data: flashvars,
  };
};

const findInfiltrateOpponent = async (
  prisma: PrismaClient,
  user: UserExtended,
): Promise<UserExtended | null> => {
  const now = new Date();
  if (
    user.infiltrationOpponentDate &&
    user.infiltrationOpponentArmy &&
    now.getDate() == user.infiltrationOpponentDate.getDate() &&
    now.getMonth() == user.infiltrationOpponentDate.getMonth() &&
    now.getFullYear() == user.infiltrationOpponentDate.getFullYear()
  ) {
    const opponent = (await prisma.user.findFirst({
      where: {
        id: user.infiltrationOpponentArmy,
      },
      include: IncludeAllUserData(),
    })) as UserExtended | null;
    return opponent;
  }

  const minPower = user.power;
  const maxPower = user.power * 2;

  const randomUserWithTroopers = await prisma.user.findFirst({
    where: {
      power: {
        gte: minPower,
        lte: maxPower,
      },
      id: {
        not: user.id,
      },
      troopers: {
        some: {},
      },
    },
    include: {
      troopers: true,
    },
  });

  if (randomUserWithTroopers) {
    return randomUserWithTroopers as UserExtended;
  }

  const rdUser = await prisma.user.findFirst({
    where: {
      id: {
        not: user.id,
      },
      troopers: {
        some: {},
      },
    },
    include: {
      troopers: true,
    },
  });

  return rdUser as UserExtended | null;
};

export default Missions;
