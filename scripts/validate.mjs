import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/girls");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".webp"));

for (const f of files.slice(0, 3)) {
  const buf = fs.readFileSync(path.join(dir, f));
  const header = buf.slice(0, 8).toString("hex");
  console.log(`${f}: header=0x${header}, size=${buf.length}`);
}
