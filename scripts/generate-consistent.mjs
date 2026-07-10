import fs from "fs";
import path from "path";

const BASE = "Ultra realistic editorial photography of an attractive adult woman aged 22–26, clearly adult, modern influencer aesthetic, premium fashion photography, cinematic lighting, realistic skin texture, natural proportions, symmetrical face, soft makeup, shallow depth of field, shot on Sony A7R V with 50mm f/1.4 lens, HDR, ultra detailed, 8K, luxury editorial style, premium mobile app quality, warm cinematic color grading, highly photorealistic, consistent photography style, no teenage features, no baby face, no plastic look, natural skin, real human";

// All 8 female characters with the same base prompt, only varying hair/clothes/scene/lighting/personality
const CHARS = [
  {
    id: "luna",
    hair: "moreno",
    pose: "toalla",
    bg: "neon-room",
    desc: "long straight black hair, elegant bedroom with pink ambient neon lights, wearing black lace babydoll lingerie, confident seductive expression",
  },
  {
    id: "luna",
    hair: "moreno",
    pose: "tanga",
    bg: "car-night",
    desc: "long straight black hair, sitting in luxury car at night, pink city lights outside, wearing black lace lingerie, sensual mysterious look",
  },
  {
    id: "luna",
    hair: "pelirrojo",
    pose: "bata",
    bg: "neon-room",
    desc: "long red hair, elegant bedroom with pink ambient lights, wearing black silk robe loosely tied, confident gaze",
  },
  {
    id: "luna",
    hair: "moreno",
    pose: "estrellas",
    bg: "studio",
    desc: "long straight black hair, studio photography with pink soft lighting, wearing black lace lingerie set, lying down seductively",
  },
  {
    id: "nia",
    hair: "rosa",
    pose: "tanga",
    bg: "neon-room",
    desc: "short pink hair, gaming room with RGB LED lights, wearing tight white crop top and shorts, playful gamer aesthetic",
  },
  {
    id: "nia",
    hair: "rosa",
    pose: "tanga",
    bg: "studio",
    desc: "short pink hair, studio photography with blue and purple RGB lighting, wearing pink crop top and skirt, confident flirty pose",
  },
  {
    id: "nia",
    hair: "moreno",
    pose: "bata",
    bg: "neon-room",
    desc: "long dark hair with pink highlights, gaming room with neon lights, wearing black silk robe, relaxed after gaming session",
  },
  {
    id: "vera",
    hair: "pelirrojo",
    pose: "bata",
    bg: "studio",
    desc: "long natural red hair, luxury apartment living room with warm sunlight streaming through curtains, wearing white silk robe, soft sensual expression",
  },
  {
    id: "vera",
    hair: "pelirrojo",
    pose: "tanga",
    bg: "neon-room",
    desc: "long natural red hair, luxury bedroom with warm sunset light, wearing black lace lingerie, mysterious intense gaze",
  },
  {
    id: "vera",
    hair: "rubio",
    pose: "estrellas",
    bg: "car-night",
    desc: "long blonde hair, leaning against luxury car at golden hour warm sunset light, wearing fitted black dress, elegant sophisticated look",
  },
  {
    id: "vera",
    hair: "moreno",
    pose: "bata",
    bg: "studio",
    desc: "long brown hair, luxury apartment studio with warm natural light, wearing silk robe, relaxed editorial pose",
  },
  {
    id: "alma",
    hair: "moreno",
    pose: "estrellas",
    bg: "beach-night",
    desc: "long curly black hair, beach at night under moonlight, wearing white lace babydoll lingerie, romantic dreamy expression",
  },
  {
    id: "alma",
    hair: "moreno",
    pose: "tanga",
    bg: "beach-night",
    desc: "long curly black hair, moonlit beach with ocean waves, wearing black string bikini, walking towards camera confidently",
  },
  {
    id: "alma",
    hair: "rubio",
    pose: "bata",
    bg: "neon-room",
    desc: "long straight blonde hair, bedroom with warm moonlight-style lighting, wearing sheer white robe, soft sweet expression",
  },
  {
    id: "kira",
    hair: "rosa",
    pose: "tanga",
    bg: "studio",
    desc: "short pink bob hair, futuristic room with holographic blue displays, wearing sleek black cyberpunk bodysuit, confident commanding presence",
  },
  {
    id: "kira",
    hair: "rosa",
    pose: "tanga",
    bg: "neon-room",
    desc: "short pink bob hair, cyberpunk room with blue and purple neon grid lights, wearing black latex bodysuit, intense futuristic gaze",
  },
  {
    id: "kira",
    hair: "pelirrojo",
    pose: "bata",
    bg: "studio",
    desc: "long red hair, futuristic studio with blue LED accents, wearing black silk robe with cyberpunk accessories, mysterious look",
  },
  {
    id: "kira",
    hair: "moreno",
    pose: "estrellas",
    bg: "car-night",
    desc: "long dark hair, futuristic car at night with neon city reflections, wearing sleek black outfit, cyberpunk editorial aesthetic",
  },
  {
    id: "maya",
    hair: "rubio",
    pose: "bata",
    bg: "car-night",
    desc: "long blonde hair, luxury hotel suite with city night view, wearing white silk robe, golden ambient lighting, glamorous influencer style",
  },
  {
    id: "maya",
    hair: "rubio",
    pose: "tanga",
    bg: "car-night",
    desc: "long blonde hair, leaning against luxury sports car at night, city lights bokeh background, wearing tight silver dress, confident smile",
  },
  {
    id: "maya",
    hair: "moreno",
    pose: "bata",
    bg: "studio",
    desc: "long brown hair, hotel room studio with warm golden lighting, wearing black lace babydoll, soft glamorous editorial pose",
  },
  {
    id: "sasha",
    hair: "moreno",
    pose: "estrellas",
    bg: "neon-room",
    desc: "long black braids with beads, moody bedroom with warm gold neon lighting, wearing red lace lingerie set, curvy figure, confident bold expression",
  },
  {
    id: "sasha",
    hair: "moreno",
    pose: "tanga",
    bg: "neon-room",
    desc: "long black braided hair, bedroom with purple and warm neon lights, wearing black sheer lingerie, curvy hourglass figure, empowered gaze",
  },
  {
    id: "sasha",
    hair: "rubio",
    pose: "estrellas",
    bg: "car-night",
    desc: "long blonde braids, leaning on luxury sports car at night, gold city lights reflecting, wearing tight gold dress, glamorous curvy figure",
  },
  {
    id: "sasha",
    hair: "pelirrojo",
    pose: "bata",
    bg: "studio",
    desc: "long red braids, moody studio with warm golden lighting, wearing black silk robe open, thick curvy silhouette, powerful sensual presence",
  },
  {
    id: "yuki",
    hair: "moreno",
    pose: "toalla",
    bg: "neon-room",
    desc: "long straight black hair with blunt bangs, soft pink bedroom with fairy lights, wearing white cotton babydoll nightie, shy cute expression looking up",
  },
  {
    id: "yuki",
    hair: "moreno",
    pose: "estrellas",
    bg: "neon-room",
    desc: "long black hair with bangs, bedroom with soft pink neon lights, wearing white lace babydoll, blushing shy expression, hands behind back",
  },
  {
    id: "yuki",
    hair: "rosa",
    pose: "bata",
    bg: "studio",
    desc: "soft pink hair with bangs, pastel pink studio with soft lighting, wearing short pink silk robe, cute but mature feminine pose, shy curious look",
  },
];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 5000) throw new Error(`Too small: ${buf.length}B`);
  fs.writeFileSync(filepath, buf);
  console.log(`  OK ${(buf.length / 1024).toFixed(1)}KB`);
}

async function main() {
  for (let i = 0; i < CHARS.length; i++) {
    const { id, hair, pose, bg, desc } = CHARS[i];
    const fname = `${hair}_${pose}_${bg}.jpg`;
    const filepath = `public/girls/${id}/${fname}`;
    const prompt = `${BASE}, ${desc}`;
    const seed = (id.charCodeAt(0) * 1000 + i * 37 + hair.length * 13) % 90000 + 10000;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}&model=flux`;

    console.log(`\n${id}: ${fname}`);
    for (let a = 1; a <= 3; a++) {
      try {
        await download(url, filepath);
        break;
      } catch (e) {
        if (a < 3) {
          console.log(`  retry ${a}: ${e.message}`);
          await new Promise(r => setTimeout(r, 15000));
        } else {
          console.log(`  FAILED: ${e.message}`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 8000));
  }
  console.log("\nDone!");
}

main().catch(console.error);
