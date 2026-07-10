// Batch 2: kira, maya, sasha, yuki
import fs from "fs";
import path from "path";
const IMAGES = [
  ["kira","rosa","tanga","studio","real photo of a futuristic woman with short pink bob, huge breasts, wearing a sheer black bodysuit that barely contains her, standing in a modern studio with blue lights, dominant confident pose, realistic skin texture, normal body proportions, high fashion editorial photography, real person"],
  ["kira","rosa","tanga","neon-room","real photo of a cyberpunk woman with short pink hair, big breasts, wearing a tight black latex bodysuit with deep v cut, standing in a room with neon blue holographic lights, commanding gaze, realistic skin, normal proportions, real photography, authentic portrait"],
  ["kira","pelirrojo","bata","studio","real photo of a sexy futuristic woman with long red hair, huge breasts, wearing a black silk robe barely closed, studio lighting with red and blue accents, intense sensual expression, hand on chest, realistic skin texture, normal proportions, professional photo"],
  ["kira","moreno","estrellas","car-night","real photo of a hot woman with long dark hair, big breasts, wearing a sleek sheer black top, leaning on a futuristic car at night, neon city reflections on skin, looking at camera with a teasing smile, realistic skin, normal proportion, real urban night photography"],
  ["maya","rubio","bata","car-night","real photo of a hot blonde woman, huge breasts, wearing a white silk robe loosely tied, sitting in a luxury hotel room bed at night, city view window behind, holding her robe open slightly, sensual expression, natural skin, realistic body proportions, real photography, authentic boudoir photo"],
  ["maya","rubio","tanga","car-night","real photo of a sexy blonde woman with long hair, huge breasts, wearing a tiny silver dress, leaning against a luxury car at night, one leg up on the bumper, looking back at camera, natural street lighting, realistic proportions, paparazzi style photo, real person"],
  ["maya","moreno","bata","studio","real photo of a stunning woman with brown hair, huge breasts, wearing a black lace babydoll, sitting on a studio stool, legs apart slightly, hands resting on thighs, seductive eye contact, realistic skin, normal proportions, professional photography, real human"],
  ["sasha","moreno","estrellas","neon-room","real photo of a stunning black woman with long braids, huge natural breasts, thick curvy figure with wide hips, wearing red lace lingerie set, standing in a bedroom with warm gold neon lighting, confident bold expression, realistic dark skin texture, natural glow, normal proportions, real photography"],
  ["sasha","moreno","tanga","neon-room","real photo of a hot black woman with long braided hair, huge breasts, thick hourglass figure, wearing black sheer lingerie, standing in purple neon room, hands on her curves, sensual confident look, realistic skin texture, normal proportions, real person, authentic portrait"],
  ["sasha","rubio","estrellas","car-night","real photo of a gorgeous black woman with blonde braids, huge breasts, thick curvy figure, wearing a tight gold dress with deep plunge, leaning on a sports car at night, city lights, looking back at camera, realistic skin, normal proportions, real photography, glamorous"],
  ["sasha","pelirrojo","bata","studio","real photo of a sexy black woman with red braids, huge natural breasts, thick curves, wearing a black silk robe open at front, sitting in a photo studio with warm golden lighting, hand on hip, sensual gaze, realistic skin texture, normal proportions, professional portrait"],
  ["yuki","moreno","toalla","neon-room","real photo of a cute Japanese adult woman, 19 years old, mature feminine features, long straight dark hair with bangs, medium breasts, wearing a short white babydoll nightie, sitting on edge of a bed in softly lit room, shy but flirtatious expression looking up at camera, realistic Asian features, normal body proportions, real person, authentic photography"],
  ["yuki","moreno","estrellas","neon-room","real photo of a pretty Japanese young woman with long dark hair, small to medium breasts, wearing transparent white babydoll lingerie with lace trim, standing in a bedroom with soft pink neon lights, blushing expression, hands behind back, realistic Asian skin texture, normal proportions, real person, cute but mature portrait"],
  ["yuki","rosa","bata","studio","real photo of a sexy Japanese woman with pink hair, medium breasts, wearing a short pink silk robe loosely tied showing her legs, standing in a soft lit studio, shy but curious look, one hand holding the robe closed, realistic Asian features, mature feminine appearance, normal proportions, real photography"],
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
