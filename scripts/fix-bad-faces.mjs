import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public/girls");

const GIRLS_DATA = [
  { id: "luna", seed: 1001, face: "beautiful voluptuous latina woman in her 20s, oval symmetrical face, big expressive brown eyes with long lashes, full kissable lips, straight nose, defined jawline, hourglass figure, very slim waist, wide hips, very large natural breasts, soft caramel skin with healthy glow, subtle glossy makeup, perfectly arched eyebrows",
    hair: { moreno: "long straight dark brown silky hair", rubio: "long straight platinum blonde silky hair", pelirrojo: "long straight red silky hair", rosa: "long straight neon pink silky hair" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt and fishnet stockings, seductive confidence", casual: "wearing a very tight white ribbed crop top that emphasizes her curves and low-rise skinny jeans", fiesta: "wearing a dazzling silver sequin mini dress with plunging neckline and thigh-high slit", "bikini-suave": "wearing a minimal black string bikini that shows off her full curves" },
    background: { "neon-room": "standing in a pink neon-lit bedroom with LED strips behind her, moody sensual atmosphere", "beach-night": "standing on a tropical beach at night, moonlight reflecting on gentle waves, palm trees silhouetted, romantic mood", "studio": "standing in a professional photo studio with soft diffused lighting and curved white backdrop, fashion editorial", "car-night": "standing next to a black luxury sports car at night, city lights reflecting on wet pavement, cinematic street glow" } },
  { id: "nia", seed: 2001, face: "beautiful athletic white woman in her 20s, round cute symmetrical face, big bright green eyes, full soft lips, small button nose, light freckles across nose and cheeks, girl-next-door aesthetic, slim toned waist, wide hips, large natural breasts, soft fair skin with natural blush, minimal natural makeup",
    hair: { moreno: "long wavy brown hair with subtle caramel highlights", rubio: "long wavy platinum blonde hair with subtle highlights", pelirrojo: "long wavy red hair with subtle copper highlights", rosa: "long wavy neon pink hair with subtle highlights" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt, playful innocent vibe", casual: "wearing a tight vintage gamer girl t-shirt tied at the waist and denim shorts", fiesta: "wearing a sparkly purple sequin party dress with sweetheart neckline", "bikini-suave": "wearing a black string bikini set, playful smile" },
    background: { "neon-room": "standing in a gaming room with RGB LED strips on walls, gaming chair behind her, cozy setup", "beach-night": "standing on a tropical beach at night, moonlight on waves, palm trees, warm breeze feeling", "studio": "standing in a professional photo studio with soft diffused lighting, minimal aesthetic", "car-night": "standing next to a red sports car at night, neon signs reflecting on wet street" } },
  { id: "alma", seed: 4001, face: "beautiful thick voluptuous latina woman in her 20s, heart-shaped symmetrical face, big warm dark brown eyes, full pouty lips, cute upturned nose, warm inviting smile, extreme hourglass figure, very slim waist, extremely wide hips, XXL massive natural breasts, tan glow skin, glossy pink lip gloss, warm dewy makeup",
    hair: { moreno: "long curly dark brown voluminous hair", rubio: "long curly platinum blonde voluminous hair", pelirrojo: "long curly red voluminous hair", rosa: "long curly neon pink voluminous hair" },
    outfit: { elegante: "wearing elegant white lace lingerie set that barely contains her curves, garter belt", casual: "wearing a very tight white summer blouse unbuttoned showing cleavage and denim shorts", fiesta: "wearing a bright red bodycon dress with deep plunge neckline, hugging every curve", "bikini-suave": "wearing a white string bikini that struggles to contain her XXL curves" },
    background: { "neon-room": "standing in a warm pink neon-lit bedroom with tropical decorations and mirror wall", "beach-night": "standing on a moonlit tropical beach, gentle waves, warm night atmosphere, palm trees", "studio": "standing in a professional studio with warm golden lighting and beige backdrop", "car-night": "standing next to a white luxury sports car at night, golden city lights" } },
  { id: "kira", seed: 5001, face: "beautiful edgy white woman in her 20s, sharp angular symmetrical face, piercing ice blue eyes, full rebellious lips, straight nose, cyberpunk aesthetic vibe, fit athletic body, slim toned waist, wide hips, large natural breasts, pale skin, dark smokey eye makeup, alternative style",
    hair: { moreno: "long messy dark brown hair with cyberpunk style and subtle blue streaks", rubio: "long messy platinum blonde hair with cyberpunk style", pelirrojo: "long messy red hair with cyberpunk style", rosa: "long messy neon pink hair with cyberpunk style" },
    outfit: { elegante: "wearing futuristic black lace lingerie set with holographic details, garter belt", casual: "wearing a cyberpunk style cropped jacket over a mesh top and vinyl leggings, combat boots", fiesta: "wearing a holographic iridescent sequin dress with asymmetric neckline", "bikini-suave": "wearing a metallic-finish black string bikini, alternative edge" },
    background: { "neon-room": "standing in a cyberpunk room with holographic neon displays, purple-pink LED strips", "beach-night": "standing on a dark beach at night, cyberpunk color grading, moody atmosphere", "studio": "standing in a dark studio with neon edge lighting, holographic backdrop", "car-night": "standing next to a neon-lit futuristic sports car, holographic billboards reflecting" } },
  { id: "sasha", seed: 7001, face: "beautiful curvaceous black woman in her 20s, perfectly round symmetrical face, big captivating dark brown eyes, full luscious lips, cute button nose, confident powerful presence, extreme hourglass figure, very slim waist, extremely wide hips, XXL massive natural breasts, smooth dark chocolate skin with natural sheen, glossy nude lip gloss, subtle glowing highlighter",
    hair: { moreno: "long natural black curly hair with volume and defined curls", rubio: "long honey blonde curly hair with defined curls", pelirrojo: "long burgundy red curly hair with defined curls", rosa: "long pastel pink curly hair with defined curls" },
    outfit: { elegante: "wearing elegant black lace lingerie set with garter belt, chocolate skin glowing against black lace", casual: "wearing a very tight white crop top showing cleavage and low-rise jeans, curvy confidence", fiesta: "wearing a stunning gold sequin bodycon dress with deep V neckline, curves on display", "bikini-suave": "wearing a minimal white string bikini that contrasts beautifully with dark skin" },
    background: { "neon-room": "standing in a warm amber neon-lit bedroom with gold accents, luxurious vibe", "beach-night": "standing on a tropical beach at night, moonlight on dark waves, exotic atmosphere", "studio": "standing in a high-fashion photo studio with warm golden lighting, fashion editorial", "car-night": "standing next to a white luxury sports car at night, warm city lights reflecting" } },
];

// For face_cut_top: keep full body but force proper framing
const PORTRAIT_SUFFIX = "FULL BODY SHOT from mid-thigh up, FACE POSITIONED IN THE CENTER THIRD of the frame vertically, the top of the head must be well below the top edge with at least 15 percent headroom above, hair fully visible from crown, NO CROPPING of the head or face, face at eye level centered vertically, looking directly at camera with a confident sensual expression, standing pose showcasing her full body, centered perfectly in frame, studio quality professional photoshoot lighting, photorealistic, ultra detailed face and skin texture, 8K resolution RAW photo, sharp focus on eyes and face, perfectly symmetrical facial features, flawless natural skin with healthy glow, no blemishes, no deformities or distortions, perfect human anatomy, natural beauty, editorial photography style, cinematic quality";

// For multiple_faces: explicitly ban any artifact-causing elements
const SINGLE_SUFFIX = "SINGLE PERSON ONLY, exactly one person in the image, NO reflections, NO mirrors, NO windows, NO glass surfaces, NO duplicates, NO ghosting, NO second face, if you create more than one person the image is wrong, looking directly at camera with a confident sensual expression, standing pose showcasing her full body from mid-thigh up, centered perfectly in frame, studio quality professional photoshoot lighting, photorealistic, ultra detailed face and skin texture, 8K resolution RAW photo, sharp focus on eyes and face, perfectly symmetrical facial features, flawless natural skin with healthy glow, no blemishes, no deformities or distortions, perfect human anatomy, natural beauty, editorial photography style, cinematic quality";

const BAD_IMAGES = [
  { girl: "luna", file: "moreno_casual_neon-room", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "moreno_elegante_neon-room", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "moreno_fiesta_neon-room", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "pelirrojo_casual_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "pelirrojo_elegante_neon-room", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "rubio_elegante_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "rubio_fiesta_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "luna", file: "moreno_elegante_beach-night", issue: "multiple_faces", suffix: SINGLE_SUFFIX },
  { girl: "luna", file: "pelirrojo_elegante_car-night", issue: "multiple_faces", suffix: SINGLE_SUFFIX },
  { girl: "luna", file: "rosa_elegante_neon-room", issue: "multiple_faces", suffix: SINGLE_SUFFIX },
  { girl: "nia", file: "moreno_elegante_car-night", issue: "multiple_faces", suffix: SINGLE_SUFFIX },
  { girl: "kira", file: "moreno_bikini-suave_beach-night", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "moreno_bikini-suave_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "moreno_elegante_beach-night", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "moreno_elegante_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "moreno_fiesta_beach-night", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "pelirrojo_bikini-suave_beach-night", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "pelirrojo_bikini-suave_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "pelirrojo_elegante_beach-night", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "pelirrojo_elegante_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "kira", file: "pelirrojo_fiesta_studio", issue: "face_cut_top", suffix: PORTRAIT_SUFFIX },
  { girl: "sasha", file: "rosa_elegante_beach-night", issue: "multiple_faces", suffix: SINGLE_SUFFIX },
];

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
  let ok = 0, failed = 0;

  for (const entry of BAD_IMAGES) {
    const gd = GIRLS_DATA.find(g => g.id === entry.girl);
    if (!gd) { console.log(`Unknown girl: ${entry.girl}`); continue; }

    const parts = entry.file.split("_");
    const bg = parts.pop();
    const outfit = parts.pop();
    const hair = parts.join("_");

    // Build prompt with the targeted suffix
    const prompt = `${gd.face}, ${gd.hair[hair]}, ${gd.outfit[outfit]}, ${gd.background[bg]}, ${entry.suffix}`;
    const filePath = path.join(ROOT, entry.girl, `${entry.file}.jpg`);

    // Try first with original seed
    console.log(`\n[${entry.girl}/${entry.file}] issue=${entry.issue} seed=${gd.seed}`);
    let success = false;

    for (let a = 1; a <= 3; a++) {
      try {
        await generateImage(prompt, gd.seed, filePath);
        success = true;
        break;
      } catch (err) {
        console.log(`  Attempt ${a}: ${err.message.slice(0, 60)}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    // If original seed failed with portrait, try alternative seed
    if (!success) {
      console.log(`  Retry with seed ${gd.seed + 777}...`);
      for (let a = 1; a <= 3; a++) {
        try {
          await generateImage(prompt, gd.seed + 777, filePath);
          success = true;
          ok++; // count as extra
          break;
        } catch (err) {
          console.log(`  Attempt ${a}: ${err.message.slice(0, 60)}`);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }

    if (success) { ok++; }
    else { console.log(`  ✗ Failed`); failed++; }
    await new Promise(r => setTimeout(r, 1500));
  }

  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);
  console.log(`\nDone! ${ok} fixed, ${failed} failed in ${elapsed} min`);
}

main().catch(console.error);
