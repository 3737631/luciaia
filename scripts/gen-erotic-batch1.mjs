// Batch 1: luna, nia, vera, alma
import fs from "fs";
import path from "path";
const IMAGES = [
  ["luna","moreno","toalla","neon-room","real photo of a sexy Latina woman with long dark hair, huge breasts, curvy hourglass figure, wearing tiny black lace babydoll lingerie, sitting on a bed in a neon-lit bedroom, one hand touching her thigh, looking at camera with a seductive expression, natural skin texture, realistic body proportions, normal body ratio not elongated, natural lighting from neon lamps, shot on real camera, genuine human, authentic portrait"],
  ["luna","moreno","tanga","car-night","real photo of a hot Latina woman with long dark hair, big breasts, curvy body, wearing black lace lingerie, sitting in a luxury car at night, city lights outside, legs slightly apart, seductive look, natural skin texture, normal proportions, realistic photography, real person, authentic night photo"],
  ["luna","pelirrojo","bata","neon-room","real photo of a sexy redhead woman with long hair, huge breasts, wearing a black sheer silk robe loosely tied showing cleavage, standing in a neon pink bedroom, hand on hip, sensual expression, natural skin, realistic body proportions, real photography, authentic portrait"],
  ["luna","moreno","estrellas","studio","real photo of a hot Latina model with long dark hair, big natural breasts, wearing black lacy lingerie, lying on a soft surface, legs crossed, seductive pose, professional studio photography, realistic skin texture, normal body proportions, real person, boudoir photography"],
  ["nia","rosa","tanga","neon-room","real photo of a cute gamer girl with short pink hair, medium breasts, wearing a tight low-cut crop top and tiny shorts, sitting at a gaming desk with RGB keyboard, leaning forward showing cleavage, playful teasing smile, real skin texture, normal proportions, natural RGB lighting on face, real person, authentic bedroom photo"],
  ["nia","rosa","tanga","studio","real photo of a hot gamer girl with pink hair, big breasts, wearing a tight crop top and micro skirt, standing in a photo studio, hand on hip, confident flirty expression, realistic skin texture, normal body proportions, professional portrait photography, real human"],
  ["nia","moreno","bata","neon-room","real photo of a sexy woman with dark hair, big breasts, wearing a sheer black silk robe, standing in a gaming room with rainbow LED lights, one shoulder exposed, sensual look, natural skin, realistic proportions, real photography, candid moment"],
  ["vera","pelirrojo","bata","studio","real photo of a stunning redhead woman with long flowing red hair, huge breasts, wearing a black silk robe loosely tied showing her body, standing in a photo studio with warm soft lighting, hand running through her hair, seductive gaze, realistic skin texture, normal proportions, professional boudoir photography, real person"],
  ["vera","pelirrojo","tanga","neon-room","real photo of a gorgeous redhead with long red hair, big breasts, wearing black lace lingerie set, standing in a bedroom with purple neon lighting, fingers tracing her collarbone, sensual expression, realistic skin, normal body ratio, real photography, authentic portrait"],
  ["vera","rubio","estrellas","car-night","real photo of a hot blonde woman with long hair, huge breasts, wearing a tight black dress with deep neckline, leaning against a sports car at night, looking back over shoulder, city lights reflecting, natural skin texture, normal proportions, paparazzi style photo, real person"],
  ["vera","moreno","bata","studio","real photo of a sexy woman with long brown hair, big breasts, wearing a white silk robe open at the top, sitting on a studio chair, one leg crossed, soft lit portrait, natural skin texture, realistic body proportions, professional photography, real human"],
  ["alma","moreno","estrellas","beach-night","real photo of a curvy Latina woman with long curly dark hair, huge breasts, wearing a tiny white crochet bikini, lying on a beach blanket at night, moonlight reflecting on skin, one hand behind head, sensual relaxed pose, natural skin, realistic proportions, real night photography, authentic photo"],
  ["alma","moreno","tanga","beach-night","real photo of a hot Latina woman with long curly hair, huge breasts, curvy thick figure, wearing a black string bikini, walking on a moonlit beach, looking back at camera, wet skin from ocean, natural body proportions, realistic photography, real person, candid beach photo"],
  ["alma","rubio","bata","neon-room","real photo of a sexy Latina woman with blonde hair, big breasts, wearing a sheer white babydoll lingerie, standing in a warm neon-lit bedroom, hand on her hip pushing her hip out, confident sensual expression, natural skin, realistic proportions, authentic portrait"],
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
  for (const [id, hair, pose, bg, prompt] of IMAGES) {
    const fname = `${hair}_${pose}_${bg}.jpg`;
    const fp = `public/girls/${id}/${fname}`;
    const seed = (hair.length*7+pose.length*13+bg.length*23+id.charCodeAt(0)*31)%90000+10000;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}&model=flux`;
    console.log(`\n${id}: ${fname}`);
    for (let a=1;a<=3;a++) { try { await dl(url, fp); break; } catch(e) { if(a<3){console.log(`  retry ${a}: ${e.message}`); await new Promise(r=>setTimeout(r,15000));}else console.log(`  FAILED: ${e.message}`); } }
    await new Promise(r=>setTimeout(r,8000));
  }
  console.log("\nDone!");
}
main().catch(console.error);
