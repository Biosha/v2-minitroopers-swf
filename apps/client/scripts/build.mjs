import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: join(clientRoot, "../../.env") });

const args = ["build", ...process.argv.slice(2)];
if (process.env.SELF_URL) {
  args.push("--define", `SELF_URL=${JSON.stringify(process.env.SELF_URL)}`);
}

const result = spawnSync("ng", args, {
  cwd: clientRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
