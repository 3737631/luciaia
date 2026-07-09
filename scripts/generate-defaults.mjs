import fs from "fs";
import path from "path";

const CHARS = [
  { id: "luna", prompt: "sexy latina woman black lace lingerie huge natural breasts curvy hourglass long dark hair neon bedroom seductive smile looking at camera highly realistic professional photo perfect face flawless skin sharp focus detailed eyes Sony A7R IV 85mm portrait photography soft lighting subsurface scattering", hair: "moreno", pose: "toalla", bg: "neon-room" },
  { id: "nia", prompt: "sexy gamer girl short pink hair freckles crop top micro skirt huge breasts RGB gaming setup sitting looking back over shoulder playful smile highly realistic professional photo perfect face flawless skin sharp focus detailed eyes", hair: "rosa", pose: "tanga", bg: "neon-room" },
  { id: "vera", prompt: "sexy redhead woman green eyes sheer silk robe loosely tied huge breasts visible wine glass doorway dim warm light sensual smile highly realistic professional photo perfect face flawless skin sharp focus detailed eyes", hair: "pelirrojo", pose: "bata", bg: "studio" },
  { id: "alma", prompt: "sexy curvy latina woman long curly dark hair white lace lingerie huge natural breasts lying on bed moonlight sweet seductive smile highly realistic professional photo perfect face flawless skin sharp focus", hair: "moreno", pose: "estrellas", bg: "beach-night" },
  { id: "kira", prompt: "sexy futuristic woman short pink bob hair sheer black bodysuit huge breasts visible neon grid holographic displays commanding pose highly realistic professional photo perfect face flawless skin sharp focus", hair: "rosa", pose: "tanga", bg: "studio" },
  { id: "maya", prompt: "sexy blonde influencer blue eyes tiny string bikini huge natural breasts curvy slim mirror selfie hotel room natural daylight glossy lips confident smile highly realistic professional photo perfect face sharp focus", hair: "rubio", pose: "bata", bg: "car-night" },
  { id: "sasha", prompt: "sexy black woman long dark braids tiny red lace lingerie huge natural breasts thick curvy figure full-length mirror bold smile highly realistic professional photo perfect face flawless skin sharp focus", hair: "moreno", pose: "estrellas", bg: "neon-room" },
  { id: "yuki", prompt: "sexy cute japanese girl black hair blunt bangs short white babydoll medium breasts sitting on bed edge knees together shy innocent looking up highly realistic professional photo perfect face flawless skin soft lighting", hair: "moreno", pose: "toalla", bg: "neon-room" },
];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(filepath, buf);
  console.log(`  Saved ${path.basename(filepath)} (${(buf.length / 1024).toFixed(1)}KB)`);
}

async function main() {
  for (const c of CHARS) {
    const fname = `${c.hair}_${c.pose}_${c.bg}.jpg`;
    const filepath = `public/girls/${c.id}/${fname}`;
    const seed = (c.hair.length + c.pose.length + c.bg.length) * 1000 + c.id.charCodeAt(0);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(c.prompt)}?width=768&height=1024&nofeed=true&seed=${seed}`;

    console.log(`\n${c.id}: ${fname}`);
    try {
      await download(url, filepath);
    } catch (e) {
      console.log(`  FAILED: ${e.message}, retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
      try {
        await download(url, filepath);
      } catch (e2) {
        console.log(`  FAILED again: ${e2.message}`);
      }
    }
    await new Promise(r => setTimeout(r, 4000));
  }
  console.log("\nDone!");
}

main().catch(console.error);
