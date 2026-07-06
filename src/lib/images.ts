import { HairOption, OutfitOption, BackgroundOption } from "@/data/girls";

function assetPath(girlId: string, ...segments: string[]): string {
  return `/luciaia/girls/${girlId}/${segments.join("/")}.jpg`;
}

/**
 * Resolves the girl image based on selected customization options.
 * Uses a folder structure per girl:
 *   /girls/{id}/base.jpg                 — default fallback
 *   /girls/{id}/hair/{hair}.jpg          — hair-only variant
 *   /girls/{id}/outfit/{outfit}.jpg      — outfit-only variant
 *   /girls/{id}/background/{bg}.jpg      — background-only variant
 *
 * When multiple options are changed, the image falls back to base.jpg.
 * This ensures the SAME girl (face, pose, body) is always shown —
 * only the selected attribute changes.
 */
export function getGirlImage(
  girlId: string,
  hair?: HairOption,
  outfit?: OutfitOption,
  background?: BackgroundOption,
): string {
  // Single-attribute changes: use the specific variant folder
  if (hair && !outfit && !background) {
    return assetPath(girlId, "hair", hair);
  }
  if (outfit && !hair && !background) {
    return assetPath(girlId, "outfit", outfit);
  }
  if (background && !hair && !outfit) {
    return assetPath(girlId, "background", background);
  }

  // Multi-attribute combination or default → show base
  return assetPath(girlId, "base");
}

export { assetPath };
