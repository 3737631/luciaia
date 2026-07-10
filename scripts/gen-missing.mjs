import fs from "fs";
import path from "path";

const NEEDED = [
  ["maya", "moreno", "bata", "studio", "gorgeous brunette woman, huge breasts, wearing a sheer silk robe in professional studio, soft dramatic lighting, influencer style, confident pose, highly realistic"],
  ["sasha", "moreno", "tanga", "neon-room", "beautiful black woman with long braids, huge natural breasts, curvy thick figure, wearing tiny red lingerie in a neon-lit room, confident bold expression, highly realistic"],
  ["sasha", "rubio", "estrellas", "car-night", "gorgeous black woman with blonde braids, huge natural breasts, curvy figure, wearing a gold dress, leaning on a luxury car at night, glamorous, highly realistic"],
  ["sasha", "pelirrojo", "bata", "studio", "stunning black woman with red hair, huge natural breasts, thick curves, wearing a black silk robe in studio with warm lighting, sensual look, highly realistic"],
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

async function main() {
  for (const [id, hair, pose, bg, prompt] of NEEDED) {
    const fname = `${hair}_${pose}_${bg}.jpg`;
    const filepath = `public/girls/${id}/${fname}`;
    if (fs.existsSync(filepath)) { console.log(`${id}/${fname} exists, skip`); continue; }

    const seed = (hair.length + pose.length + bg.length) * 100 + id.charCodeAt(0);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}`;
    console.log(`\n${id}: ${fname}`);
    for (let a = 1; a <= 3; a++) {
      try { await download(url, filepath); break; }
      catch (e) {
        if (a < 3) { console.log(`  retry ${a}: ${e.message}`); await new Promise(r => setTimeout(r, 10000)); }
        else console.log(`  FAILED: ${e.message}`);
      }
    }
    await new Promise(r => setTimeout(r, 7000));
  }
  console.log("\nDone!");
}
main().catch(console.error);
