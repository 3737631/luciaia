import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Characters that have local files pre-generated (full set of 64 images)
const LOCAL_CHARS = ["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"];

type Category = "realistic" | "anime";

const CHAR_CATEGORY: Record<string, Category> = {
  axel: "realistic",
  liam: "realistic",
  sakura: "anime",
  yumi: "anime",
  rin: "anime",
};

// Prompts for characters without full local image sets (generated on-the-fly via Pollinations)
const FALLBACK_PROMPTS: Record<string, (hair: string, pose: string, bg: string) => string> = {
  axel: (hair, pose, bg) =>
    `professional photo of a handsome muscular man with ${hair} hair, shirtless wearing ${pose === "toalla" ? "a white towel wrapped around waist" : pose === "ropa" ? "a tank top and gym shorts" : pose === "casual" ? "a hoodie and jeans" : "gym clothes"}, gym background, ${bg === "neon-room" ? "neon-lit bedroom with gym equipment" : bg === "beach-night" ? "beach at night with moonlight" : bg === "studio" ? "photography studio with softbox lighting" : "inside a car at night with city lights"}, photorealistic skin texture, defined abs and muscles, sharp focus, natural lighting, looking at camera with confident expression, full body visible, all limbs visible, 8K quality, perfect face, symmetrical features, handsome, no defects`,
  liam: (hair, pose, bg) =>
    `candid photo of a cute young man with ${hair} hair, wearing ${pose === "casual" ? "a hoodie and sweatpants" : pose === "ropa" ? "a t-shirt and jeans" : pose === "bata" ? "a casual button-up shirt" : "a sweater"}, cozy room setting, ${bg === "neon-room" ? "gaming room with RGB lights and posters" : bg === "beach-night" ? "beach boardwalk at night with string lights" : bg === "studio" ? "cozy bedroom with warm lamp light" : "sitting in a car with soft interior light"}, photorealistic, natural skin texture with subtle pores, soft warm lighting, shy smile, looking at camera, warm intimate atmosphere, full body visible, all limbs visible, perfect skin, handsome face, no defects, natural pose`,
  sakura: (hair, pose, bg) =>
    `anime style beautiful magical girl with long flowing ${hair} hair, wearing ${pose === "bata" ? "a magical girl sailor outfit with skirt" : pose === "tanga" ? "a pink dress with ribbons" : pose === "ropa" ? "a school uniform" : "a kimono with floral patterns"}, ${bg === "neon-room" ? "magical fantasy bedroom with floating glowing orbs and sparkles" : bg === "beach-night" ? "magical beach under a starry sky with moonlight reflecting on water" : bg === "studio" ? "enchanted forest with glowing flowers and fireflies" : "magical carriage with velvet seats and golden trim"}, high quality anime art style, detailed large eyes with cute highlights, beautiful delicate face, sparkle effects, vibrant saturated colors, cute loving expression, full body visible, all limbs visible, perfect anatomy, no defects, masterful anime illustration, clean lineart`,
  yumi: (hair, pose, bg) =>
    `anime style cute catgirl with ${hair} hair and fluffy cat ears on top of head, wearing ${pose === "bata" ? "a maid outfit with lace apron" : pose === "tanga" ? "a bikini top and denim shorts" : pose === "ropa" ? "a school uniform with cat tail visible" : "a cosplay costume with bell collar"}, ${bg === "neon-room" ? "neon-lit bedroom with cat toys and scratching post" : bg === "beach-night" ? "beach at sunset with warm golden light" : bg === "studio" ? "cozy room with pillows and cat tower" : "car interior with plush cat seat cover"}, high quality anime art, detailed expressive eyes, fluffy cat tail visible behind, beautiful face with cute nose, playful teasing expression, vibrant colors, full body visible, all limbs visible, perfect anatomy, no defects, masterful anime illustration, clean lineart`,
  rin: (hair, pose, bg) =>
    `anime style tsundere girl with ${hair} hair styled in twin tails with ribbons, wearing ${pose === "ropa" ? "a school uniform with red bow and blazer" : pose === "casual" ? "a winter coat and striped scarf" : pose === "bata" ? "a tracksuit" : "a red dress with white trim"}, ${bg === "neon-room" ? "empty classroom after school with sunset light through windows" : bg === "beach-night" ? "school rooftop at night with city lights in distance" : bg === "studio" ? "traditional Japanese room with tatami mats and sliding doors" : "walking home at night under cherry blossom trees with street lamps"}, high quality anime art, detailed eyes with tsundere pout, beautiful face with blush, pouty annoyed expression hiding affection, vibrant colors, dramatic lighting, full body visible, all limbs visible, perfect anatomy, no defects, masterful anime illustration, clean lineart`,
};

function getFallbackUrl(girlId: string, hair: string, pose: string, bg: string): string | null {
  const promptFn = FALLBACK_PROMPTS[girlId];
  if (!promptFn) return null;

  const category = CHAR_CATEGORY[girlId] ?? "realistic";
  const suffix = category === "anime"
    ? ", high quality anime art, detailed, beautiful, no defects"
    : ", ultra realistic, photorealistic, no cartoon, no anime, no defects, perfect anatomy";

  const prompt = encodeURIComponent(promptFn(hair, pose, bg) + suffix);
  const negative = encodeURIComponent(
    "watermark, text, signature, logo, low quality, blurry, ugly, deformed, bad anatomy, " +
    "missing limbs, extra limbs, mutated, bad proportions, distorted, disfigured, " +
    "fused body, conjoined, nipples, nude, topless, explicit"
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=640&nofeed=true&seed=${hair.charCodeAt(0) + pose.charCodeAt(0) + bg.charCodeAt(0)}&negative=${negative}`;
}

const RECENT_SEEDS: Record<string, number> = {};

export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? "moreno";
  const p = pose ?? "toalla";
  const b = background ?? "neon-room";

  // Characters without full local image sets → AI-generated via Pollinations
  if (!LOCAL_CHARS.includes(girlId)) {
    const fallback = getFallbackUrl(girlId, h, p, b);
    if (fallback) return fallback;
  }

  return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? "moreno";
  const p = pose ?? "toalla";
  const b = background ?? "neon-room";

  // Generate a unique seed for fallback images
  const key = `${girlId}_${h}_${p}_${b}`;
  RECENT_SEEDS[key] = (RECENT_SEEDS[key] || 1000) + 1;
  const seed = RECENT_SEEDS[key];

  const cat = CHAR_CATEGORY[girlId] ?? "realistic";
  const style = cat === "anime"
    ? "high quality anime art style, beautiful detailed eyes, perfect face, vibrant colors, covered chest, no nudity"
    : "ultra realistic portrait photography, photorealistic skin texture, visible pores, perfect face, symmetrical features, beautiful, no deformities, sharp focus, professional lighting";

  const prompt = encodeURIComponent(
    `portrait of ${girlId === "sakura" ? "magical girl with pink hair" : girlId === "yumi" ? "catgirl with cat ears" : girlId === "rin" ? "tsundere girl with twin tails" : girlId === "axel" ? "handsome muscular man" : girlId === "liam" ? "cute young man" : girlId === "luna" ? "Latina woman with dark hair" : girlId === "nia" ? "girl with pink hair gamer" : girlId === "vera" ? "redhead woman" : girlId === "alma" ? "Latina woman with curly hair" : girlId === "kira" ? "futuristic woman" : girlId === "maya" ? "blonde woman" : girlId === "sasha" ? "curvy woman with braids" : "young woman"}, ` +
    `${h} hair, ${p} pose, ${b} background, ${style}`
  );
  const negative = encodeURIComponent(
    "bad anatomy, missing limbs, deformed, ugly, disfigured, watermark, text, logo, " +
    "cartoon, anime, drawing (only for anime characters), low quality, blurry, " +
    "extra limbs, fused limbs, bad proportions, nipples, nude, topless"
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=768&height=960&nofeed=true&seed=${seed}&negative=${negative}`;
}
