import fs from "fs";
import path from "path";

const CHARS = [
  {
    id: "luna",
    prompt: "photorealistic full body photo of a breathtakingly beautiful Latina woman in her 20s, long glossy dark hair, huge natural breasts, curvy hourglass figure, wearing tiny black lace babydoll and thigh-high stockings, standing in a neon-lit bedroom with purple and pink lights, one hand on her hip, looking at camera with a seductive confident smile, professional studio lighting, sharp focus on face and body, natural skin texture, pores visible, subsurface scattering, ultra detailed eyes, flawless skin, high fashion photography, 85mm f1.4, shallow depth of field, cinematic lighting",
    hair: "moreno", pose: "toalla", bg: "neon-room"
  },
  {
    id: "nia",
    prompt: "photorealistic Sony A7R IV full body photo of a stunning gamer girl in her 20s, short pink hair, cute freckles, huge natural breasts, wearing a tight low-cut crop top and micro skirt, thigh-high socks, sitting at a gaming setup with RGB keyboard and multiple monitors, looking back at camera over her shoulder with a playful teasing smile, dim room with colorful LED strip lighting, sharp focus, natural skin texture, subsurface scattering, ultra detailed eyes, high fashion gaming aesthetic, 85mm f1.4 portrait",
    hair: "rosa", pose: "tanga", bg: "neon-room"
  },
  {
    id: "vera",
    prompt: "photorealistic Sony A7R IV full body photo of a gorgeous redhead woman in her mid 20s, flowing red hair, emerald green eyes, huge natural breasts, wearing a sheer black silk robe loosely tied showing her body, holding a glass of red wine, leaning against a doorframe in a dimly lit bedroom, warm intimate lighting from candles, sensual expression looking directly at camera, professional boudoir photography, sharp focus, natural skin texture, subsurface scattering, ultra detailed eyes, flawless face, 85mm f1.4, shallow depth of field",
    hair: "pelirrojo", pose: "bata", bg: "studio"
  },
  {
    id: "alma",
    prompt: "photorealistic Sony A7R IV full body photo of a curvy Latina woman in her 20s, long curly dark hair cascading over her shoulders, huge natural breasts, hourglass figure with wide hips, wearing tiny white lace lingerie, lying seductively on a bed at night, soft moonlight streaming through a window creating natural lighting, looking at camera with a sweet seductive smile, romantic intimate atmosphere, sharp focus, natural skin texture, pores visible, ultra detailed eyes, flawless face, soft subsurface scattering, fine art boudoir photography",
    hair: "moreno", pose: "estrellas", bg: "beach-night"
  },
  {
    id: "kira",
    prompt: "photorealistic Sony A7R IV full body photo of a futuristic woman in her 20s, short pink bob haircut, huge breasts, wearing a sheer black cyberpunk bodysuit that leaves little to imagination, standing in a neon grid room with holographic blue and purple displays floating around her, commanding dominant pose with hand on hip, intense confident gaze at camera, blue and pink neon rim lighting, cyberpunk aesthetic, sharp focus, natural skin texture, ultra detailed eyes, flawless face, high fashion sci-fi photography",
    hair: "rosa", pose: "tanga", bg: "studio"
  },
  {
    id: "maya",
    prompt: "photorealistic Sony A7R IV full body photo of a stunning blonde influencer woman in her 20s, blue eyes, huge natural breasts, curvy slim figure, wearing a tiny white string bikini that barely covers her, taking a mirror selfie in a luxury hotel room, holding a phone in one hand, mirror reflection captures her body from behind, natural daylight flooding through large windows, perfect glowing skin, glossy pink lips, confident flirty smile, sharp focus, ultra detailed eyes, professional influencer photography",
    hair: "rubio", pose: "bata", bg: "car-night"
  },
  {
    id: "sasha",
    prompt: "photorealistic Sony A7R IV full body photo of a beautiful black woman in her 20s, long dark braids with beads, huge natural breasts, thick curvy figure with big round glutes and wide hips, wearing tiny red lace lingerie, standing in front of a full-length mirror in a bedroom, looking over her shoulder at camera with a bold confident smile, warm golden studio lighting, sharp focus, natural dark skin texture with healthy glow, subsurface scattering, ultra detailed eyes, flawless face, high fashion portrait photography",
    hair: "moreno", pose: "estrellas", bg: "neon-room"
  },
  {
    id: "yuki",
    prompt: "photorealistic Sony A7R IV full body photo of a cute Japanese girl, 18-19 years old, straight black hair with blunt bangs, medium natural breasts visible through thin white cotton fabric, wearing a short white babydoll nightie, sitting nervously on the edge of a bed, knees pressed together, shy innocent expression looking up at the camera with big dark eyes, soft warm bedroom lighting from a bedside lamp, dreamy romantic atmosphere, sharp focus, natural skin texture, flawless face, ultra detailed eyes, soft subsurface scattering, intimate portrait photography",
    hair: "moreno", pose: "toalla", bg: "neon-room"
  },
];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(filepath, buf);
  console.log(`  OK ${path.basename(filepath)} (${(buf.length / 1024).toFixed(1)}KB)`);
}

async function main() {
  for (const c of CHARS) {
    const fname = `${c.hair}_${c.pose}_${c.bg}.jpg`;
    const filepath = `public/girls/${c.id}/${fname}`;
    const seed = (c.hair.length + c.pose.length + c.bg.length) * 1000 + c.id.charCodeAt(0);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(c.prompt)}?width=768&height=1024&nofeed=true&seed=${seed}`;

    console.log(`\n${c.id}: ${fname}`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await download(url, filepath);
        break;
      } catch (e) {
        if (attempt < 3) {
          console.log(`  Attempt ${attempt} failed: ${e.message}, retrying in 8s...`);
          await new Promise(r => setTimeout(r, 8000));
        } else {
          console.log(`  FAILED after 3 attempts: ${e.message}`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log("\nDone!");
}

main().catch(console.error);
