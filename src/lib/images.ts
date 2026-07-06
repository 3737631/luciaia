import { HairOption, OutfitOption } from "@/data/girls";

export function getGirlImage(
  girlId: string,
  hair: HairOption,
  outfit?: OutfitOption,
): string {
  // Try specific hair+outfit combo first
  if (outfit) {
    return `/luciaia/girls/${girlId}-${hair}-${outfit}.jpg`;
  }
  return `/luciaia/girls/${girlId}-${hair}.jpg`;
}
