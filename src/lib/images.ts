import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SIMPLE_PROMPTS: Record<string, string> = {
  luna: "a stunning beautiful latina woman with long dark hair, natural beauty",
  nia: "a cute girl with pink hair, gamer style, freckles, natural look",
  vera: "a gorgeous redhead woman with green eyes and freckles, elegant",
  alma: "a beautiful latina woman with curly dark hair, glowing skin",
  kira: "a futuristic woman with short pink bob hair, cyberpunk aesthetic",
  maya: "a gorgeous blonde woman with blue eyes, glamorous fashion",
  sasha: "a stunning curvy black woman with braids, warm confident smile",
  yuki: "a cute japanese girl with long black hair and bangs, shy smile",
  axel: "a handsome muscular hispanic man with brown hair and beard",
  liam: "a handsome young black man with curly hair, warm smile",
  sakura: "anime magical girl with long flowing pink hair, sparkling blue eyes",
  yumi: "anime catgirl with blue hair and cat ears, playful expression",
  rin: "anime tsundere girl with brown twin tails and red ribbons",
};

const ANIME_CHARS = ["sakura", "yumi", "rin"];

function getSeed(girlId: string, hair: string, pose: string, bg: string): number {
  let s = 0;
  for (let i = 0; i < girlId.length; i++) s += girlId.charCodeAt(i);
  for (let i = 0; i < hair.length; i++) s += hair.charCodeAt(i);
  for (let i = 0; i < pose.length; i++) s += pose.charCodeAt(i);
  for (let i = 0; i < bg.length; i++) s += bg.charCodeAt(i);
  return s % 100000;
}

const NEGATIVE = encodeURIComponent(
  "deformed, bad anatomy, disfigured, ugly, distorted, mutated, malformed, " +
  "missing limbs, extra limbs, fused limbs, bad proportions, weird face, " +
  "asymmetrical face, cartoon, anime, drawing, painting, low quality, blurry, " +
  "watermark, text, logo, signature, nipples, nude, topless, explicit"
);

export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? "moreno";
  const p = pose ?? "toalla";
  const b = background ?? "neon-room";

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

  const seed = getSeed(girlId, h, p, b);
  const description = SIMPLE_PROMPTS[girlId] ?? "a beautiful portrait of a woman";
  const style = ANIME_CHARS.includes(girlId) ? "anime style, anime art, anime portrait" : "photorealistic, ultra realistic, portrait photography";
  const category = ANIME_CHARS.includes(girlId) ? "anime" : "realistic woman";

  const prompt = encodeURIComponent(
    `${description}, ${h} hair, ${style}, ${category}, professional portrait, sharp focus on face, perfect face, symmetrical features, beautiful details, elegant lighting, masterful composition`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=768&height=960&nofeed=true&seed=${seed}&negative=${NEGATIVE}`;
}