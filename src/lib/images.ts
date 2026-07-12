import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";
import { IMAGE_MANIFEST } from "@/lib/image-manifest";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const DEFAULTS: Record<string, { hair: string; pose: string; bg: string }> = {
  luna: { hair: "moreno", pose: "toalla", bg: "neon-room" },
  nia: { hair: "rosa", pose: "tanga", bg: "neon-room" },
  vera: { hair: "pelirrojo", pose: "bata", bg: "studio" },
  alma: { hair: "moreno", pose: "estrellas", bg: "beach-night" },
  kira: { hair: "rosa", pose: "tanga", bg: "studio" },
  maya: { hair: "rubio", pose: "bata", bg: "car-night" },
  sasha: { hair: "moreno", pose: "estrellas", bg: "neon-room" },
  yuki: { hair: "moreno", pose: "toalla", bg: "neon-room" },
  axel: { hair: "cafe", pose: "ropa", bg: "studio" },
  liam: { hair: "negro", pose: "casual", bg: "neon-room" },
};

function comboExists(girlId: string, hair: string, pose: string, bg: string): boolean {
  const key = `${hair}_${pose}_${bg}`;
  return IMAGE_MANIFEST[girlId]?.includes(key) ?? false;
}

export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
  cloudinaryUrl?: string | null,
): string {
  if (cloudinaryUrl) return cloudinaryUrl;

  const d = DEFAULTS[girlId];
  const h = hair ?? d?.hair ?? "moreno";
  const p = pose ?? d?.pose ?? "toalla";
  const b = background ?? d?.bg ?? "neon-room";

  if (comboExists(girlId, h, p, b)) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  const dh = d?.hair ?? "moreno";
  const dp = d?.pose ?? "toalla";
  const db = d?.bg ?? "neon-room";
  return `${basePath}/girls/${girlId}/${dh}_${dp}_${db}.jpg`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
  cloudinaryUrl?: string | null,
): string {
  return getGirlImage(girlId, hair, pose, background, cloudinaryUrl);
}
