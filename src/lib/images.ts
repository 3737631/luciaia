import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SDXL_CHARS = ["axel", "liam"];

const NEGATIVE = encodeURIComponent(
  "deformed,bad anatomy,disfigured,ugly,distorted,malformed,missing limbs," +
  "extra limbs,weird face,asymmetric face,blurry,low quality,watermark,text," +
  "logo,signature,cartoon,anime,drawing,painting,3d"
);

const PROMPTS: Record<string, string> = {
  luna: "professional portrait of a beautiful Latina woman with long dark hair, flawless skin, perfect symmetrical face, natural makeup, soft studio lighting, sharp focus on eyes, hyperrealistic, 8K",
  nia: "portrait of a cute girl with pink hair, light freckles, natural beauty, youthful face, soft smile, studio lighting, professional photography, sharp focus, hyperrealistic, 8K",
  vera: "portrait of a stunning redhead woman with green eyes and freckles, elegant, model, professional fashion photography, studio lighting, sharp focus, hyperrealistic, 8K",
  alma: "portrait of a beautiful Latina woman with curly dark hair, glowing radiant skin, warm smile, natural lighting, professional photography, sharp focus on eyes, hyperrealistic, 8K",
  kira: "portrait of a futuristic woman with short pink bob hair, sharp features, cyber chic, studio lighting, professional fashion photography, hyperrealistic, 8K",
  maya: "portrait of a gorgeous blonde woman with blue eyes, glamorous, high fashion model, studio lighting, professional photography, sharp focus, hyperrealistic, 8K",
  sasha: "portrait of a stunning curvy black woman with braids, confident smile, glowing radiant skin, professional studio lighting, sharp focus on eyes, hyperrealistic, 8K",
  yuki: "portrait of a cute Japanese girl with long black hair and bangs, shy sweet smile, soft natural lighting, professional photography, sharp focus, hyperrealistic, 8K",
  axel: "portrait of a handsome muscular Hispanic man with brown hair and trimmed beard, masculine features, confident smile, studio lighting, professional photography, sharp focus, hyperrealistic, 8K",
  liam: "portrait of a handsome young black man with curly black hair, warm friendly smile, professional studio lighting, sharp focus, hyperrealistic, 8K",
  sakura: "anime portrait of a magical girl with long pink hair and sparkly blue eyes, anime style, beautiful detailed eyes, vibrant colors, clean lineart",
  yumi: "anime portrait of a catgirl with blue hair and fluffy cat ears, playful golden eyes, anime style, beautiful detailed eyes, vibrant colors",
  rin: "anime portrait of a tsundere girl with brown twin tails and red ribbons, amber eyes, pouty expression, anime style, beautiful detailed eyes",
};

const ANIME = new Set(["sakura", "yumi", "rin"]);

function getSeed(girlId: string, hair: string, pose: string, bg: string): number {
  let s = 0;
  for (const ch of girlId + hair + pose + bg) s = (s * 31 + ch.charCodeAt(0)) & 0x7fffffff;
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

  if (SDXL_CHARS.includes(girlId)) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  const prompt = PROMPTS[girlId] ?? "professional portrait of a beautiful woman, hyperrealistic, 8K";
  const s = getSeed(girlId, h, p, b);
  const style = ANIME.has(girlId) ? "" : "photorealistic,studio portrait,soft lighting,";
  const encoded = encodeURIComponent(`${prompt},${style}detailed face,perfect anatomy,no defects`);
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=960&nofeed=true&seed=${s}&negative=${NEGATIVE}`;
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
  const prompt = PROMPTS[girlId] ?? "professional portrait, beautiful face, hyperrealistic, 8K";
  const s = (getSeed(girlId, h, p, b) % 50000) + 50000 + (Date.now() % 500);
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=960&nofeed=true&seed=${s}&negative=${NEGATIVE}`;
}