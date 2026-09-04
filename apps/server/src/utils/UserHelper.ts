import { Prisma, PrismaClient } from "@minitroopers/prisma";
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
import { Request } from "express";
import Env from "../Env.js";

export const auth = async (prisma: PrismaClient, request: Request) => {
  const {
    headers: { authorization },
  } = request;

  if (!authorization) {
    throw new Error("You are not logged in");
  }
  if (typeof authorization !== "string") {
    throw new Error("Invalid authorization header");
  }

  const [id, token] = Buffer.from(authorization.split(" ")[1], "base64")
    .toString()
    .split(":");

  if (!id || !token || id === "null" || token === "null") {
    throw new Error("Invalid authorization header content");
  }

  return afterauth(prisma, request, id, token);
};

const LAST_CONNEXION_THROTTLE_MS = 5 * 60 * 1000;

/** Client IP using Express `trust proxy` (never trust X-Forwarded-For directly). */
export const getClientIp = (request: Request): string | undefined => {
  const ip = request.ip || request.socket.remoteAddress;
  return typeof ip === "string" && ip.length > 0 ? ip : undefined;
};

const afterauth = async (
  prisma: PrismaClient,
  request: Request,
  id: string,
  token: string,
) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      connexionToken: token,
    },
    include: {
      ...IncludeAllUserData(),
      ipAddressUser: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const newIp = getClientIp(request);
  const knownIps = user.ipAddressUser.map((x) => x.ip);
  const ipChanged = Boolean(newIp && !knownIps.includes(newIp));
  const lastConnexionStale =
    Date.now() - new Date(user.lastConnexion).getTime() >
    LAST_CONNEXION_THROTTLE_MS;

  if (ipChanged || lastConnexionStale) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastConnexion: new Date(),
        ...(ipChanged && newIp
          ? {
              ipAddressUser: {
                create: { ip: newIp },
              },
            }
          : {}),
      },
    });
  }

  delete (user as Partial<UserExtended>).ipAddressUser;
  delete (user as Partial<UserExtended>).connexionToken;
  return user;
};

export const IncludeAllUserData = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    troopers: {
      orderBy: {
        createdAt: "asc" as Prisma.SortOrder,
      },
    },
    history: {
      take: 5,
      select: {
        options: true,
        type: true,
        ts: true,
      },
      orderBy: {
        ts: "desc" as Prisma.SortOrder,
      },
    },
    fights: {
      take: 5,
      select: {
        id: true,
        result: true,
        ts: true,
        opponentName: true,
      },
      where: {
        ts: {
          gte: today,
        },
      },
      orderBy: {
        ts: "desc" as Prisma.SortOrder,
      },
    },
    missions: {
      where: {
        ts: {
          gte: today,
        },
      },
      orderBy: {
        ts: "desc" as Prisma.SortOrder,
      },
      select: {
        id: true,
        type: true,
        result: true,
        ts: true,
      },
    },
    raids: {
      take: 20,
      select: {
        id: true,
        result: true,
        graveyard: true,
        ts: true,
      },
      where: {
        ts: {
          gte: today,
        },
      },
      orderBy: {
        ts: "desc" as Prisma.SortOrder,
      },
    },
  };
};

export const generateBattleData = (
  leftArmy: UserExtended,
  rightArmy: Omit<UserExtended, "history" | "fights">,
  background = {
    gfx: "bg/garden.jpg",
    id: BackgroundType.BG_GARDEN,
  },
) => {
  const leftTrooperIndexes = leftArmy.troopers.map((trooper, index) => index);
  const rightTrooperIndexes = rightArmy.troopers.map(
    (trooper, index) => index + leftArmy.troopers.length,
  );

  const rand = new Rand();
  rand.initSeed(BigInt(Date.now() + randomMinMax(1, 999)), 7);
  const seed = 10000000 + rand.random(90000000);

  const battle = {
    seed: seed,
  };

  // Create the base data structure for battle view
  const data = {
    mode: ClientMode.BATTLE(
      // First parameter: battle configuration object
      {
        id: battle.seed, // Battle seed
        bg: background,
        armies: [
          {
            troopers: leftArmy.troopers.map((trooper, index) => ({
              name: trooper.name,
              seed: trooper.seed,
              type: TrooperType.HUMAN,
              id: index, // Sequential index starting from 0
              choices: trooper.choices ?? [],
              force: [],
              pref: getTrooperPref(trooper),
            })),
            faction: leftArmy.color,
            __UP2: leftTrooperIndexes, // Order of appearance for left army
          },
          {
            troopers: rightArmy.troopers.map((trooper, index) => ({
              name: trooper.name,
              seed: trooper.seed,
              type: TrooperType.HUMAN,
              id: index + leftArmy.troopers.length, // Continue sequence from left army
              choices: trooper.choices ?? [],
              force: [],
              pref: getTrooperPref(trooper),
            })),
            faction: rightArmy.color,
            __UP2: rightTrooperIndexes, // Order of appearance for right army
          },
        ],
      },
      // Second parameter: attacking army (0 for left, 1 for right)
      0,
    ),
    gfx: Env.SELF_URL + `/assets/swf/army.swf`,
  };

  const obfuscatedData = objectObfuscator(data);

  const serialized = Serializer.serialize(obfuscatedData);

  return encodeURIComponent(serialized);
};

export const getRaidTroopers = async (
  prisma: PrismaClient,
  armyName: string,
) => {
  const user = await prisma.user.findFirst({
    where: {
      armyName: armyName,
    },
    include: {
      ...IncludeAllUserData(),
      sponsoredUsers: {
        include: {
          troopers: true,
        },
      },
    },
  });

  if (!user || user.troopers.length == 0) {
    throw new Error();
  }

  const troopers: string[] = [];

  const troopersInGraveyard = user.raids.map((x) => x.graveyard).flat();
  if (!troopersInGraveyard.includes(user.troopers[0].id)) {
    troopers.push(user.troopers[0].id);
  }

  for (const affiliatedUser of user.sponsoredUsers) {
    if (
      affiliatedUser.troopers.length &&
      !troopersInGraveyard.includes(affiliatedUser.troopers[0].id)
    ) {
      troopers.push(affiliatedUser.troopers[0].id);
    }
  }

  const level = user.raids.length + 1;

  return { troopers, level };
};
