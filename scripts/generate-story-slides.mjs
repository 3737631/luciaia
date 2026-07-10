import fs from "fs";
import path from "path";

// Each entry: [id, hair, pose, bg, customPrompt?]
// We only generate combos that DON'T already exist as local files.
const NEEDED = [
  // luna
  ["luna", "moreno", "tanga", "car-night", "beautiful Latina woman, long dark hair, huge natural breasts, wearing tiny black lace lingerie, sitting in a luxury car at night, city lights outside, seductive look, highly realistic, professional photo, flawless skin, sharp focus"],
  ["luna", "pelirrojo", "bata", "neon-room", "gorgeous redhead woman with huge breasts, wearing a sheer silk robe in a neon-lit bedroom, purple and pink lights, sensual expression, highly realistic, professional photography, flawless skin, sharp focus"],
  ["luna", "moreno", "estrellas", "studio", "stunning Latina woman with long dark hair, huge natural breasts, wearing black lace babydoll, lying on a studio backdrop with sparkling lights, dreamy look, highly realistic, professional photo, flawless skin"],
  // nia
  ["nia", "rosa", "tanga", "studio", "gorgeous gamer girl with short pink hair, huge breasts, wearing a tiny crop top and micro skirt, standing in a professional studio, confident playful smile, highly realistic, sharp focus, flawless skin"],
  ["nia", "moreno", "bata", "neon-room", "beautiful gamer girl with long dark hair, huge breasts, wearing a sheer silk robe in a neon-lit gaming room, RGB lights, sensual look over shoulder, highly realistic"],
  // vera
  ["vera", "pelirrojo", "tanga", "neon-room", "stunning redhead woman with flowing red hair, huge natural breasts, wearing tiny black lace lingerie, neon-lit bedroom, purple ambient light, looking at camera with intense eyes, highly realistic"],
  ["vera", "rubio", "estrellas", "car-night", "gorgeous blonde woman, huge natural breasts, wearing a sheer black dress, leaning against a luxury car at night, city lights reflecting, seductive confident smile, highly realistic"],
  ["vera", "moreno", "bata", "studio", "beautiful woman with long dark hair, huge breasts, wearing a silk robe open slightly, standing in a professional studio with soft warm lighting, sensual expression, highly realistic"],
  // alma
  ["alma", "moreno", "tanga", "beach-night", "curvy Latina woman, long curly dark hair, huge natural breasts, wearing a tiny black bikini on a moonlit beach, waves in background, sensual pose, highly realistic, professional photo"],
  ["alma", "rubio", "bata", "neon-room", "gorgeous Latina blonde, huge natural breasts, wearing a sheer white robe in a neon-lit room, leaning against a wall, sweet seductive smile, highly realistic, flawless skin"],
  // kira
  ["kira", "rosa", "tanga", "neon-room", "futuristic woman with short pink hair, huge breasts, wearing a sheer cyberpunk bodysuit, standing in a neon grid room with holographic displays, confident commanding gaze, highly realistic"],
  ["kira", "pelirrojo", "bata", "studio", "stunning futuristic redhead woman, huge breasts, wearing a black silk robe, studio lighting with blue neon accents, cyberpunk aesthetic, intense look, highly realistic"],
  ["kira", "moreno", "estrellas", "car-night", "beautiful cyberpunk woman with long dark hair, huge breasts, wearing a sheer black outfit, leaning on a futuristic car at night, neon reflections, highly realistic"],
  // maya
  ["maya", "rubio", "tanga", "car-night", "stunning blonde influencer, huge natural breasts, wearing a tiny white dress, getting into a luxury car at night, looking back at camera with a flirty smile, highly realistic"],
  ["maya", "moreno", "bata", "studio", "gorgeous brunette woman, huge breasts, wearing a sheer silk robe in a professional studio, soft dramatic lighting, influencer style, confident pose, highly realistic"],
  // sasha
  ["sasha", "moreno", "tanga", "neon-room", "beautiful black woman with long braids, huge natural breasts, curvy thick figure, wearing tiny red lingerie in a neon-lit room, confident bold expression, highly realistic"],
  ["sasha", "rubio", "estrellas", "car-night", "gorgeous black woman with blonde braids, huge natural breasts, curvy figure, wearing a gold dress, leaning on a luxury car at night, glamorous, highly realistic"],
  ["sasha", "pelirrojo", "bata", "studio", "stunning black woman with red hair, huge natural breasts, thick curves, wearing a black silk robe in studio with warm dramatic lighting, sensual look, highly realistic"],
  // yuki
  ["yuki", "moreno", "estrellas", "neon-room", "cute Japanese girl with long dark hair, medium breasts visible through thin fabric, wearing a white babydoll in a neon-lit room, shy innocent expression, highly realistic"],
  ["yuki", "rosa", "bata", "studio", "adorable Japanese girl with pink hair, small breasts, wearing a short silk robe in a soft lit studio, looking up shyly at camera, dreamy atmosphere, highly realistic"],
];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(filepath, buf);
  console.log(`  OK (${(buf.length / 1024).toFixed(1)}KB)`);
}

function makePrompt(id, hair, pose, bg, custom) {
  if (custom) return custom;
  return `highly realistic photo of a beautiful woman, ${hair} hair, huge natural breasts, perfect face, flawless skin, sharp focus, professional photography, seductive look, studio lighting, full body portrait`;
}

async function main() {
  for (const [id, hair, pose, bg, customPrompt] of NEEDED) {
    const fname = `${hair}_${pose}_${bg}.jpg`;
    const filepath = `public/girls/${id}/${fname}`;

    if (fs.existsSync(filepath)) {
      console.log(`\n${id}/${fname} ALREADY EXISTS, skipping`);
      continue;
    }

    const prompt = makePrompt(id, hair, pose, bg, customPrompt);
    const seed = (hair.length + pose.length + bg.length) * 100 + id.charCodeAt(0);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}`;

    console.log(`\n${id}: ${fname}`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await download(url, filepath);
        break;
      } catch (e) {
        if (attempt < 3) {
          console.log(`  Attempt ${attempt} failed: ${e.message}, retrying in 10s...`);
          await new Promise(r => setTimeout(r, 10000));
        } else {
          console.log(`  FAILED after 3 attempts: ${e.message}`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 6000));
  }
  console.log("\nDone!");
}

main().catch(console.error);
