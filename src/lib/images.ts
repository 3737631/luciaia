import { HairOption, OutfitOption, BackgroundOption } from "@/data/girls";

function assetPath(girlId: string, ...segments: string[]): string {
  return `/luciaia/girls/${girlId}/${segments.join("/")}.jpg`;
}

interface GirlDefaults {
  hair: HairOption;
  outfit: OutfitOption;
  background: BackgroundOption;
}

/**
 * Returns the variant image when exactly ONE attribute differs from defaults.
 * When multiple attributes change, falls back to base.jpg to avoid identity breaks.
 */
export function getGirlImage(
  girlId: string,
  hair?: HairOption | null,
  outfit?: OutfitOption | null,
  background?: BackgroundOption | null,
  defaults?: GirlDefaults,
): string {
  if (defaults) {
    const hairDiff = !!hair && hair !== defaults.hair;
    const outfitDiff = !!outfit && outfit !== defaults.outfit;
    const bgDiff = !!background && background !== defaults.background;
    const changed = [hairDiff, outfitDiff, bgDiff].filter(Boolean).length;

    if (changed === 1) {
      if (hairDiff) return assetPath(girlId, "hair", hair!);
      if (outfitDiff) return assetPath(girlId, "outfit", outfit!);
      if (bgDiff) return assetPath(girlId, "background", background!);
    }
    // zero or multiple changes → base (safe identity)
    return assetPath(girlId, "base");
  }

  // Legacy path (no defaults)
  const hasHair = !!hair; const hasOutfit = !!outfit; const hasBg = !!background;
  const count = [hasHair, hasOutfit, hasBg].filter(Boolean).length;
  if (count === 1) {
    if (hasHair) return assetPath(girlId, "hair", hair!);
    if (hasOutfit) return assetPath(girlId, "outfit", outfit!);
    if (hasBg) return assetPath(girlId, "background", background!);
  }
  return assetPath(girlId, "base");
}
