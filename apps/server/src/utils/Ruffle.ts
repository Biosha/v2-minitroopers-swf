import { FightResult } from "@minitroopers/prisma";
import { ChildProcess, spawn } from "child_process";
import { existsSync } from "fs";
import os from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Env from "../Env.js";

export class Ruffle {
  isWindows = os.platform() === "win32";

  SWFPATH = Env.SWF_PATH;
  MAX_CONCURRENT = Env.MAX_CONCURRENT;
  TIMEOUT = Env.TIMEOUT;

  runningProcesses = 0;
  queue: Array<(value: boolean) => void> = [];

  static verifyBinaries(swfPath: string): void {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rufflePath = join(
      __dirname,
      "..",
      "bin",
      process.platform === "win32" ? "ruffle_desktop.exe" : "ruffle_desktop",
    );

    if (!swfPath || !existsSync(swfPath)) {
      console.warn(
        `[ruffle] SWF not found at "${swfPath}". Set SWF_PATH or deploy assets.`,
      );
    }
    if (!existsSync(rufflePath)) {
      console.warn(`[ruffle] Binary not found at "${rufflePath}".`);
    }
  }

  async waitForSlot() {
    return new Promise<void>((resolve) => {
      if (this.runningProcesses < this.MAX_CONCURRENT) {
        this.runningProcesses++;
        resolve();
      } else {
        this.queue.push(() => {
          this.runningProcesses++;
          resolve();
        });
      }
    });
  }

  killProcess(pid: number) {
    try {
      if (this.isWindows) {
        process.kill(pid);
      } else {
        process.kill(-pid);
      }
    } catch {
      // process may already be gone
    }
  }

  releaseSlot() {
    if (this.runningProcesses <= 0) {
      this.runningProcesses = 0;
      return;
    }

    this.runningProcesses--;

    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next(true);
    }
  }

  async runBattle(flashvars: string): Promise<{
    result: FightResult;
    graveyard: number[];
  }> {
    await this.waitForSlot();

    return new Promise((resolve, reject) => {
      let graveyard: number[] | null = null;
      let battleResult: number | null = null;
      let slotReleased = false;
      let child: ChildProcess | undefined;

      const safeReleaseSlot = () => {
        if (!slotReleased) {
          slotReleased = true;
          this.releaseSlot();
        }
      };

      const cleanup = (timeoutId?: NodeJS.Timeout) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (child?.pid) {
          this.killProcess(child.pid);
        }
      };

      const checkResults = (timeoutId: NodeJS.Timeout) => {
        if (battleResult !== null && graveyard !== null) {
          cleanup(timeoutId);
          safeReleaseSlot();
          resolve({
            graveyard,
            result: battleResult ? FightResult.lose : FightResult.win,
          });
        }
      };

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const rufflePath = join(
        __dirname,
        "..",
        "bin",
        this.isWindows ? "ruffle_desktop.exe" : "ruffle_desktop",
      );

      const flashvarsDecoded = decodeURIComponent(flashvars);

      if (this.isWindows) {
        child = spawn(rufflePath, [
          this.SWFPATH,
          "-P",
          flashvarsDecoded,
          "--dummy-external-interface",
        ]);
      } else {
        child = spawn(
          "xvfb-run",
          [
            "-a",
            rufflePath,
            this.SWFPATH,
            "-P",
            flashvarsDecoded,
            "--dummy-external-interface",
          ],
          { detached: true },
        );
      }

      const timeoutId = setTimeout(() => {
        cleanup(timeoutId);
        safeReleaseSlot();
        reject(new Error("Battle simulation timed out"));
      }, this.TIMEOUT);

      const onExit = () => {
        cleanup(timeoutId);
        safeReleaseSlot();
      };
      process.once("exit", onExit);

      child.stdout?.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (!line.includes("battleResult")) {
            continue;
          }

          const listMatch = line.match(/List\(\[(.*?)\]\)/);
          if (listMatch) {
            const content = listMatch[1];
            const numMatches = content.match(/Number\(([\d.]+)\)/g);
            graveyard = numMatches
              ? numMatches.map((n: string) => parseFloat(n.match(/[\d.]+/)![0]))
              : [];
            checkResults(timeoutId);
            continue;
          }

          const number = line.match(/Number\(([\d.]+)\)/);
          if (number) {
            battleResult = parseInt(number[1], 10);
            checkResults(timeoutId);
          }
        }
      });

      child.stderr?.on("data", (data) => {
        const output = data.toString();
        if (/error/i.test(output)) {
          console.error("[ruffle] stderr:", output.slice(0, 500));
        }
      });

      child.once("error", (err) => {
        process.off("exit", onExit);
        cleanup(timeoutId);
        safeReleaseSlot();
        reject(new Error(`Failed to start Ruffle process: ${err.message}`));
      });

      child.once("exit", (code) => {
        process.off("exit", onExit);
        cleanup(timeoutId);
        if (code !== 0 && battleResult === null) {
          safeReleaseSlot();
          reject(new Error(`Ruffle process exited with code ${code}`));
        }
      });
    });
  }
}
