import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LOCAL_CHARS = [
  "alma", "axel", "kira", "liam", "luna", "maya", "nia",
  "rin", "sakura", "sasha", "vera", "yuki", "yumi",
];

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

  const prompt = "beautiful woman portrait realistic photo";
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
