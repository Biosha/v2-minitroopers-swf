import { FightResult, PrismaClient } from "@minitroopers/prisma";
import {
  BackgroundType,
  ClientMode,
  getTrooperPref,
  objectObfuscator,
  Rand,
  randomMinMax,
  Serializer,
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
  getRaidTroopers,
  IncludeAllUserData,
} from "../utils/UserHelper.js";

const Raids = {
  createRaid:
    (prisma: PrismaClient, ruffle: Ruffle) =>
    async (req: Request, res: Response) => {
      try {
        const user = await auth(prisma, req);

        const { troopers } = await getRaidTroopers(prisma, user.armyName);

        if (troopers?.length <= 0 || user.raids.length >= 20) {
          return sendError(res, 400, "No raid left");
        }

        const { returnedUser, raidId, swfData } = await generateRaid(
          user,
          prisma,
          ruffle,
          troopers,
        );

        return res.send({
          user: sanitizeUser(returnedUser),
          raidId,
          swfData,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create raid";
        return sendError(res, 400, message);
      }
    },
};

const generateRaid = async (
  user: UserExtended,
  prisma: PrismaClient,
  ruffle: Ruffle,
  affiliatedTroopers: string[],
) => {
  const flashvars =
    "data=" + (await generateBattleDataRaid(user, affiliatedTroopers, prisma));
  const simulateData = await ruffle.runBattle(flashvars);

  return prisma.$transaction(async (tx) => {
    const raid = await tx.raid.create({
      data: {
        userId: user.id,
        result: simulateData.result,
        graveyard: simulateData.graveyard
          .map((x) => {
            if (x < affiliatedTroopers.length) {
              return affiliatedTroopers[x];
            }
            return null;
          })
          .filter((x) => x != null) as string[],
      },
    });

    const returnedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        gold: {
          increment: simulateData.result === FightResult.win ? 4 : 0,
        },
        raids: {
          connect: { id: raid.id },
        },
      },
      include: IncludeAllUserData(),
    });

    return {
      returnedUser,
      raidId: raid.id,
      swfData: flashvars,
    };
  });
};

const generateBattleDataRaid = async (
  user: UserExtended,
  affiliatedTroopers: string[],
  prisma: PrismaClient,
) => {
  const armyTroopers = await prisma.trooper.findMany({
    where: {
      id: {
        in: affiliatedTroopers,
      },
    },
  });

  const leftTrooperIndexes = armyTroopers.map((trooper, index) => index);

  const raidPower = calculateRaidPower(user.raids.length + 1);

  const range = getRaidTrooperRange(user.raids.length + 1);

  const opponents = {
    troopers: generatesOpponents(raidPower, range.min, range.max),
  };

  const rightTrooperIndexes = opponents.troopers.map(
    (_trooper, index) => index + armyTroopers.length,
  );

  const rand = new Rand();
  rand.initSeed(BigInt(Date.now() + randomMinMax(1, 999)), 7);
  const seed = 10000000 + rand.random(90000000);

  const data = {
    mode: ClientMode.BATTLE(
      {
        id: seed,
        bg: {
          gfx: "bg/wood.jpg",
          id: BackgroundType.BG_WOOD,
        },
        armies: [
          {
            troopers: armyTroopers.map((trooper, index) => ({
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
            troopers: opponents.troopers.map((trooper, index) => ({
              name: "Fighter",
              seed: trooper.seed,
              type: TrooperType.HUMAN,
              id: index + user.troopers.length,
              choices: trooper.choices,
              force: [],
              pref: null,
            })),
            faction: randomMinMax(0, 5),
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

const generatesOpponents = (raidPower: number, min: number, max: number) => {
  const rand = new Rand();
  rand.initSeed(BigInt(Date.now()));

  const { levels, troopers } = generateRandomArmyComposition(
    raidPower,
    min,
    max,
  );

  return Array(troopers)
    .fill(null)
    .map((_, index) => {
      const trooperSeed = rand.random(90000000) + 10000000;
      const trooperLevel = levels[index];

      return {
        seed: trooperSeed,
        level: trooperLevel,
        choices: new Array(trooperLevel - 1).fill(0),
      };
    });
};

const calculateRaidPower = (phase: number) => {
  const coefficients = [0.07556333, 2.28671329, 1.07362082, 11.1958042];
  const index = phase - 1;

  return Math.round(
    coefficients[0] * Math.pow(index, 3) +
      coefficients[1] * Math.pow(index, 2) +
      coefficients[2] * index +
      coefficients[3],
  );
};

const getRaidTrooperRange = (phase: number) => {
  if (phase <= 2) return { min: 1, max: 2 };
  if (phase === 3) return { min: 1, max: 4 };
  if (phase === 4) return { min: 3, max: 6 };
  if (phase === 5) return { min: 4, max: 9 };
  if (phase === 6) return { min: 7, max: 13 };
  if (phase === 7) return { min: 10, max: 16 };
  if (phase === 8) return { min: 16, max: 24 };
  if (phase === 9) return { min: 19, max: 29 };
  if (phase === 10) return { min: 29, max: 32 };
  return { min: 32, max: 32 };
};

const generateRandomArmyComposition = (
  targetPower: number,
  minTroopers: number,
  maxTroopers: number,
) => {
  const absoluteMinTroopers = Math.ceil(targetPower / 54);
  const absoluteMaxTroopers = Math.floor(targetPower / 5);

  let finalMinTroopers = Math.ceil(
    minTroopers !== null
      ? Math.max(minTroopers, absoluteMinTroopers)
      : absoluteMinTroopers,
  );
  const finalMaxTroopers = Math.floor(
    maxTroopers !== null
      ? Math.min(maxTroopers, absoluteMaxTroopers)
      : absoluteMaxTroopers,
  );

  if (finalMaxTroopers < finalMinTroopers) {
    finalMinTroopers = finalMaxTroopers;
  }

  const rand = new Rand();
  rand.initSeed(BigInt(new Date().getTime()));

  const numTroopers =
    finalMinTroopers + rand.random(finalMaxTroopers - finalMinTroopers + 1);

  let remainingPower = targetPower - 4 * numTroopers - numTroopers;
  const levels = new Array(numTroopers).fill(1);

  while (remainingPower > 0) {
    const availableTroopers = levels
      .map((level, index) => (level < 50 ? index : -1))
      .filter((i) => i !== -1);
    if (availableTroopers.length === 0) break;
    const randomIndex = rand.random(availableTroopers.length);
    const trooperIndex = availableTroopers[randomIndex];
    levels[trooperIndex]++;
    remainingPower--;
  }

  const sortedLevels = [...levels].sort((a, b) => {
    return rand.random(100) < 80 ? b - a : a - b;
  });

  return {
    troopers: numTroopers,
    levels: sortedLevels,
  };
};

export default Raids;
