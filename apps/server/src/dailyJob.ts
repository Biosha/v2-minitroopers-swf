import { PrismaClient } from "@minitroopers/prisma";
import { initTrooperDay } from "./utils/TrooperDay.js";

const dailyJob = (prisma: PrismaClient) => async () => {
  try {
    // Generate new Today Troopers
    await initTrooperDay(prisma);
  } catch (error: unknown) {
    console.error(error);
  }
};

export default dailyJob;
