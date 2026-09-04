import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(clientRoot, "../../node_modules/@ruffle-rs/ruffle");
const dest = join(clientRoot, "src/assets/ruffle");

mkdirSync(dest, { recursive: true });
cpSync(source, dest, {
  recursive: true,
  filter: (src) => {
    const name = src.replace(/\\/g, "/");
    if (name.endsWith("/@ruffle-rs/ruffle") || name.endsWith("/ruffle")) {
      return true;
    }
    return /\.(js|wasm|map)$/.test(name);
  },
});
