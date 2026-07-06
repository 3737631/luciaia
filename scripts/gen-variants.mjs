import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public/girls");

// Each girl has ONE seed used for ALL variants
// Only the attribute descriptor changes in the prompt
// Everything else (face, pose, framing, lighting) stays identical
const GIRLS = [
  {
    id: "luna", seed: 1001,
    face: "beautiful latina woman in her 20s, oval face, big brown eyes, full lips, straight nose, defined jawline, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    // hair variants (only hair changes)
    hair: {
      moreno: "long straight dark brown hair",
      rubio: "long straight platinum blonde hair",
      pelirrojo: "long straight red hair",
      rosa: "long straight neon pink hair",
    },
    // outfit variants (only clothing changes, everything else same)
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt",
      casual: "wearing tight white crop top and low-rise jeans",
      fiesta: "wearing shiny silver sequin party dress with deep neckline",
      "bikini-suave": "wearing black string bikini set",
    },
    // background variants (only background changes)
    background: {
      "neon-room": "standing in pink neon-lit bedroom with LED strips behind her",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background",
      "studio": "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop",
      "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow",
    },
  },
  {
    id: "nia", seed: 2001,
    face: "beautiful white woman in her 20s, round face, big green eyes, full lips, small nose, gamer girl aesthetic, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: {
      moreno: "long wavy brown hair with subtle highlights",
      rubio: "long wavy platinum blonde hair with subtle highlights",
      pelirrojo: "long wavy red hair with subtle highlights",
      rosa: "long wavy neon pink hair with subtle highlights",
    },
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt",
      casual: "wearing tight gamer girl t-shirt and denim shorts",
      fiesta: "wearing sparkly purple party dress with deep neckline",
      "bikini-suave": "wearing black string bikini set",
    },
    background: {
      "neon-room": "standing in a gaming room with RGB LED strips on walls and desk, gaming chair in background",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background",
      "studio": "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop",
      "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow",
    },
  },
  {
    id: "vera", seed: 3001,
    face: "beautiful pale white woman in her 20s, angular face, intense dark eyes, full lips, straight nose, mysterious look, slim waist, wide hips, very large natural breasts, soft skin",
    hair: {
      moreno: "long straight dark brown hair",
      rubio: "long straight platinum blonde hair",
      pelirrojo: "long straight red hair",
      rosa: "long straight pink hair",
    },
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt",
      casual: "wearing black leather jacket and ripped jeans",
      fiesta: "wearing dark red velvet party dress with deep neckline",
      "bikini-suave": "wearing black string bikini set",
    },
    background: {
      "neon-room": "standing in a dark room with pink neon accent lighting, moody shadows",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background",
      "studio": "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop",
      "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow",
    },
  },
  {
    id: "alma", seed: 4001,
    face: "beautiful latina woman tan skin in her 20s, heart-shaped face, big dark eyes, full lips, warm smile, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: {
      moreno: "long curly dark brown hair",
      rubio: "long curly platinum blonde hair",
      pelirrojo: "long curly red hair",
      rosa: "long curly neon pink hair",
    },
    outfit: {
      elegante: "wearing elegant white lace lingerie set with garter belt",
      casual: "wearing white summer blouse and denim shorts",
      fiesta: "wearing bright red party dress with deep neckline",
      "bikini-suave": "wearing white string bikini set",
    },
    background: {
      "neon-room": "standing in a pink neon-lit bedroom with tropical decorations",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background",
      "studio": "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop",
      "car-night": "standing next to a luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow",
    },
  },
  {
    id: "kira", seed: 5001,
    face: "beautiful white woman in her 20s, sharp features, blue eyes, full lips, cyberpunk aesthetic, slim waist, wide hips, very large natural breasts, soft skin, subtle makeup",
    hair: {
      moreno: "long messy dark brown hair with cyberpunk style",
      rubio: "long messy platinum blonde hair with cyberpunk style",
      pelirrojo: "long messy red hair with cyberpunk style",
      rosa: "long messy neon pink hair with cyberpunk style",
    },
    outfit: {
      elegante: "wearing futuristic black lace lingerie set with garter belt",
      casual: "wearing cyberpunk jacket and neon-trimmed leggings",
      fiesta: "wearing holographic sequin party dress with deep neckline",
      "bikini-suave": "wearing metallic finish black string bikini set",
    },
    background: {
      "neon-room": "standing in a cyberpunk room with holographic neon displays and purple-pink LED strips",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background",
      "studio": "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop",
      "car-night": "standing next to a neon-lit cyberpunk sports car at night, holographic billboards in background",
    },
  },
  {
    id: "maya", seed: 6001,
    face: "beautiful white woman in her 20s, symmetrical face, hazel eyes, full lips, influencer style, fit body, slim waist, wide hips, very large natural breasts, soft skin, glamorous makeup",
    hair: {
      moreno: "long straight dark brown hair with balayage highlights",
      rubio: "long straight platinum blonde hair with balayage highlights",
      pelirrojo: "long straight red hair with balayage highlights",
      rosa: "long straight neon pink hair with balayage highlights",
    },
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt",
      casual: "wearing white crop top and high-waist yoga leggings",
      fiesta: "wearing glittering gold party dress with deep neckline",
      "bikini-suave": "wearing black string bikini set",
    },
    background: {
      "neon-room": "standing in a pink neon-lit bedroom with mirror wall and luxury decor",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted in background",
      "studio": "standing in a modern minimalist photography studio with soft diffused lighting and a curved white backdrop",
      "car-night": "standing next to a white luxury sports car at night, city lights reflecting on the wet pavement, cinematic street glow",
    },
  },
];

const SUFFIX = "looking directly at camera with a subtle, natural expression, standing pose full body from thighs up, centered in frame, soft professional studio-like lighting, professional photoshoot, photorealistic, highly detailed skin texture, 8K, RAW photo, natural skin, no filters";

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
  let total = 0, ok = 0;

  for (const girl of GIRLS) {
    const baseDir = path.join(ROOT, girl.id);
    const hairDir = path.join(baseDir, "hair");
    const outfitDir = path.join(baseDir, "outfit");
    const bgDir = path.join(baseDir, "background");

    // Helper: generate with retries
    const gen = async (prompt, seed, filepath, label) => {
      total++;
      if (fs.existsSync(filepath)) { console.log(`  • ${label} exists`); ok++; return; }
      console.log(`\n[${girl.id}/${label}] seed=${seed}`);
      for (let a = 1; a <= 3; a++) {
        try {
          await generateImage(prompt, seed, filepath);
          ok++;
          return;
        } catch (err) {
          console.log(`  Attempt ${a}: ${err.message.slice(0, 60)}`);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      console.log(`  ✗ Failed`);
    };

    // ── BASE IMAGE ──
    const basePrompt = `${girl.face}, long straight dark brown hair, wearing elegant black lace lingerie set, standing in a pink neon-lit bedroom, ${SUFFIX}`;
    await gen(basePrompt, girl.seed, path.join(baseDir, "base.jpg"), "base");

    // ── HAIR VARIANTS ──
    for (const [key, desc] of Object.entries(girl.hair)) {
      // Same everything except hair
      const baseOutfit = Object.values(girl.outfit)[0]; // first outfit = default
      const baseBg = Object.values(girl.background)[0]; // first bg = default
      const p = `${girl.face}, ${desc}, ${baseOutfit}, ${baseBg}, ${SUFFIX}`;
      await gen(p, girl.seed, path.join(hairDir, `${key}.jpg`), `hair/${key}`);
      await new Promise(r => setTimeout(r, 2000));
    }

    // ── OUTFIT VARIANTS ──
    for (const [key, desc] of Object.entries(girl.outfit)) {
      const baseHair = Object.values(girl.hair)[0]; // moreno
      const baseBg = Object.values(girl.background)[0];
      const p = `${girl.face}, ${baseHair}, ${desc}, ${baseBg}, ${SUFFIX}`;
      await gen(p, girl.seed, path.join(outfitDir, `${key}.jpg`), `outfit/${key}`);
      await new Promise(r => setTimeout(r, 2000));
    }

    // ── BACKGROUND VARIANTS ──
    for (const [key, desc] of Object.entries(girl.background)) {
      const baseHair = Object.values(girl.hair)[0];
      const baseOutfit = Object.values(girl.outfit)[0];
      const p = `${girl.face}, ${baseHair}, ${baseOutfit}, ${desc}, ${SUFFIX}`;
      await gen(p, girl.seed, path.join(bgDir, `${key}.jpg`), `background/${key}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone! ${ok}/${total} in ${elapsed} min`);
}

main().catch(console.error);
