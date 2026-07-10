import fs from "fs";
import path from "path";

const IMAGES = [
  // kira
  ["kira", "rosa", "tanga", "studio",
    "photo of a futuristic-looking woman with short pink bob hair, wearing a sleek black bodysuit, standing in a modern studio with blue LED accents, confident pose, realistic skin texture, natural lighting, sci-fi fashion editorial, real person"],
  ["kira", "rosa", "tanga", "neon-room",
    "photo of a woman with short pink hair, wearing a black fitted outfit, standing in a room with neon blue and purple holographic lights, realistic body proportions, natural expression, cyberpunk aesthetic but real person, candid portrait"],
  ["kira", "pelirrojo", "bata", "studio",
    "natural portrait of a beautiful woman with long red hair, wearing a black silk robe, studio photography with dramatic lighting, realistic skin texture, genuine expression, editorial fashion photo, real human features"],
  ["kira", "moreno", "estrellas", "car-night",
    "photo of a beautiful woman with long dark hair, wearing a sleek black outfit, leaning on a modern car at night with neon city reflections, realistic street lighting, candid moment, real person, urban night photography"],
  // maya
  ["maya", "rubio", "bata", "car-night",
    "photo of a stunning blonde woman in a luxury hotel room, wearing a white silk robe, natural daylight coming through curtains, realistic skin texture, natural expression, candid moment, real influencer selfie style, authentic photo"],
  ["maya", "rubio", "tanga", "car-night",
    "natural photo of a beautiful blonde woman in a luxury car at night, wearing a fitted silver dress, city lights outside, natural street lighting on face, realistic skin, candid paparazzi style, real person"],
  ["maya", "moreno", "bata", "studio",
    "portrait of a gorgeous woman with brown hair, wearing a silk robe, studio photography with natural softbox lighting, realistic skin texture, natural expression, professional headshot style, real human features"],
  // sasha
  ["sasha", "moreno", "estrellas", "neon-room",
    "photo of a stunning black woman with long braids, curvy figure, wearing red lace lingerie, standing in a bedroom with warm neon lighting, natural confident expression, realistic dark skin texture with natural glow, real person, candid portrait photography"],
  ["sasha", "moreno", "tanga", "neon-room",
    "natural photo of a beautiful black woman with braided hair, curvy hourglass figure, wearing black lingerie, standing in a room with purple and red neon lights, realistic skin texture, natural body proportions, candid moment, real person"],
  ["sasha", "rubio", "estrellas", "car-night",
    "photo of a gorgeous black woman with blonde braids, curvy figure, wearing a gold dress, leaning on a luxury sports car at night, city lights, realistic street lighting, natural skin glow, paparazzi style, real person"],
  ["sasha", "pelirrojo", "bata", "studio",
    "portrait of a beautiful black woman with red hair, wearing a black silk robe, studio photography with warm golden lighting, realistic skin texture, natural expression, professional fashion portrait, real human features"],
  // yuki
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
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 5000) throw new Error(`Too small: ${buf.length}B`);
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
    for (let a = 1; a <= 3; a++) {
      try {
        await download(url, filepath);
        break;
      } catch (e) {
        if (a < 3) { console.log(`  retry ${a}: ${e.message}`); await new Promise(r => setTimeout(r, 15000)); }
        else console.log(`  FAILED: ${e.message}`);
      }
    }
    await new Promise(r => setTimeout(r, 8000));
  }
  console.log("\nDone!");
}
main().catch(console.error);
