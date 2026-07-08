import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Characters that have local files pre-generated
const LOCAL_CHARS = ["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki", "axel", "liam", "sakura", "yumi", "rin"];

// Prompts for characters without local files (generated on-the-fly via Pollinations)
const FALLBACK_PROMPTS: Record<string, (hair: string, pose: string, bg: string) => string> = {
  axel: (hair, pose, bg) =>
    `professional photo of a handsome muscular man ${hair} hair, wearing ${pose === "toalla" ? "a white towel" : pose === "tanga" ? "boxer briefs" : pose === "bata" ? "a silk robe" : "a tank top and gym shorts"}, ${bg === "neon-room" ? "in a neon-lit bedroom" : bg === "beach-night" ? "on a beach at night" : bg === "studio" ? "in a photography studio" : "inside a car at night"}, photorealistic skin texture, detailed muscles, sharp focus, natural lighting, looking at camera, confident expression, full body visible, all limbs visible, 8K quality`,
  liam: (hair, pose, bg) =>
    `candid photo of a cute young man ${hair} hair, wearing ${pose === "toalla" ? "a hoodie and sweatpants" : pose === "tanga" ? "gaming headset and t-shirt" : pose === "bata" ? "a casual button-up shirt" : "a sweater and jeans"}, ${bg === "neon-room" ? "in a gaming room with RGB lights" : bg === "beach-night" ? "on a beach boardwalk at night" : bg === "studio" ? "in a cozy bedroom" : "sitting in a car"}, photorealistic, natural skin texture, soft lighting, shy smile, warm atmosphere, full body visible, all limbs visible`,
  sakura: (hair, pose, bg) =>
    `anime style beautiful young woman with long ${hair} hair, wearing ${pose === "toalla" ? "a magical girl sailor outfit" : pose === "tanga" ? "a pink dress" : pose === "bata" ? "a school uniform" : "a kimono"}, ${bg === "neon-room" ? "in a magical fantasy bedroom with glowing orbs" : bg === "beach-night" ? "on a magical beach under a starry sky" : bg === "studio" ? "in a fantasy forest" : "in a magical carriage"}, high quality anime art style, detailed eyes, beautiful face, sparkle effects, vibrant colors, sexy but covered, no nipples visible, full body visible`,
  yumi: (hair, pose, bg) =>
    `anime style cute catgirl with ${hair} hair and cat ears, wearing ${pose === "toalla" ? "a maid outfit" : pose === "tanga" ? "a bikini top and shorts" : pose === "bata" ? "a school uniform" : "a cosplay costume"}, ${bg === "neon-room" ? "in a neon-lit bedroom" : bg === "beach-night" ? "on a beach at sunset" : bg === "studio" ? "in a cozy room with cat toys" : "in a car"}, high quality anime art, detailed eyes, cat tail visible, beautiful face, sexy but tasteful, covered chest, no nipples, full body visible`,
  rin: (hair, pose, bg) =>
    `anime style tsundere girl with ${hair} hair in twin tails, wearing ${pose === "toalla" ? "a tracksuit" : pose === "tanga" ? "a red dress" : pose === "bata" ? "a school uniform with blazer" : "a winter coat and scarf"}, ${bg === "neon-room" ? "in a classroom after hours" : bg === "beach-night" ? "on a nighttime school rooftop" : bg === "studio" ? "in a traditional Japanese room" : "walking home at night"}, high quality anime art, detailed eyes, pouty expression, beautiful face, vibrant colors, sexy but covered, no nipples visible, full body visible`,
};

function getFallbackUrl(girlId: string, hair: string, pose: string, bg: string): string | null {
  const promptFn = FALLBACK_PROMPTS[girlId];
  if (!promptFn) return null;
  const prompt = encodeURIComponent(promptFn(hair, pose, bg) + ", ultra realistic, photorealistic, no cartoon, no anime");
  const negative = encodeURIComponent("cartoon, anime, drawing, painting, 3d render, illustration, watermark, text, low quality, bad anatomy, missing limbs, deformed, nipples, nude, topless");
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=640&nofeed=true&seed=${hair.charCodeAt(0) + pose.charCodeAt(0) + bg.charCodeAt(0)}&negative=${negative}`;
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

  if (LOCAL_CHARS.includes(girlId)) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  const fallback = getFallbackUrl(girlId, h, p, b);
  if (fallback) return fallback;

  // Last resort fallback
  return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
}
