import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SDXL_CHARS = ["axel", "liam"];

const SHORT_PROMPTS: Record<string, string> = {
  luna: "sexy latina woman black lace babydoll huge breasts curvy hourglass neon bedroom seductive smile realistic photo",
  nia: "sexy gamer girl pink hair crop top micro skirt huge breasts gaming setup RGB lights looking back playful",
  vera: "sexy redhead woman sheer silk robe huge breasts visible wine glass doorway intimate warm lighting realistic",
  alma: "curvy latina woman white lace lingerie huge natural breasts lying on bed moonlight sweet smile realistic",
  kira: "sexy futuristic woman pink bob hair sheer black bodysuit huge breasts neon grid holographic cyberpunk",
  maya: "sexy blonde influencer blue eyes tiny string bikini huge breasts mirror selfie hotel room realistic",
  sasha: "sexy black woman long braids tiny red lace lingerie huge breasts thick curves full-length mirror realistic",
  yuki: "cute japanese girl short white babydoll medium breasts sitting on bed edge shy innocent realistic",
  sakura: "anime magical girl pink outfit sparkles huge breasts floating wand cute smile",
  yumi: "sexy catgirl blue hair ears tail huge breasts playful pose neon anime style",
  rin: "tsundere anime girl black hair red eyes school uniform huge breasts embarrassed blush",
};

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

  const prompt = SHORT_PROMPTS[girlId] ?? "beautiful woman portrait realistic photo";
  let seed = 0;
  for (const ch of girlId + h + p + b) seed = (seed * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  seed = (seed % 90000) + 10000;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=768&seed=${seed}&nude=false&nofeed=true`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  return getGirlImage(girlId, hair, pose, background);
}
