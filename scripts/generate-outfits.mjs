import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/girls");

const GIRLS = [
  {
    id: "luna", seed: 1001,
    base: "beautiful latina woman in her 20s, oval face, big brown eyes, full lips, very large natural breasts, long straight dark brown hair",
    outfits: {
      "elegante": "wearing elegant black evening dress with deep neckline, standing in pink neon bedroom, high heels",
      "casual": "wearing tight white crop top and jeans, standing in pink neon bedroom, casual pose",
      "fiesta": "wearing sparkling silver party dress, standing in pink neon bedroom, night club lighting",
      "bikini-suave": "wearing black bikini, standing in pink neon bedroom, beach style",
    },
  },
  {
    id: "nia", seed: 2001,
    base: "beautiful white woman in her 20s, round face, big green eyes, full lips, gamer girl, very large natural breasts, long wavy brown hair",
    outfits: {
      "elegante": "wearing elegant black evening dress, standing in gaming room with RGB lights, high heels",
      "casual": "wearing tight gamer t-shirt and shorts, sitting in gaming chair, casual",
      "fiesta": "wearing shiny party dress, standing in gaming room, disco lights",
      "bikini-suave": "wearing black bikini, standing in gaming room, summer vibe",
    },
  },
  {
    id: "vera", seed: 3001,
    base: "beautiful pale white woman in her 20s, angular face, intense dark eyes, full lips, mysterious, very large natural breasts, long straight brown hair",
    outfits: {
      "elegante": "wearing elegant black dress, standing in dark bedroom with candlelight",
      "casual": "wearing black top and leather pants, standing in dark bedroom, relaxed",
      "fiesta": "wearing red party dress, standing in dark bedroom, moody lighting",
      "bikini-suave": "wearing black bikini, standing in dark bedroom, sensual",
    },
  },
  {
    id: "alma", seed: 4001,
    base: "beautiful latina woman tan skin in her 20s, heart-shaped face, big dark eyes, full lips, warm smile, very large natural breasts, long curly dark brown hair",
    outfits: {
      "elegante": "wearing elegant white dress, standing on tropical beach at night, moonlight",
      "casual": "wearing white summer top and shorts, standing on beach at night, relaxed",
      "fiesta": "wearing colorful party dress, standing on beach at night, bonfire light",
      "bikini-suave": "wearing black bikini, standing on tropical beach at night",
    },
  },
  {
    id: "kira", seed: 5001,
    base: "beautiful white woman in her 20s, sharp face, blue eyes, full lips, futuristic cyberpunk, very large natural breasts, long messy brown hair",
    outfits: {
      "elegante": "wearing futuristic silver dress, standing in cyberpunk city, neon signs",
      "casual": "wearing cyberpunk jacket and pants, standing in cyberpunk city, casual",
      "fiesta": "wearing glowing neon party outfit, standing in cyberpunk city, rain",
      "bikini-suave": "wearing metallic bikini, standing in cyberpunk city, neon",
    },
  },
  {
    id: "maya", seed: 6001,
    base: "beautiful white woman in her 20s, symmetrical face, hazel eyes, full lips, influencer style, very large natural breasts, long straight brown hair",
    outfits: {
      "elegante": "wearing elegant designer dress, taking mirror selfie in luxury bathroom",
      "casual": "wearing white crop top and yoga pants, taking mirror selfie in bathroom",
      "fiesta": "wearing glittery party dress, taking mirror selfie in luxury bathroom",
      "bikini-suave": "wearing black bikini, taking mirror selfie in luxury bathroom",
    },
  },
];

const SUFFIX = "looking at camera, soft lighting, professional photoshoot, photorealistic, highly detailed skin texture, 8K, RAW photo";

async function generateImage(prompt, seed, outputPath) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations ${response.status}`);
  const buf = Buffer.from(await response.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Too small (${buf.length})`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  console.log(`  ✓ (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const start = Date.now();
  let total = 0, generated = 0;
  const outfitKeys = Object.keys(GIRLS[0].outfits);

  for (const girl of GIRLS) {
    for (let oi = 0; oi < outfitKeys.length; oi++) {
      const outfitKey = outfitKeys[oi];
      total++;
      const filename = `${girl.id}-moreno-${outfitKey}.jpg`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      if (fs.existsSync(outputPath)) {
        console.log(`  • ${filename} exists, skip`);
        continue;
      }

      const seed = girl.seed + 100 + oi * 10;
      const prompt = `${girl.base}, ${girl.outfits[outfitKey]}, ${SUFFIX}`.substring(0, 800);

      console.log(`\n[${girl.id} - ${outfitKey}] seed=${seed} (${total}/${GIRLS.length * 4})`);

      let ok = false;
      for (let a = 1; a <= 3; a++) {
        try {
          await generateImage(prompt, seed, outputPath);
          generated++;
          ok = true;
          break;
        } catch (err) {
          console.log(`  Attempt ${a}: ${err.message.slice(0, 60)}`);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      if (!ok) console.log(`  ✗ Failed`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone! ${generated}/${total} in ${elapsed} min`);
}

main().catch(console.error);
