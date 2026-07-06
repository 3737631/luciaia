import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/girls");

const girls = [
  {
    id: "luna", name: "Luna",
    hairDesc: { moreno: "dark brown hair", rubio: "blonde hair", pelirrojo: "red hair", rosa: "pink hair" },
    prompt: "attractive latina woman, curvy hourglass body, black lace lingerie, hands covering chest, pink neon bedroom, seductive gaze, boudoir photography, photorealistic, professional photoshoot, high quality, detailed face",
  },
  {
    id: "nia", name: "Nia",
    hairDesc: { moreno: "brown hair", rubio: "blonde hair", pelirrojo: "red hair", rosa: "pink hair" },
    prompt: "attractive white woman gamer girl, curvy hourglass body, black lace lingerie, hands covering chest, gaming chair RGB lights, flirty look, photorealistic, professional photoshoot, high quality",
  },
  {
    id: "vera", name: "Vera",
    hairDesc: { moreno: "brown hair", rubio: "blonde hair", pelirrojo: "red hair", rosa: "pink hair" },
    prompt: "attractive pale white woman, curvy hourglass body, dark lace lingerie, hands covering chest, dark bedroom candlelight, mysterious look, photorealistic, professional photoshoot, high quality",
  },
  {
    id: "alma", name: "Alma",
    hairDesc: { moreno: "dark brown hair", rubio: "blonde hair", pelirrojo: "red hair", rosa: "pink hair" },
    prompt: "attractive latina woman tan skin, curvy hourglass body, black bikini, hands covering chest, beach night moonlight tropical, warm smile, photorealistic, professional photoshoot, high quality",
  },
  {
    id: "kira", name: "Kira",
    hairDesc: { moreno: "brown hair", rubio: "blonde hair", pelirrojo: "red hair", rosa: "pink hair" },
    prompt: "attractive white woman futuristic style, curvy hourglass body, neon lingerie, hands covering chest, cyberpunk city night neon signs rain, confident look, photorealistic, professional photoshoot",
  },
  {
    id: "maya", name: "Maya",
    hairDesc: { moreno: "brown hair", rubio: "blonde hair", pelirrojo: "red hair", rosa: "pink hair" },
    prompt: "attractive white woman influencer, curvy hourglass body, sporty lingerie, hands covering chest, mirror selfie luxury bathroom, playful smile, photorealistic, professional photoshoot, high quality",
  },
];

async function generateImage(prompt, hairText, outputPath) {
  const fullPrompt = `${prompt}, ${hairText}, RAW photo, professional lighting, 8K, highly detailed`.substring(0, 500);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 999999)}&nologo=true&model=flux`;

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Pollinations ${response.status}: ${text.substring(0, 100)}`);
  }

  const arrayBuf = await response.arrayBuffer();
  if (arrayBuf.byteLength < 1000) throw new Error(`Response too small (${arrayBuf.byteLength} bytes)`);

  const buffer = Buffer.from(arrayBuf);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✓ ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const start = Date.now();
  let total = 0, generated = 0;

  for (const girl of girls) {
    for (const [hairKey, hairText] of Object.entries(girl.hairDesc)) {
      total++;
      const filename = `${girl.id}-${hairKey}.webp`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      if (fs.existsSync(outputPath)) {
        console.log(`  • ${filename} exists, skipping`);
        continue;
      }

      console.log(`\n[${girl.name} - ${hairKey}] (${total}/24)`);

      let success = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
        // Rotate seeds for variety
        const seed = Math.floor(Math.random() * 999999);
        // Slightly vary prompt per attempt
        const prompt = attempt <= 2
          ? `${girl.prompt}, ${hairText}`
          : attempt <= 4
            ? `${girl.prompt.replace("curvy", "voluptuous").replace("attractive", "beautiful")}, ${hairText}`
            : `portrait of ${hairText} beautiful woman ${girl.id}, ${hairText}, lingerie, professional photoshoot, high quality, detailed`;

        const fullPrompt = `${prompt}, RAW photo, 8K`.substring(0, 500);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            const text = await response.text().catch(() => "");
            console.log(`  Attempt ${attempt}: ${response.status}`);
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }

          const arrayBuf = await response.arrayBuffer();
          if (arrayBuf.byteLength < 1000) {
            console.log(`  Attempt ${attempt}: too small (${arrayBuf.byteLength})`);
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }

          const buffer = Buffer.from(arrayBuf);
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, buffer);
          console.log(`  ✓ (${(buffer.length / 1024).toFixed(0)} KB)`);
          generated++;
          success = true;
          break;
        } catch (err) {
          console.log(`  Attempt ${attempt}: ${err.message.slice(0, 60)}`);
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      if (!success) console.log(`  ✗ All attempts failed`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone! Generated ${generated} new images in ${elapsed} min`);
}

main().catch(console.error);
