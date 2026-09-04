import * as dotenv from "dotenv";

dotenv.config();

const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value === "true" || value === "1";
};

const parseNumber = (
  value: string | undefined,
  defaultValue: number,
): number => {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric environment variable: ${value}`);
  }
  return parsed;
};

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProduction = NODE_ENV === "production";

const ETWIN_CLIENT_SECRET = process.env.ETWIN_CLIENT_SECRET ?? "dev";

if (isProduction) {
  if (!process.env.ETWIN_CLIENT_SECRET || ETWIN_CLIENT_SECRET === "dev") {
    throw new Error("ETWIN_CLIENT_SECRET must be set in production");
  }
}

const selfUrl = (process.env.SELF_URL ?? "http://localhost:4200").replace(
  /\/$/,
  "",
);

const Env = {
  NODE_ENV,
  isProduction,
  PORT: parseNumber(process.env.PORT, 3000),
  SELF_URL: selfUrl,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://eternaltwin.dev.admin:dev@localhost:5432/minitroopers?schema=public",

  ETWIN_URL: process.env.ETWIN_URL ?? "http://localhost:50321/",
  ETWIN_CLIENT_ID: process.env.ETWIN_CLIENT_ID ?? "minitroopers@clients",
  ETWIN_CLIENT_SECRET,

  DEBUG_QUERIES: parseBoolean(process.env.DEBUG_QUERIES, false),

  SWF_PATH: process.env.SWF_PATH ?? "",
  MAX_CONCURRENT: parseNumber(process.env.MAX_CONCURRENT, 20),
  TIMEOUT: parseNumber(process.env.TIMEOUT, 35000),

  /** When false, fight/mission daily limits are enforced server-side */
  DISABLE_GAME_LIMITS: parseBoolean(
    process.env.DISABLE_GAME_LIMITS,
    !isProduction,
  ),

  TRUST_PROXY: parseBoolean(process.env.TRUST_PROXY, isProduction),
};

export default Env;
