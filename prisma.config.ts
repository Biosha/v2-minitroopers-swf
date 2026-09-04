import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "packages/prisma/schema.prisma",
  migrations: {
    path: "packages/prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://eternaltwin.dev.admin:dev@localhost:5432/minitroopers?schema=public",
  },
});
