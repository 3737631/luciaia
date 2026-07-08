import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public/girls");

const QUALITY = "photorealistic, ultra detailed face and skin texture, 8K resolution RAW photo, sharp focus on eyes and face, perfectly symmetrical facial features, flawless natural skin with healthy glow, no blemishes, no deformities or distortions, perfect human anatomy, natural beauty, cinematic quality, professional studio lighting";

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
      toalla: "fresh out of the shower, wrapped in a tiny white towel barely covering her huge caramel breasts, wet skin glistening with water droplets running down her neck and shoulders, towel tucked precariously just above her wide hips, looking over her shoulder at camera with a teasing seductive smile, steam rising around her, sensual post-shower glow",
      estrellas: "completely topless except for glittery star-shaped pasties covering her nipples, wearing only a tiny black lace thong, hands on her wide hips showing off her extreme hourglass figure, full body on display, golden hour sunlight streaming through a window creating a warm glow on her caramel skin, confident sultry gaze directly at camera",
      tanga: "lying face down on rumpled black silk sheets, wearing only a minuscule black string thong that disappears between her large rounded glutes, her back arched seductively, looking back at the camera over her shoulder with a mischievous playful smirk, her long dark hair cascading down her spine, soft morning light filtering through sheer curtains",
      bata: "reclining sideways on a plush velvet chaise lounge, wearing a sheer floor-length white silk robe hanging wide open to reveal black lace lingerie, one strap teasingly falling off her shoulder, her long legs elegantly crossed with one heel dangling from her toes, looking at camera through heavy-lidded eyes with a dreamy seductive expression, moody candlelit atmosphere",
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
      toalla: "fresh from the shower, wrapped in a fluffy white towel secured just above her breasts, her fair skin glowing and slightly pink from the warm water, towel clinging to her curves, wet hair slicked back, looking over her shoulder with a shy but playful smile, steam and water droplets on her skin, innocent but sensual post-shower moment",
      estrellas: "wearing only shimmering silver star-shaped pasties covering her nipples and a tiny white lace thong, her fit athletic body fully exposed, one hand running through her wet hair, the other resting on her hip, sun-kissed freckles visible across her nose, a playful innocent smile contrasting with her revealing outfit, natural daylight streaming in",
      tanga: "bent over a gaming desk wearing only a tiny pink string thong, her round perky glutes fully on display, looking back at the camera with a cheeky grin, RGB gaming setup glowing around her, one knee resting on her gaming chair, playful and confident vibe, cool blue and purple neon lighting creating a cyberpunk atmosphere",
      bata: "sitting cross-legged on a gaming chair, wearing an oversized open silk robe in pastel pink that falls off one shoulder revealing a delicate bralette and lace panties, biting her lower lip playfully while looking at the camera, a gaming controller resting in her lap, bedroom neon lights creating a cozy intimate atmosphere",
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
      toalla: "emerging from a steam-filled bathroom, wrapped in a dark grey towel that contrasts with her porcelain pale skin, towel wrapped high showing her long legs, wet hair clinging to her face and neck, water droplets on her pale shoulders, her intense dark eyes staring directly at the camera with a mysterious sultry expression, dramatic shadows playing across her face",
      estrellas: "wearing only black star-shaped pasties covering her nipples and a high-cut black lace thong, her pale ethereal body completely on display, standing in a shaft of moonlight, one arm raised above her head, the other resting on her hip, her intense gaze piercing the camera, long dark hair flowing, dramatic chiaroscuro lighting creating deep shadows across her curves",
      tanga: "kneeling on a dark velvet ottoman, wearing only a tiny black satin thong, her pale full glutes prominently displayed, torso twisted to look back at camera with a dark seductive stare, one hand resting on her thigh, long dark hair covering part of her face, moody atmospheric lighting with deep shadows, femme fatale energy radiating",
      bata: "reclining on a dark leather chaise longue, wearing a sheer black silk robe tied loosely at the waist, gaping open to reveal most of her pale body with black lace lingerie underneath, one leg extended along the chaise, the other bent at the knee, her head tilted back slightly, looking down at the camera with a dominant predatory gaze, dim candlelit room, shadows dancing across her porcelain skin",
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
      toalla: "fresh out of a steamy shower, wrapped in a white towel that barely contains her enormous XXL breasts, the towel stretched tight across her chest, wet tan skin gleaming with water droplets, her voluminous curly hair damp and tousled, looking at the camera with a warm inviting smile, towel sitting dangerously low on her wide hips, sensual curves on full display, soft warm bathroom lighting",
      estrellas: "wearing only large gold star-shaped pasties barely covering her enormous nipples and a tiny gold chain belt with a matching thong, her massive XXL breasts and extreme curves completely on display, her hands holding her hair up above her head, pushing her chest forward, warm golden sunlight illuminating her tan skin, a confident radiant smile, curves spilling in every direction",
      tanga: "lying on her stomach across a tropical print bedspread, wearing only a tiny white string thong that struggles to contain her massive glutes, her extreme hourglass shape visible from every angle, looking back at the camera with a sweet warm smile over her shoulder, her massive breasts pressing into the bed beneath her, tropical sunlight streaming through bamboo blinds creating warm stripes across her body",
      bata: "leaning against a doorway wearing a sheer turquoise silk robe that barely closes over her XXL curves, the fabric straining across her massive chest with a single tie holding it together, her curly hair cascading over her shoulders, one leg peeking out from the robe slit, looking at the camera with a warm seductive smile, golden hour light creating a halo around her, curves exploding from every opening of the robe",
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
      toalla: "stepping out of a chrome-and-neon bathroom, wrapped in a holographic metallic-print towel that shifts colors, her pale cyberpunk body dripping wet, water droplets catching the neon light like diamonds, towel wrapped dangerously low on her hips, her sharp ice blue eyes staring directly at the camera with rebellious attitude, steam mixing with neon light creating an ethereal glow",
      estrellas: "wearing only holographic iridescent star pasties covering her nipples and a matching metallic thong, her fit toned body completely exposed, cyberpunk body modifications visible, standing with legs apart in a powerful confident stance, arms crossed beneath her chest pushing up her breasts, piercing blue eyes challenging the camera, purple and pink neon lights creating a futuristic glow across her pale skin",
      tanga: "bent forward over a neon-lit motorcycle, wearing only a tiny metallic silver thong, her toned athletic glutes on full display, looking back at the camera with a rebellious smirk, holographic tattoos catching the neon light, her messy cyberpunk hair falling forward, futuristic city lights reflecting off her damp skin in the background, night cyberpunk atmosphere with rain-slicked streets",
      bata: "sitting on a neon-lit platform wearing a sheer iridescent cyberpunk robe made of holographic fabric that shifts colors as she moves, the robe completely open showing her toned body in metallic lingerie, one leg pulled up to her chest, the other dangling, looking directly at the camera with an intense rebellious stare, holographic projections swirling around her, futuristic cyberpunk bedroom with glowing panels",
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
      toalla: "just stepped out of a marble bathroom, wrapped in a plush white hotel towel that barely contains her bronzed curves, towel cinched above her large breasts, water droplets sparkling on her sun-kissed skin like glitter, her perfectly styled hair pulled up in a messy bun, looking over her shoulder with a glamorous influencer pout, soft diffused bathroom lighting creating a luxurious spa atmosphere",
      estrellas: "wearing only rose-gold star pasties covering her nipples and a tiny matching thong with a 'VIP' charm, her perfectly contoured influencer body on full display, one hand on her hip pushing out her curves, the other holding her phone camera for a mirror selfie pose, full glam makeup and glossy lips, perfect ring light catching her bronzed skin, luxurious bedroom with designer bags in background",
      tanga: "doing an yoga pose on a marble floor, bent forward with legs spread, wearing only a tiny peach-colored seamless thong, her perfectly shaped glutes lifted and on full display, upper body twisted to look back at the camera with a flawless pout, her hair swept to one side, wearing full glam makeup even in this position, natural sunlight streaming through floor-to-ceiling windows, luxury penthouse aesthetic",
      bata: "lounging across a king-sized bed with white silk sheets, wearing a sheer champagne-colored silk robe tied loosely, completely open to reveal a lacy babydoll underneath, her long blonde hair fanned out on the pillow, one hand resting behind her head, the other tracing down her body, looking at the camera with a soft glamorous smile, morning light filtering through sheer curtains, luxurious hotel suite vibe",
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
      toalla: "emerging from a steam room, wrapped in a gold-rimmed white towel that struggles to contain her enormous XXL curves, her dark chocolate skin glistening with moisture, water droplets catching the light like golden beads on her skin, her voluminous natural curls damp and defined, looking at the camera with a confident knowing smile, steam swirling around her creating a luxurious spa atmosphere, her massive breasts pushing against the damp towel",
      estrellas: "wearing only gold glitter star pasties covering her nipples and a tiny gold chain-link thong, her extreme hourglass curves completely on display, her hands raised above her head showcasing her enormous breasts and tiny waist, golden hour sunlight creating a radiant halo around her dark skin, a powerful confident smile, her natural curls flowing, African art and luxury decor visible around her",
      tanga: "kneeling on a plush fur rug, wearing only a tiny leopard-print thong, her massive perfectly rounded glutes on full display, her upper body twisted powerfully to look back at the camera with a confident seductive gaze that commands attention, one hand resting on her hip, the other touching her hair, warm golden lighting making her dark skin glow like melted chocolate, luxury apartment aesthetic",
      bata: "standing in a doorway with arms crossed beneath her enormous chest, wearing a sheer gold silk robe that hangs completely open revealing every curve of her body with only a tiny gold thong underneath, her natural afro framing her face like a crown, looking directly at the camera with a powerful confident expression that says she owns the room, warm amber lighting creating deep shadows that emphasize every curve, luxurious vibe with gold accents everywhere",
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
      toalla: "just stepped out of an ofuro bath, wrapped in a soft white towel that contrasts with her porcelain skin, her large breasts pressing against the damp fabric, wet hair slicked back with a few strands framing her face, her cheeks flushed pink from the hot bath, looking at the camera with a shy innocent smile through lowered lashes, delicate water droplets on her shoulders, steam creating a soft dreamy atmosphere, traditional japanese wooden bath visible behind her",
      estrellas: "wearing only delicate pink cherry blossom star pasties covering her nipples and a tiny white lace thong with a small bow at the hip, her porcelain doll-like body on display, standing with her hands clasped behind her back pushing her chest forward slightly, tilting her head with a shy coy smile, her long dark hair flowing, soft pink sakura petals floating around her, dreamy romantic atmosphere with pink and purple tones",
      tanga: "lying on her stomach across a silk futon, wearing only a tiny white lace thong with a bow on each hip, her delicate but shapely glutes on display, looking back at the camera with wide innocent eyes and a small shy smile, one hand covering her mouth as if giggling, her long hair spread across the pillow, soft pink lighting creating a dreamy kawaii atmosphere, paper lanterns and cherry blossom decor in the background",
      bata: "sitting on a window seat overlooking Tokyo at night, wearing a sheer white silk robe with embroidered cherry blossoms, the robe open to reveal her pale body in delicate white lace lingerie, her legs pulled up to her chest with her chin resting on her knees, looking out the window with a dreamy expression then glancing at the camera with a soft shy smile, city lights twinkling behind her, romantic moonlit atmosphere",
    },
    background: {
      "neon-room": "standing in a pink neon-lit room with paper lanterns, cute kawaii aesthetic",
      "beach-night": "standing on a moonlit tropical beach, gentle waves, romantic atmosphere",
      "studio": "standing in a clean professional studio with soft pink lighting and white backdrop",
      "car-night": "standing next to a sleek black sports car at night, Tokyo-style neon cityscape",
    },
  },
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
          const prompt = `${girl.face}, ${girl.hair[hk]}, ${girl.outfit[ok]}, ${girl.background[bk]}, ${QUALITY}`;
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
