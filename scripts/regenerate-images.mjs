import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/girls");

// Each girl has a FIXED seed so the face/body stays the same across variants
// Same prompt structure: only the hair/outfit/background descriptors change
const GIRLS = [
  {
    id: "luna", seed: 1001,
    base: "beautiful latina woman in her 20s, oval face, big brown eyes, full lips, straight nose, defined jawline, slim waist, wide hips, very large natural breasts",
    hair: {
      moreno: "long straight dark brown hair",
      rubio: "long straight platinum blonde hair",
      pelirrojo: "long straight red hair",
      rosa: "long straight neon pink hair",
    },
  },
  {
    id: "nia", seed: 2001,
    base: "beautiful white woman in her 20s, round face, big green eyes, full lips, small nose, gamer girl aesthetic, slim waist, wide hips, very large natural breasts",
    hair: {
      moreno: "long wavy brown hair",
      rubio: "long wavy blonde hair",
      pelirrojo: "long wavy red hair",
      rosa: "long wavy neon pink hair",
    },
  },
  {
    id: "vera", seed: 3001,
    base: "beautiful pale white woman in her 20s, angular face, intense dark eyes, full lips, straight nose, mysterious look, slim waist, wide hips, very large natural breasts",
    hair: {
      moreno: "long straight brown hair",
      rubio: "long straight platinum blonde hair",
      pelirrojo: "long straight red hair",
      rosa: "long straight pink hair",
    },
  },
  {
    id: "alma", seed: 4001,
    base: "beautiful latina woman tan skin in her 20s, heart-shaped face, big dark eyes, full lips, warm smile, slim waist, wide hips, very large natural breasts",
    hair: {
      moreno: "long curly dark brown hair",
      rubio: "long curly blonde hair",
      pelirrojo: "long curly red hair",
      rosa: "long curly pink hair",
    },
  },
  {
    id: "kira", seed: 5001,
    base: "beautiful white woman in her 20s, sharp face, blue eyes, full lips, futuristic cyberpunk style, slim waist, wide hips, very large natural breasts",
    hair: {
      moreno: "long messy brown hair",
      rubio: "long messy platinum blonde hair",
      pelirrojo: "long messy red hair",
      rosa: "long messy neon pink hair",
    },
  },
  {
    id: "maya", seed: 6001,
    base: "beautiful white woman in her 20s, symmetrical face, hazel eyes, full lips, influencer style, fit body, slim waist, wide hips, very large natural breasts",
    hair: {
      moreno: "long straight brown hair",
      rubio: "long straight platinum blonde hair",
      pelirrojo: "long straight red hair",
      rosa: "long straight pink hair",
    },
  },
];

// Use the same outfit+background for all hair variants so only hair changes
const COMMON = "wearing black lace lingerie set, sitting on edge of bed, hands on thighs, looking at camera, soft lighting, professional photoshoot, photorealistic, highly detailed skin texture, 8K";

async function generateImage(prompt, seed, outputPath) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Pollinations ${response.status}: ${text.substring(0, 100)}`);
  }

  const arrayBuf = await response.arrayBuffer();
  if (arrayBuf.byteLength < 1000) throw new Error(`Too small (${arrayBuf.byteLength} bytes)`);

  const buffer = Buffer.from(arrayBuf);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✓ ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const start = Date.now();
  let total = 0, generated = 0;

  for (const girl of GIRLS) {
    for (const [hairKey, hairDesc] of Object.entries(girl.hair)) {
      total++;
      const filename = `${girl.id}-${hairKey}.jpg`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      // Use girl seed + hair offset so different hairs get slightly different seeds
      // but same face structure is preserved
      const hairOffset = { moreno: 0, rubio: 10, pelirrojo: 20, rosa: 30 };
      const seed = girl.seed + hairOffset[hairKey];

      const prompt = `${girl.base}, ${hairDesc}, ${COMMON}, RAW photo, 8K`.substring(0, 800);

      console.log(`\n[${girl.id} - ${hairKey}] seed=${seed} (${total}/24)`);

      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await generateImage(prompt, seed, outputPath);
          generated++;
          success = true;
          break;
        } catch (err) {
          console.log(`  Attempt ${attempt}: ${err.message.slice(0, 60)}`);
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
      if (!success) console.log(`  ✗ Failed`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone! ${generated}/${total} in ${elapsed} min`);
}

main().catch(console.error);
