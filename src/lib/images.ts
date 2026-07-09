import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SDXL_CHARS = ["axel", "liam"];

const PROMPTS: Record<string, string> = {
  luna: "Latina woman long dark hair portrait",
  nia: "girl pink hair freckles portrait",
  vera: "redhead woman green eyes freckles portrait",
  alma: "Latina woman curly dark hair portrait",
  kira: "woman pink bob hair futuristic portrait",
  maya: "blonde woman blue eyes glamorous portrait",
  sasha: "black woman braids confident smile portrait",
  yuki: "Japanese girl black hair bangs shy portrait",
  axel: "Hispanic man brown hair beard portrait",
  liam: "black man curly hair smile portrait",
  sakura: "anime magical girl pink hair blue eyes",
  yumi: "anime catgirl blue hair cat ears",
  rin: "anime tsundere girl brown twin tails",
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

  const prompt = PROMPTS[girlId] ?? "beautiful woman portrait";
  // Use a stable seed based on girl ID for consistent images
  let seed = 0;
  for (const ch of girlId) seed = (seed * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  seed = (seed % 90000) + 10000;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=640&seed=${seed}`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  return getGirlImage(girlId, hair, pose, background);
}