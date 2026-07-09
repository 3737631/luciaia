import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Characters with high-quality SDXL images already deployed
const SDXL_CHARS = ["axel", "liam"];

// Colors for each character's gradient avatar
const GRADIENTS: Record<string, [string, string]> = {
  luna: ["#e91e63", "#ff6b9d"],
  nia: ["#ff2d95", "#ff6bc1"],
  vera: ["#ff6b35", "#ff9f4a"],
  alma: ["#9c27b0", "#ce5aff"],
  kira: ["#00bcd4", "#48e5ff"],
  maya: ["#ffd700", "#ffed4a"],
  sasha: ["#ff5722", "#ff8a65"],
  yuki: ["#f472b6", "#f9a8d4"],
  axel: ["#2ecc71", "#54d98c"],
  liam: ["#3498db", "#6bb8f0"],
  sakura: ["#e84393", "#fd79a8"],
  yumi: ["#00cec9", "#55efc4"],
  rin: ["#d63031", "#ff7675"],
};

const SDXL_COLORS: Record<string, [string, string]> = {
  axel: ["#2ecc71", "#54d98c"],
  liam: ["#3498db", "#6bb8f0"],
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

  // SDXL characters use their high-quality local images
  if (SDXL_CHARS.includes(girlId)) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  // All other characters use a gradient SVG placeholder
  // (will be replaced with SDXL once generated)
  const colors = GRADIENTS[girlId] ?? ["#8b5cf6", "#6366f1"];
  const name = girlId.charAt(0).toUpperCase() + girlId.slice(1);
  const [c1, c2] = colors;

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${c1}"/>
          <stop offset="100%" style="stop-color:${c2}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#g)" rx="20"/>
      <text x="200" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="80" font-weight="bold" fill="white" opacity="0.9">${name.split(" ")[0]}</text>
      <circle cx="200" cy="130" r="50" fill="white" opacity="0.15"/>
      <text x="200" y="145" text-anchor="middle" font-family="system-ui,sans-serif" font-size="50" fill="white" opacity="0.6">${girlId.charAt(0).toUpperCase()}</text>
    </svg>`
  )}`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  return getGirlImage(girlId, hair, pose, background);
}