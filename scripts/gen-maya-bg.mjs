import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, "../public/girls/maya/background/car-night.jpg");

if (fs.existsSync(out)) {
  console.log("Already exists");
  process.exit(0);
}

const prompt = "beautiful white woman in her 20s, symmetrical face, hazel eyes, full lips, influencer style, fit body, slim waist, wide hips, very large natural breasts, soft skin, glamorous makeup, long straight dark brown hair with balayage highlights, wearing elegant black lace lingerie set with garter belt, standing next to a white luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow, looking directly at camera with a subtle natural expression, standing pose full body from thighs up, centered in frame, soft professional studio-like lighting, professional photoshoot, photorealistic, highly detailed skin texture, 8K, RAW photo, natural skin, no filters";

async function main() {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=6001&nologo=true&model=flux`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log(`✓ (${(buf.length / 1024).toFixed(0)} KB)`);
}
main().catch(console.error);
