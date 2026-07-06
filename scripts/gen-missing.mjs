import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/girls");

const SUFFIX = "looking at camera, soft lighting, professional photoshoot, photorealistic, highly detailed skin texture, 8K, RAW photo";

const maya = {
  id: "maya", seed: 6001,
  base: "beautiful white woman in her 20s, symmetrical face, hazel eyes, full lips, influencer style, very large natural breasts, long straight brown hair",
  outfits: {
    "elegante": "wearing elegant designer dress, taking mirror selfie in luxury bathroom",
    "casual": "wearing white crop top and yoga pants, taking mirror selfie in bathroom",
    "fiesta": "wearing glittery party dress, taking mirror selfie in luxury bathroom",
    "bikini-suave": "wearing black bikini, taking mirror selfie in luxury bathroom",
  },
};

async function generate() {
  const keys = Object.keys(maya.outfits);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const filename = `maya-moreno-${key}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    if (fs.existsSync(outputPath)) { console.log(`  • ${filename} exists`); continue; }

    const seed = maya.seed + 100 + i * 10;
    const prompt = `${maya.base}, ${maya.outfits[key]}, ${SUFFIX}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    console.log(`[${key}] seed=${seed}`);
    const r = await fetch(url);
    if (!r.ok) { console.log(`  Failed: ${r.status}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(outputPath, buf);
    console.log(`  ✓ (${(buf.length/1024).toFixed(0)} KB)`);
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("Done");
}
generate().catch(console.error);
