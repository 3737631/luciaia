import { HairOption } from "@/data/girls";

export function getGirlImage(girlId: string, hair: HairOption): string {
  return `/luciaia/girls/${girlId}-${hair}.jpg`;
}
