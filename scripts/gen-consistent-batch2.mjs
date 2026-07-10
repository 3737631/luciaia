import fs from "fs";
import path from "path";

const BASE = "Ultra realistic editorial photography of an attractive adult woman aged 22–26, clearly adult, modern influencer aesthetic, premium fashion photography, cinematic lighting, realistic skin texture, natural proportions, symmetrical face, soft makeup, shallow depth of field, shot on Sony A7R V with 50mm f/1.4 lens, HDR, ultra detailed, 8K, luxury editorial style, premium mobile app quality, warm cinematic color grading, highly photorealistic, consistent photography style, no teenage features, no baby face, no plastic look, natural skin, real human";

const CHARS = [
  { id:"kira", hair:"rosa", pose:"tanga", bg:"studio", desc:"short pink bob hair, futuristic room with holographic blue displays, wearing sleek black cyberpunk bodysuit, confident commanding presence" },
  { id:"kira", hair:"rosa", pose:"tanga", bg:"neon-room", desc:"short pink bob hair, cyberpunk room with blue and purple neon grid lights, wearing black latex bodysuit, intense futuristic gaze" },
  { id:"kira", hair:"pelirrojo", pose:"bata", bg:"studio", desc:"long red hair, futuristic studio with blue LED accents, wearing black silk robe with cyberpunk accessories, mysterious look" },
  { id:"kira", hair:"moreno", pose:"estrellas", bg:"car-night", desc:"long dark hair, futuristic car at night with neon city reflections, wearing sleek black outfit, cyberpunk editorial aesthetic" },
  { id:"maya", hair:"rubio", pose:"bata", bg:"car-night", desc:"long blonde hair, luxury hotel suite with city night view, wearing white silk robe, golden ambient lighting, glamorous influencer style" },
  { id:"maya", hair:"rubio", pose:"tanga", bg:"car-night", desc:"long blonde hair, leaning against luxury sports car at night, city lights bokeh background, wearing tight silver dress, confident smile" },
  { id:"maya", hair:"moreno", pose:"bata", bg:"studio", desc:"long brown hair, hotel room studio with warm golden lighting, wearing black lace babydoll, soft glamorous editorial pose" },
  { id:"sasha", hair:"moreno", pose:"estrellas", bg:"neon-room", desc:"long black braids with beads, moody bedroom with warm gold neon lighting, wearing red lace lingerie set, curvy figure, confident bold expression" },
  { id:"sasha", hair:"moreno", pose:"tanga", bg:"neon-room", desc:"long black braided hair, bedroom with purple and warm neon lights, wearing black sheer lingerie, curvy hourglass figure, empowered gaze" },
  { id:"sasha", hair:"rubio", pose:"estrellas", bg:"car-night", desc:"long blonde braids, leaning on luxury sports car at night, gold city lights reflecting, wearing tight gold dress, glamorous curvy figure" },
  { id:"sasha", hair:"pelirrojo", pose:"bata", bg:"studio", desc:"long red braids, moody studio with warm golden lighting, wearing black silk robe open, thick curvy silhouette, powerful sensual presence" },
  { id:"yuki", hair:"moreno", pose:"toalla", bg:"neon-room", desc:"long straight black hair with blunt bangs, soft pink bedroom with fairy lights, wearing white cotton babydoll nightie, shy cute expression looking up" },
  { id:"yuki", hair:"moreno", pose:"estrellas", bg:"neon-room", desc:"long black hair with bangs, bedroom with soft pink neon lights, wearing white lace babydoll, blushing shy expression, hands behind back" },
  { id:"yuki", hair:"rosa", pose:"bata", bg:"studio", desc:"soft pink hair with bangs, pastel pink studio with soft lighting, wearing short pink silk robe, cute but mature feminine pose, shy curious look" },
];

async function dl(url, fp) {
  const d = path.dirname(fp);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const b = Buffer.from(await r.arrayBuffer());
  if (b.length < 5000) throw new Error(`Too small: ${b.length}B`);
  fs.writeFileSync(fp, b);
  console.log(`  OK ${(b.length/1024).toFixed(1)}KB`);
}

async function main() {
  for (let i = 0; i < CHARS.length; i++) {
    const { id, hair, pose, bg, desc } = CHARS[i];
    const fname = `${hair}_${pose}_${bg}.jpg`;
    const fp = `public/girls/${id}/${fname}`;
    const prompt = `${BASE}, ${desc}`;
    const seed = (id.charCodeAt(0)*1000 + (i+14)*37 + hair.length*13)%90000+10000;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}&model=flux`;
    console.log(`\n${id}: ${fname}`);
    for (let a=1;a<=3;a++) { try { await dl(url, fp); break; } catch(e) { if(a<3){console.log(`  retry ${a}: ${e.message}`);await new Promise(r=>setTimeout(r,15000));}else console.log(`  FAILED: ${e.message}`); } }
    await new Promise(r=>setTimeout(r,8000));
  }
  console.log("\nDone!");
}
main().catch(console.error);
