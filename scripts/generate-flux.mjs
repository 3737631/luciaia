import fs from "fs";
import path from "path";

// Generate all images using Pollinations with model=flux for maximum realism.
// Each entry: [id, hair, pose, bg, filename, prompt]

const IMAGES = [
  // ===== LUNA =====
  ["luna", "moreno", "toalla", "neon-room",
    "candid photo of a beautiful young Latina woman with long dark hair sitting on a bed in a bedroom with neon pink and purple lights, wearing a small black towel wrapped around her body, holding it loosely, real natural skin texture, genuine smile, soft natural-looking lighting, shot on iPhone 15 Pro portrait mode, unposed, realistic proportions, natural beauty, no makeup look"],
  ["luna", "moreno", "tanga", "car-night",
    "photo of a gorgeous Latina woman with long dark hair sitting in passenger seat of a car at night, city lights outside window, wearing black lingerie, natural lighting from street lamps, looking out window thoughtfully, realistic skin texture, candid moment, shot on iPhone 15 Pro, cinematic, real person vibe"],
  ["luna", "pelirrojo", "bata", "neon-room",
    "authentic photo of a beautiful redhead woman with long hair, wearing a silk robe loosely tied, standing in a bedroom with neon pink lighting, natural relaxed pose, realistic skin pores, natural expression, real human features, soft natural shadows, portrait photography"],
  ["luna", "moreno", "estrellas", "studio",
    "natural photo of a stunning Latina model with long dark hair, wearing black lace lingerie, lying on a soft surface, professional studio photography with softboxes, realistic skin texture, natural body proportions, real human anatomy, fashion editorial style"],
  // ===== NIA =====
  ["nia", "rosa", "tanga", "neon-room",
    "photo of a beautiful young gamer girl with short pink hair, sitting at a gaming desk with RGB keyboard and monitors, wearing a casual crop top, natural lighting from screens, real skin texture, relaxed expression, candid gaming session vibe, shot on smartphone, authentic, real person"],
  ["nia", "rosa", "tanga", "studio",
    "natural photo of a cute gamer girl with short pink hair, wearing a fitted crop top and shorts, standing in a photo studio with soft lighting, genuine smile, realistic skin texture, natural body proportions, studio portrait photography, real person"],
  ["nia", "moreno", "bata", "neon-room",
    "photo of a beautiful woman with long dark hair and pink highlights, wearing a silk robe, standing in a gaming room with colorful LED lights, natural relaxed expression, realistic skin, shot on camera, authentic casual moment"],
  // ===== VERA =====
  ["vera", "pelirrojo", "bata", "studio",
    "photo of a stunning redhead woman with long flowing red hair, wearing a black silk robe, standing in a photography studio with soft window light, natural confident expression, realistic skin texture and pores, real human features, editorial portrait photography"],
  ["vera", "pelirrojo", "tanga", "neon-room",
    "authentic photo of a beautiful redhead woman with long hair, wearing black lingerie, standing in a bedroom with neon purple lighting, natural relaxed pose, realistic body proportions, candid moment, real person, natural beauty"],
  ["vera", "rubio", "estrellas", "car-night",
    "photo of a gorgeous blonde woman leaning against a luxury car at night, city lights in background, wearing a fitted black dress, natural street lighting, realistic skin texture, candid moment, real person, paparazzi style photo"],
  ["vera", "moreno", "bata", "studio",
    "natural portrait of a beautiful woman with long dark hair, wearing a silk robe, standing in a photography studio, soft natural lighting, genuine expression, realistic skin, professional portrait photography, real human features"],
  // ===== ALMA =====
  ["alma", "moreno", "estrellas", "beach-night",
    "photo of a beautiful curvy Latina woman with long curly dark hair, wearing a white lace dress, standing on a beach at night under moonlight, natural night photography, realistic skin texture, candid romantic moment, real person, authentic photo"],
  ["alma", "moreno", "tanga", "beach-night",
    "natural photo of a stunning Latina with long curly hair, wearing a black bikini, walking on a moonlit beach, waves in background, realistic body proportions, natural lighting, candid moment, real person, vacation photo style"],
  ["alma", "rubio", "bata", "neon-room",
    "photo of a gorgeous Latina woman with blonde hair, wearing a white silk robe, standing in a bedroom with warm neon lighting, natural relaxed expression, realistic skin texture, real human features, candid portrait"],
  // ===== KIRA =====
  ["kira", "rosa", "tanga", "studio",
    "photo of a futuristic-looking woman with short pink bob hair, wearing a sleek black bodysuit, standing in a modern studio with blue LED accents, confident pose, realistic skin texture, natural lighting, sci-fi fashion editorial, real person"],
  ["kira", "rosa", "tanga", "neon-room",
    "photo of a woman with short pink hair, wearing a black fitted outfit, standing in a room with neon blue and purple holographic lights, realistic body proportions, natural expression, cyberpunk aesthetic but real person, candid portrait"],
  ["kira", "pelirrojo", "bata", "studio",
    "natural portrait of a beautiful woman with long red hair, wearing a black silk robe, studio photography with dramatic lighting, realistic skin texture, genuine expression, editorial fashion photo, real human features"],
  ["kira", "moreno", "estrellas", "car-night",
    "photo of a beautiful woman with long dark hair, wearing a sleek black outfit, leaning on a modern car at night with neon city reflections, realistic street lighting, candid moment, real person, urban night photography"],
  // ===== MAYA =====
  ["maya", "rubio", "bata", "car-night",
    "photo of a stunning blonde woman in a luxury hotel room, wearing a white silk robe, natural daylight coming through curtains, realistic skin texture, natural expression, candid moment, real influencer selfie style, authentic photo"],
  ["maya", "rubio", "tanga", "car-night",
    "natural photo of a beautiful blonde woman in a luxury car at night, wearing a fitted silver dress, city lights outside, natural street lighting on face, realistic skin, candid paparazzi style, real person"],
  ["maya", "moreno", "bata", "studio",
    "portrait of a gorgeous woman with brown hair, wearing a silk robe, studio photography with natural softbox lighting, realistic skin texture, natural expression, professional headshot style, real human features"],
  // ===== SASHA =====
  ["sasha", "moreno", "estrellas", "neon-room",
    "photo of a stunning black woman with long braids, curvy figure, wearing red lace lingerie, standing in a bedroom with warm neon lighting, natural confident expression, realistic dark skin texture with natural glow, real person, candid portrait photography"],
  ["sasha", "moreno", "tanga", "neon-room",
    "natural photo of a beautiful black woman with braided hair, curvy hourglass figure, wearing black lingerie, standing in a room with purple and red neon lights, realistic skin texture, natural body proportions, candid moment, real person"],
  ["sasha", "rubio", "estrellas", "car-night",
    "photo of a gorgeous black woman with blonde braids, curvy figure, wearing a gold dress, leaning on a luxury sports car at night, city lights, realistic street lighting, natural skin glow, paparazzi style, real person"],
  ["sasha", "pelirrojo", "bata", "studio",
    "portrait of a beautiful black woman with red hair, wearing a black silk robe, studio photography with warm golden lighting, realistic skin texture, natural expression, professional fashion portrait, real human features"],
  // ===== YUKI =====
  ["yuki", "moreno", "toalla", "neon-room",
    "photo of a cute young Japanese girl with long straight dark hair and bangs, wearing a white cotton nightie, sitting on edge of a bed in a softly lit bedroom, shy natural expression looking at camera, realistic Asian facial features, soft natural lighting, candid portrait, real person"],
  ["yuki", "moreno", "estrellas", "neon-room",
    "natural photo of a pretty Japanese girl with long dark hair, wearing a white babydoll, standing in a bedroom with soft pink neon lights, shy cute expression, realistic skin texture, natural body proportions, real person"],
  ["yuki", "rosa", "bata", "studio",
    "portrait of a cute Japanese girl with pink hair, wearing a short silk robe, studio photography with soft dreamy lighting, natural relaxed expression, realistic Asian features, soft skin texture, real person, kawaii fashion portrait"],
];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 5000) throw new Error(`File too small: ${buf.length} bytes`);
  fs.writeFileSync(filepath, buf);
  console.log(`  OK ${(buf.length / 1024).toFixed(1)}KB`);
}

async function main() {
  for (const [id, hair, pose, bg, prompt] of IMAGES) {
    const fname = `${hair}_${pose}_${bg}.jpg`;
    const filepath = `public/girls/${id}/${fname}`;

    const seed = (hair.length * 7 + pose.length * 13 + bg.length * 23 + id.charCodeAt(0) * 31) % 90000 + 10000;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}&model=flux`;

    console.log(`\n${id}: ${fname}`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await download(url, filepath);
        break;
      } catch (e) {
        if (attempt < 3) {
          console.log(`  Attempt ${attempt} failed: ${e.message}, retrying in 12s...`);
          await new Promise(r => setTimeout(r, 12000));
        } else {
          console.log(`  FAILED after 3 attempts: ${e.message}`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 8000));
  }
  console.log("\nDone!");
}

main().catch(console.error);
