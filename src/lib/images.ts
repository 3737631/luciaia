import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function getGirlImage(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  const h = hair ?? "moreno";
  const p = pose ?? "toalla";
  const b = background ?? "neon-room";
  return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
}
