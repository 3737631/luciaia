import fs from "fs";
import path from "path";

const CHARACTERS = [
  {
    id: "luna",
    prompt: "sexy latina woman black lace lingerie huge natural breasts curvy hourglass long dark hair neon bedroom seductive smile looking at camera highly realistic professional photo perfect face flawless skin sharp focus detailed eyes Sony A7R IV 85mm portrait photography soft lighting subsurface scattering",
  },
  {
    id: "nia",
    prompt: "sexy gamer girl short pink hair freckles crop top micro skirt huge breasts RGB gaming setup sitting looking back over shoulder playful smile highly realistic professional photo perfect face flawless skin sharp focus detailed eyes",
  },
  {
    id: "vera",
    prompt: "sexy redhead woman green eyes sheer silk robe loosely tied huge breasts visible wine glass doorway dim warm light sensual smile highly realistic professional photo perfect face flawless skin sharp focus detailed eyes",
  },
  {
    id: "alma",
    prompt: "sexy curvy latina woman long curly dark hair white lace lingerie huge natural breasts lying on bed moonlight sweet seductive smile highly realistic professional photo perfect face flawless skin sharp focus",
  },
  {
    id: "kira",
    prompt: "sexy futuristic woman short pink bob hair sheer black bodysuit huge breasts visible neon grid holographic displays commanding pose highly realistic professional photo perfect face flawless skin sharp focus",
  },
  {
    id: "maya",
    prompt: "sexy blonde influencer blue eyes tiny string bikini huge natural breasts curvy slim mirror selfie hotel room natural daylight glossy lips confident smile highly realistic professional photo perfect face sharp focus",
  },
  {
    id: "sasha",
    prompt: "sexy black woman long dark braids tiny red lace lingerie huge natural breasts thick curvy figure full-length mirror bold smile highly realistic professional photo perfect face flawless skin sharp focus",
  },
  {
    id: "yuki",
    prompt: "sexy cute japanese girl black hair blunt bangs short white babydoll medium breasts sitting on bed edge knees together shy innocent looking up highly realistic professional photo perfect face flawless skin soft lighting",
  },
  {
    id: "sakura",
    prompt: "sexy anime magical girl pink outfit sparkles huge breasts floating wand cute smile beautiful face realistic style professional illustration detailed eyes perfect proportions",
  },
  {
    id: "yumi",
    prompt: "sexy catgirl blue hair cat ears tail huge breasts playful pose neon anime style beautiful face detailed eyes perfect proportions",
  },
  {
    id: "rin",
    prompt: "sexy tsundere anime girl black hair red eyes school uniform huge breasts embarrassed blush beautiful face detailed eyes perfect proportions",
  },
];

const HAIR = ["moreno", "rubio", "pelirrojo", "rosa", "azul", "cafe", "negro"];
const POSE = ["toalla", "estrellas", "tanga", "bata", "casual", "ropa"];
const BG = ["neon-room", "beach-night", "studio", "car-night"];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(filepath, buf);
  console.log(`  Saved ${path.basename(filepath)} (${(buf.length / 1024).toFixed(1)}KB)`);
}

async function generate(char, hair, pose, bg) {
  const baseUrl = "https://image.pollinations.ai/prompt";
  const url = `${baseUrl}/${encodeURIComponent(char.prompt)}?width=768&height=1024&nofeed=true&seed=${(hair.length + pose.length + bg.length) * 1000 + char.id.charCodeAt(0)}`;
  const filepath = `public/girls/${char.id}/${hair}_${pose}_${bg}.jpg`;
  if (fs.existsSync(filepath)) return; // skip existing
  try {
    console.log(`  ${char.id}: ${hair}_${pose}_${bg}`);
    await download(url, filepath);
  } catch (e) {
    console.log(`  FAILED ${char.id}/${hair}_${pose}_${bg}: ${e.message}`);
  }
}

async function main() {
  // Only generate defaults for faster results
  // moreno_toalla_neon-room for each char
  for (const char of CHARACTERS) {
    console.log(`\nGenerating ${char.id}...`);
    await generate(char, char.id === "rin" ? "negro" : (char.id === "sasha" || char.id === "alma" || char.id === "luna" || char.id === "yuki" ? "moreno" : char.id === "maya" ? "rubio" : char.id === "vera" ? "pelirrojo" : char.id === "nia" || char.id === "kira" || char.id === "sakura" ? "rosa" : char.id === "yumi" ? "azul" : "moreno"), "toalla", "neon-room");
    await new Promise(r => setTimeout(r, 3000));
    // second pose
    await generate(char, char.id === "rin" ? "moreno" : (char.id === "luna" ? "pelirrojo" : char.id === "maya" ? "rosa" : char.id === "sasha" ? "rubio" : char.id === "yuki" ? "rosa" : "moreno"), "tanga", "studio");
    await new Promise(r => setTimeout(r, 3000));
    // third pose
    await generate(char, char.id === "luna" ? "moreno" : char.id === "nia" ? "rosa" : char.id === "vera" ? "moreno" : char.id === "alma" ? "moreno" : char.id === "kira" ? "pelirrojo" : char.id === "maya" ? "moreno" : char.id === "sasha" ? "moreno" : char.id === "yuki" ? "moreno" : "moreno", "bata", "car-night");
    await new Promise(r => setTimeout(r, 3000));
    // extra for stories
    await generate(char, "moreno", "estrellas", "beach-night");
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("\nDone!");
}

main().catch(console.error);
