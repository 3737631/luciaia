import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Characters that have high quality SDXL images (1.3MB+) already generated
const SDXL_CHARS = ["axel", "liam"];

// All characters except SDXL ones will use Pollinations AI for the circle image
const AI_CHARS = ["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki", "sakura", "yumi", "rin"];

const ANIME_CHARS = ["sakura", "yumi", "rin"];

function charDesc(id: string): string {
  const map: Record<string, string> = {
    luna: "stunning Latina woman with long dark hair, perfect skin, beautiful face",
    nia: "cute girl with pink hair, light freckles, natural beauty, youthful",
    vera: "gorgeous redhead woman with green eyes, freckles, elegant, model look",
    alma: "beautiful Latina woman with voluminous curly dark hair, radiant glow",
    kira: "futuristic woman with short pink bob hair, sharp features, cyber chic",
    maya: "gorgeous blonde woman with blue eyes, glamorous, high fashion",
    sasha: "stunning curvy black woman with braids, confident smile, radiant skin",
    yuki: "cute Japanese girl with long black hair and bangs, shy sweet face",
    axel: "handsome muscular Hispanic man with brown hair, trimmed beard, masculine",
    liam: "handsome young black man with curly black hair, warm friendly smile",
    sakura: "beautiful anime magical girl with long flowing pink hair, big sparkly blue eyes",
    yumi: "cute anime catgirl with blue hair and fluffy cat ears, playful golden eyes",
    rin: "beautiful anime tsundere girl with brown twin tails and red ribbons, amber eyes",
  };
  return map[id] ?? "beautiful person, perfect face";
}

const NEGATIVE = encodeURIComponent(
  "deformed body, bad anatomy, disfigured, ugly, mutated, malformed, " +
  "missing limbs, extra limbs, fused limbs, bad proportions, distorted face, " +
  "asymmetrical face, weird eyes, wrong eyes, closed eyes, blurry, low quality, " +
  "watermark, text, logo, signature, nipples, nude, topless, explicit"
);

function getSeed(girlId: string, hair: string, pose: string, bg: string): number {
  let s = 0;
  for (const ch of girlId + hair + pose + bg) s += ch.charCodeAt(0);
  return (s % 90000) + 10000;
}

export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? "moreno";
  const p = pose ?? "toalla";
  const b = background ?? "neon-room";

  // Characters with SDXL images use local file
  if (SDXL_CHARS.includes(girlId)) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  // Characters without SDXL use Pollinations AI for high quality
  if (AI_CHARS.includes(girlId)) {
    return getPollinationsUrl(girlId, h, p, b);
  }

  // Fallback for any unknown character
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
  // Always return Pollinations as fallback (never show "Sin imagen")
  const seed = (getSeed(girlId, h, p, b) % 80000) + 20000 + Date.now() % 1000;
  return getPollinationsUrl(girlId, h, p, b, seed);
}

function getPollinationsUrl(
  girlId: string,
  hair: string,
  pose: string,
  bg: string,
  seed?: number,
): string {
  const s = seed ?? getSeed(girlId, hair, pose, bg);
  const isAnime = ANIME_CHARS.includes(girlId);
  const desc = charDesc(girlId);

  const basePrompt = isAnime
    ? `anime portrait of ${desc}, anime art style, beautiful detailed eyes, vibrant colors, clean sharp lineart, masterful anime illustration, perfect face`
    : `portrait of ${desc}, ${hair} hair, photorealistic, ultra realistic, professional studio portrait, sharp focus on face, perfect symmetrical face, flawless skin, elegant natural makeup, soft natural lighting, high quality photography, 8K`;

  const prompt = encodeURIComponent(`${basePrompt}, highly detailed, perfect anatomy, no deformities`);

  const w = isAnime ? 768 : 896;
  const h = isAnime ? 960 : 1152;

  return `https://image.pollinations.ai/prompt/${prompt}?width=${w}&height=${h}&nofeed=true&seed=${s}&negative=${NEGATIVE}`;
}