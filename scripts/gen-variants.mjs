import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public/girls");

const GIRLS = [
  // ── LUNA ── Latina curvilínea, voluptuosa, piel canela ──
  {
    id: "luna", seed: 1001,
    face: "beautiful voluptuous latina woman in her 20s, oval symmetrical face, big expressive brown eyes with long lashes, full kissable lips, straight nose, defined jawline, hourglass figure, very slim waist, wide hips, very large natural breasts, soft caramel skin with healthy glow, subtle glossy makeup, perfectly arched eyebrows",
    hair: {
      moreno: "long straight dark brown silky hair",
      rubio: "long straight platinum blonde silky hair",
      pelirrojo: "long straight red silky hair",
      rosa: "long straight neon pink silky hair",
    },
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt and fishnet stockings, seductive confidence",
      casual: "wearing a very tight white ribbed crop top that emphasizes her curves and low-rise skinny jeans",
      fiesta: "wearing a dazzling silver sequin mini dress with plunging neckline and thigh-high slit",
      "bikini-suave": "wearing a minimal black string bikini that shows off her full curves",
    },
    background: {
      "neon-room": "standing in a pink neon-lit bedroom with LED strips behind her, moody sensual atmosphere",
      "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted, romantic mood",
      "studio": "standing in a professional photo studio with soft diffused lighting and curved white backdrop, fashion editorial",
      "car-night": "standing next to a black luxury sports car at night, city lights reflecting on wet pavement, cinematic street glow",
    },
  },
  // ── NIA ── White gamer, pecas, rostro dulce ──
  {
    id: "nia", seed: 2001,
    face: "beautiful athletic white woman in her 20s, round cute symmetrical face, big bright green eyes, full soft lips, small button nose, light freckles across nose and cheeks, girl-next-door aesthetic, slim toned waist, wide hips, large natural breasts, soft fair skin with natural blush, minimal natural makeup",
    hair: {
      moreno: "long wavy brown hair with subtle caramel highlights",
      rubio: "long wavy platinum blonde hair with subtle highlights",
      pelirrojo: "long wavy red hair with subtle copper highlights",
      rosa: "long wavy neon pink hair with subtle highlights",
    },
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt, playful innocent vibe",
      casual: "wearing a tight vintage gamer girl t-shirt tied at the waist and denim shorts",
      fiesta: "wearing a sparkly purple sequin party dress with sweetheart neckline",
      "bikini-suave": "wearing a black string bikini set, playful smile",
    },
    background: {
      "neon-room": "standing in a gaming room with RGB LED strips on walls, gaming chair behind her, cozy setup",
      "beach-night": "standing on a tropical beach at night, moonlight on waves, palm trees, warm breeze feeling",
      "studio": "standing in a professional photo studio with soft diffused lighting, minimal aesthetic",
      "car-night": "standing next to a red sports car at night, neon signs reflecting on wet street",
    },
  },
  // ── VERA ── Pale etérea, misteriosa, femme fatale ──
  {
    id: "vera", seed: 3001,
    face: "beautiful ethereal pale white woman in her 20s, angular symmetrical face, high sculpted cheekbones, intense dark piercing eyes, full seductive lips, straight elegant nose, mysterious femme fatale expression, slim waist, very wide hips, very large natural breasts, porcelain flawless skin, smoky dark eye makeup, neutral lips",
    hair: {
      moreno: "long straight dark brown hair with subtle highlights",
      rubio: "long straight platinum blonde icy hair",
      pelirrojo: "long straight dark red burgundy hair",
      rosa: "long straight pastel pink hair",
    },
    outfit: {
      elegante: "wearing sophisticated black lace lingerie with garter belt, dark mysterious allure",
      casual: "wearing a black leather jacket over a lace top and ripped skinny jeans, boots",
      fiesta: "wearing a sultry dark red velvet dress with deep neckline and slit",
      "bikini-suave": "wearing a black string bikini, pale skin contrasting dark fabric",
    },
    background: {
      "neon-room": "standing in a dark moody room with pink neon accent lighting, shadows, mysterious atmosphere",
      "beach-night": "standing on a moonlit beach, dark waves, misty night atmosphere, dramatic clouds",
      "studio": "standing in a high-end fashion studio with dramatic directional lighting and black backdrop",
      "car-night": "standing next to a sleek black sports car in a dark alley, neon reflections, film noir mood",
    },
  },
  // ── ALMA ── Latina pechuda XXL, cálida, curves extremas ──
  {
    id: "alma", seed: 4001,
    face: "beautiful thick voluptuous latina woman in her 20s, heart-shaped symmetrical face, big warm dark brown eyes, full pouty lips, cute upturned nose, warm inviting smile, extreme hourglass figure, very slim waist, extremely wide hips, XXL massive natural breasts, tan glow skin, glossy pink lip gloss, warm dewy makeup",
    hair: {
      moreno: "long curly dark brown voluminous hair",
      rubio: "long curly platinum blonde voluminous hair",
      pelirrojo: "long curly red voluminous hair",
      rosa: "long curly neon pink voluminous hair",
    },
    outfit: {
      elegante: "wearing elegant white lace lingerie set that barely contains her curves, garter belt",
      casual: "wearing a very tight white summer blouse unbuttoned showing cleavage and denim shorts",
      fiesta: "wearing a bright red bodycon dress with deep plunge neckline, hugging every curve",
      "bikini-suave": "wearing a white string bikini that struggles to contain her XXL curves",
    },
    background: {
      "neon-room": "standing in a warm pink neon-lit bedroom with tropical decorations and mirror wall",
      "beach-night": "standing on a moonlit tropical beach, gentle waves, warm night atmosphere, palm trees",
      "studio": "standing in a professional studio with warm golden lighting and beige backdrop",
      "car-night": "standing next to a white luxury sports car at night, golden city lights",
    },
  },
  // ── KIRA ── Cyberpunk edgy, azul piercing, actitud ──
  {
    id: "kira", seed: 5001,
    face: "beautiful edgy white woman in her 20s, sharp angular symmetrical face, piercing ice blue eyes, full rebellious lips, straight nose, cyberpunk aesthetic vibe, fit athletic body, slim toned waist, wide hips, large natural breasts, pale skin, dark smokey eye makeup, alternative style",
    hair: {
      moreno: "long messy dark brown hair with cyberpunk style and subtle blue streaks",
      rubio: "long messy platinum blonde hair with cyberpunk style",
      pelirrojo: "long messy red hair with cyberpunk style",
      rosa: "long messy neon pink hair with cyberpunk style",
    },
    outfit: {
      elegante: "wearing futuristic black lace lingerie set with holographic details, garter belt",
      casual: "wearing a cyberpunk style cropped jacket over a mesh top and vinyl leggings, combat boots",
      fiesta: "wearing a holographic iridescent sequin dress with asymmetric neckline",
      "bikini-suave": "wearing a metallic-finish black string bikini, alternative edge",
    },
    background: {
      "neon-room": "standing in a cyberpunk room with holographic neon displays, purple-pink LED strips",
      "beach-night": "standing on a dark beach at night, cyberpunk color grading, moody atmosphere",
      "studio": "standing in a dark studio with neon edge lighting, holographic backdrop",
      "car-night": "standing next to a neon-lit futuristic sports car, holographic billboards reflecting",
    },
  },
  // ── MAYA ── Influencer rubia, glamorosa, doll face ──
  {
    id: "maya", seed: 6001,
    face: "beautiful glamorous white woman in her 20s, perfectly symmetrical doll-like face, sparkling hazel eyes, full pouty lips with gloss, perfect straight nose, influencer aesthetic, fit hourglass figure, slim waist, wide hips, very large natural breasts, sun-kissed bronzed skin, full glam makeup, laminated brows",
    hair: {
      moreno: "long straight dark brown hair with balayage blonde highlights",
      rubio: "long straight platinum blonde silky hair with subtle highlights",
      pelirrojo: "long straight red hair with balayage highlights",
      rosa: "long straight neon pink hair with baby lights",
    },
    outfit: {
      elegante: "wearing luxurious black lace lingerie set with garter belt, glamorous pose",
      casual: "wearing a tight white crop top with matching high-waist yoga leggings, fit vibe",
      fiesta: "wearing a glittering gold bodycon mini dress with plunging V-neckline",
      "bikini-suave": "wearing a black string bikini set, influencer beach aesthetic",
    },
    background: {
      "neon-room": "standing in a pink neon-lit bedroom with luxury decor, mirror wall, glamorous vibe",
      "beach-night": "standing on a luxury tropical beach at night, moonlit ocean, VIP vibe",
      "studio": "standing in a professional photo studio with ring light and white backdrop, influencer shoot",
      "car-night": "standing next to a white luxury sports car at night, city lights, glamorous street setting",
    },
  },
  // ── SASHA ── Black voluptuosa, chocolate skin, confianza ──
  {
    id: "sasha", seed: 7001,
    face: "beautiful curvaceous black woman in her 20s, perfectly round symmetrical face, big captivating dark brown eyes, full luscious lips, cute button nose, confident powerful presence, extreme hourglass figure, very slim waist, extremely wide hips, XXL massive natural breasts, smooth dark chocolate skin with natural sheen, glossy nude lip gloss, subtle glowing highlighter",
    hair: {
      moreno: "long natural black curly hair with volume and defined curls",
      rubio: "long honey blonde curly hair with defined curls",
      pelirrojo: "long burgundy red curly hair with defined curls",
      rosa: "long pastel pink curly hair with defined curls",
    },
    outfit: {
      elegante: "wearing elegant black lace lingerie set with garter belt, chocolate skin glowing against black lace",
      casual: "wearing a very tight white crop top showing cleavage and low-rise jeans, curvy confidence",
      fiesta: "wearing a stunning gold sequin bodycon dress with deep V neckline, curves on display",
      "bikini-suave": "wearing a minimal white string bikini that contrasts beautifully with dark skin",
    },
    background: {
      "neon-room": "standing in a warm amber neon-lit bedroom with gold accents, luxurious vibe",
      "beach-night": "standing on a tropical beach at night, moonlight on dark waves, exotic atmosphere",
      "studio": "standing in a high-fashion photo studio with warm golden lighting, fashion editorial",
      "car-night": "standing next to a white luxury sports car at night, warm city lights reflecting",
    },
  },
  // ── YUKI ── Asiática, delicada pero curves, inocente-sexy ──
  {
    id: "yuki", seed: 8001,
    face: "beautiful exotic asian woman in her 20s, oval delicate symmetrical face, big almond-shaped dark eyes with natural winged eyeliner, full soft pink lips, small elegant nose, cute yet seductive expression, hourglass figure, slim waist, wide hips, large natural breasts, smooth fair porcelain skin with dewy finish, subtle glossy pink makeup, blushed cheeks",
    hair: {
      moreno: "long straight jet black silky hair with subtle blue shine",
      rubio: "long straight platinum blonde silky hair",
      pelirrojo: "long straight dark cherry red silky hair",
      rosa: "long straight pastel pink silky hair",
    },
    outfit: {
      elegante: "wearing delicate black lace lingerie set with garter belt, innocent yet seductive",
      casual: "wearing a very tight white cropped baby tee and low-rise denim skirt, cute and sexy",
      fiesta: "wearing a stunning black satin mini dress with side cutouts and high slit",
      "bikini-suave": "wearing a minimal black string bikini set, porcelain skin glowing",
    },
    background: {
      "neon-room": "standing in a pink neon-lit room with paper lanterns, cute kawaii aesthetic",
      "beach-night": "standing on a moonlit tropical beach, gentle waves, romantic atmosphere",
      "studio": "standing in a clean professional studio with soft pink lighting and white backdrop",
      "car-night": "standing next to a sleek black sports car at night, Tokyo-style neon cityscape",
    },
  },
];

const SUFFIX = "looking directly at camera with a confident sensual expression, standing pose showcasing her full body from mid-thigh up, centered perfectly in frame, studio quality professional photoshoot lighting, photorealistic, ultra detailed face and skin texture, 8K resolution RAW photo, sharp focus on eyes and face, perfectly symmetrical facial features, flawless natural skin with healthy glow, no blemishes, no deformities or distortions, perfect human anatomy, natural beauty, editorial photography style, cinematic quality";

async function generateImage(prompt, seed, outputPath) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=864&height=1024&seed=${seed}&nologo=true&model=flux`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations ${response.status}`);
  const buf = Buffer.from(await response.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Too small (${buf.length})`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  console.log(`  ✓ (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const start = Date.now();
  let total = 0, ok = 0;

  for (const girl of GIRLS) {
    const girlDir = path.join(ROOT, girl.id);
    fs.mkdirSync(girlDir, { recursive: true });

    const hairKeys = Object.keys(girl.hair);
    const outfitKeys = Object.keys(girl.outfit);
    const bgKeys = Object.keys(girl.background);

    const gen = async (fileName, prompt, seed) => {
      total++;
      const filePath = path.join(girlDir, fileName);
      if (fs.existsSync(filePath)) { ok++; return; }
      console.log(`\n[${girl.id}/${fileName.replace('.jpg','')}] seed=${seed}`);
      for (let a = 1; a <= 3; a++) {
        try {
          await generateImage(prompt, seed, filePath);
          ok++;
          return;
        } catch (err) {
          console.log(`  Attempt ${a}: ${err.message.slice(0, 60)}`);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      console.log(`  ✗ Failed`);
    };

    for (const hk of hairKeys) {
      for (const ok of outfitKeys) {
        for (const bk of bgKeys) {
          const fileName = `${hk}_${ok}_${bk}.jpg`;
          const prompt = `${girl.face}, ${girl.hair[hk]}, ${girl.outfit[ok]}, ${girl.background[bk]}, ${SUFFIX}`;
          await gen(fileName, prompt, girl.seed);
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  const failed = total - ok;
  console.log(`\nDone! ${ok}/${total} generated${failed ? ` (${failed} failed)` : ''} in ${elapsed} min`);
}

main().catch(console.error);
