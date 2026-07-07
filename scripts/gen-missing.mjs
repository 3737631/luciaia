import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public/girls");

const HAIR = ["moreno","rubio","pelirrojo","rosa"];
const OUTFIT = ["elegante","casual","fiesta","bikini-suave"];
const BG = ["neon-room","beach-night","studio","car-night"];

const SUFFIX = "looking directly at camera with a subtle, natural expression, standing pose full body from thighs up, centered in frame, soft professional studio-like lighting, professional photoshoot, photorealistic, highly detailed skin texture, 8K, RAW photo, natural skin, no filters";

const GIRL_DATA = {
  luna: { seed: 1001, face: "beautiful latina woman in her 20s, oval face, big brown eyes, full lips, straight nose, defined jawline, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: { moreno: "long straight dark brown hair", rubio: "long straight platinum blonde hair", pelirrojo: "long straight red hair", rosa: "long straight neon pink hair" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt", casual: "wearing tight white crop top and low-rise jeans", fiesta: "wearing shiny silver sequin party dress with deep neckline", "bikini-suave": "wearing black string bikini set" },
    background: { "neon-room": "standing in a pink neon-lit bedroom with LED strips behind her", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background", studio: "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop", "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow" } },
  nia: { seed: 2001, face: "beautiful white woman in her 20s, round face, big green eyes, full lips, small nose, gamer girl aesthetic, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: { moreno: "long wavy brown hair with subtle highlights", rubio: "long wavy platinum blonde hair with subtle highlights", pelirrojo: "long wavy red hair with subtle highlights", rosa: "long wavy neon pink hair with subtle highlights" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt", casual: "wearing tight gamer girl t-shirt and denim shorts", fiesta: "wearing sparkly purple party dress with deep neckline", "bikini-suave": "wearing black string bikini set" },
    background: { "neon-room": "standing in a gaming room with RGB LED strips on walls and desk, gaming chair in background", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background", studio: "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop", "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow" } },
  vera: { seed: 3001, face: "beautiful pale white woman in her 20s, angular face, intense dark eyes, full lips, straight nose, mysterious look, slim waist, wide hips, very large natural breasts, soft skin",
    hair: { moreno: "long straight dark brown hair", rubio: "long straight platinum blonde hair", pelirrojo: "long straight red hair", rosa: "long straight pink hair" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt", casual: "wearing black leather jacket and ripped jeans", fiesta: "wearing dark red velvet party dress with deep neckline", "bikini-suave": "wearing black string bikini set" },
    background: { "neon-room": "standing in a dark room with pink neon accent lighting, moody shadows", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background", studio: "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop", "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow" } },
  alma: { seed: 4001, face: "beautiful latina woman tan skin in her 20s, heart-shaped face, big dark eyes, full lips, warm smile, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: { moreno: "long curly dark brown hair", rubio: "long curly platinum blonde hair", pelirrojo: "long curly red hair", rosa: "long curly neon pink hair" },
    outfit: { elegante: "wearing elegant white lace lingerie set with garter belt", casual: "wearing white summer blouse and denim shorts", fiesta: "wearing bright red party dress with deep neckline", "bikini-suave": "wearing white string bikini set" },
    background: { "neon-room": "standing in a pink neon-lit bedroom with tropical decorations", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background", studio: "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop", "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow" } },
  kira: { seed: 5001, face: "beautiful white woman in her 20s, sharp features, blue eyes, full lips, cyberpunk aesthetic, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: { moreno: "long messy dark brown hair with cyberpunk style", rubio: "long messy platinum blonde hair with cyberpunk style", pelirrojo: "long messy red hair with cyberpunk style", rosa: "long messy neon pink hair with cyberpunk style" },
    outfit: { elegante: "wearing futuristic black lace lingerie set with garter belt", casual: "wearing cyberpunk jacket and neon-trimmed leggings", fiesta: "wearing holographic sequin party dress with deep neckline", "bikini-suave": "wearing metallic finish black string bikini set" },
    background: { "neon-room": "standing in a cyberpunk room with holographic neon displays and purple-pink LED strips", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background", studio: "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop", "car-night": "standing next to a neon-lit cyberpunk sports car at night, holographic billboards in background" } },
  maya: { seed: 6001, face: "beautiful white woman in her 20s, symmetrical face, hazel eyes, full lips, influencer style, fit body, slim waist, wide hips, very large natural breasts, soft skin, glamorous makeup",
    hair: { moreno: "long straight dark brown hair with balayage highlights", rubio: "long straight platinum blonde hair with balayage highlights", pelirrojo: "long straight red hair with balayage highlights", rosa: "long straight neon pink hair with balayage highlights" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt", casual: "wearing white crop top and high-waist yoga leggings", fiesta: "wearing glittering gold party dress with deep neckline", "bikini-suave": "wearing black string bikini set" },
    background: { "neon-room": "standing in a pink neon-lit bedroom with mirror wall and luxury decor", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background", studio: "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop", "car-night": "standing next to a white luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow" } },
};

async function generateImage(prompt, seed, outputPath) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations ${response.status}`);
  const buf = Buffer.from(await response.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Too small (${buf.length})`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
}

async function generateOne(girlId, hk, ok, bk) {
  const g = GIRL_DATA[girlId];
  const girlDir = path.join(ROOT, girlId);
  const fileName = `${hk}_${ok}_${bk}.jpg`;
  const filePath = path.join(girlDir, fileName);
  if (fs.existsSync(filePath)) return;
  const prompt = `${g.face}, ${g.hair[hk]}, ${g.outfit[ok]}, ${g.background[bk]}, ${SUFFIX}`;
  for (let a = 1; a <= 3; a++) {
    try {
      await generateImage(prompt, g.seed, filePath);
      const size = fs.statSync(filePath).size;
      console.log(`${girlId}: ${fileName} (${(size/1024).toFixed(0)} KB)`);
      return;
    } catch (err) {
      if (a === 3) console.log(`FAIL ${girlId}/${fileName}: ${err.message.slice(0,80)}`);
      else await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function main() {
  const start = Date.now();
  const tasks = [];
  for (const girlId of Object.keys(GIRL_DATA)) {
    for (const hk of HAIR) {
      for (const ok of OUTFIT) {
        for (const bk of BG) {
          tasks.push({ girlId, hk, ok, bk });
        }
      }
    }
  }
  console.log(`Total combos: ${tasks.length}`);

  const CONCURRENCY = 3;
  let done = 0;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(t => generateOne(t.girlId, t.hk, t.ok, t.bk)));
    done += batch.length;
    if (done % 30 === 0) console.log(`  ${done}/${tasks.length} checked`);
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone in ${elapsed} min`);

  // Count totals
  let total = 0;
  for (const girlId of Object.keys(GIRL_DATA)) {
    const cnt = (await fs.promises.readdir(path.join(ROOT, girlId))).filter(f => f.endsWith('.jpg')).length;
    console.log(`${girlId}: ${cnt}/64`);
    total += cnt;
  }
  console.log(`Total: ${total}/384`);
}

main().catch(console.error);
