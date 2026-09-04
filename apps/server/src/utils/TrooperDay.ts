import { PrismaClient } from "@minitroopers/prisma";
import { Names } from "./Names.js";

export const initTrooperDay = async (prisma: PrismaClient) => {
  await prisma.trooperDay.deleteMany();
  await generateTodayTroopers(prisma);
  console.log("init today trooper");
  return;
};

export const generateTodayTroopers = async (prisma: PrismaClient) => {
  await prisma.trooperDay.deleteMany({});
  let i: number = 0;
  do {
    await createTrooperDay(prisma);
    i++;
  } while (i < 5);
  return;
};

const createTrooperDay = async (prisma: PrismaClient) => {
  let timeout: number = 0;

  let newSeed = generateRandomSeed();

  while (
    (await prisma.trooperDay.findFirst({
      where: {
        seed: newSeed,
      },
      select: {
        seed: true,
      },
    })) &&
    timeout < 10
  ) {
    newSeed = generateRandomSeed();
    timeout++;
  }

  await prisma.trooperDay.create({
    data: {
      name: generateRandomName(),
      seed: newSeed,
    },
  });

  return;
};

const generateRandomName = (): string => {
  const availableNames = Names;
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

const generateRandomSeed = (): number => {
  const dayTimestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  return Number("" + dayTimestamp + Math.floor(Math.random() * 1000));
};
