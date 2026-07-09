import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LOCAL_CHARS = [
  "alma", "axel", "kira", "liam", "luna", "maya", "nia",
  "rin", "sakura", "sasha", "vera", "yuki", "yumi",
];

const DEFAULTS: Record<string, { hair: string; pose: string; bg: string }> = {
  luna: { hair: "moreno", pose: "toalla", bg: "neon-room" },
  nia: { hair: "rosa", pose: "tanga", bg: "neon-room" },
  vera: { hair: "pelirrojo", pose: "bata", bg: "studio" },
  alma: { hair: "moreno", pose: "estrellas", bg: "beach-night" },
  kira: { hair: "rosa", pose: "tanga", bg: "studio" },
  maya: { hair: "rubio", pose: "bata", bg: "car-night" },
  sasha: { hair: "moreno", pose: "estrellas", bg: "neon-room" },
  yuki: { hair: "moreno", pose: "toalla", bg: "neon-room" },
  sakura: { hair: "rosa", pose: "bata", bg: "studio" },
  yumi: { hair: "azul", pose: "bata", bg: "neon-room" },
  rin: { hair: "negro", pose: "ropa", bg: "studio" },
  axel: { hair: "cafe", pose: "ropa", bg: "studio" },
  liam: { hair: "negro", pose: "casual", bg: "neon-room" },
};

export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? DEFAULTS[girlId]?.hair ?? "moreno";
  const p = pose ?? DEFAULTS[girlId]?.pose ?? "toalla";
  const b = background ?? DEFAULTS[girlId]?.bg ?? "neon-room";

  const d = DEFAULTS[girlId];
  const isDefault = d && d.hair === h && d.pose === p && d.bg === b;

  if (LOCAL_CHARS.includes(girlId) && isDefault) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  const prompt =
    "highly realistic sexy woman full body portrait professional photography perfect face flawless skin sharp focus detailed eyes beautiful";
  let seed = 0;
  for (const ch of girlId + h + p + b) seed = (seed * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  seed = (seed % 90000) + 10000;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nofeed=true&seed=${seed}`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  return getGirlImage(girlId, hair, pose, background);
}
