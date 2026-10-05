import { PrismaClient } from "@minitroopers/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import compression from "compression";
import cors from "cors";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import schedule from "node-schedule";
import dailyJob from "./dailyJob.js";
import Env from "./Env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import initRoutes from "./routes.js";
import { Ruffle } from "./utils/Ruffle.js";
import { initTrooperDay } from "./utils/TrooperDay.js";
import ServerState from "./utils/ServerState.js";

const adapter = new PrismaPg({ connectionString: Env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "warn" },
  ],
});

if (Env.DEBUG_QUERIES) {
  prisma.$on("query", (e) => {
    console.warn(`Query: ${e.query}`);
    console.warn(`Params: ${e.params}`);
    console.warn(`Duration: ${e.duration}ms`);
  });
}

const app: Express = express();

if (Env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  cors({
    origin: Env.SELF_URL,
    credentials: true,
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Env.isProduction ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
});

const battleLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Env.isProduction ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use(
  [
    "/api/fight/createFight",
    "/api/mission/createMission",
    "/api/raid/createRaid",
  ],
  battleLimiter,
);

const bootstrap = async () => {
  ServerState.setReady(false);

  try {
    await initTrooperDay(prisma);
    const ruffle = new Ruffle();
    Ruffle.verifyBinaries(Env.SWF_PATH);
    initRoutes(app, prisma, ruffle);
    app.use(errorHandler);

    const port = Env.PORT;
    app.listen(port, () => {
      ServerState.setReady(true);
      console.log(`[server]: Server is running at http://localhost:${port}`);
      schedule.scheduleJob("0 0 * * *", dailyJob(prisma));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async () => {
  ServerState.setReady(false);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await bootstrap();
