import { HairOption, OutfitOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Returns the exact combo image for the given attributes.
 * Every possible (hair × outfit × background) combination has its own image.
 */
export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  outfit?: OutfitOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? "moreno";
  const o = outfit ?? "elegante";
  const b = background ?? "neon-room";
  return `${basePath}/girls/${girlId}/${h}_${o}_${b}.jpg`;
}
