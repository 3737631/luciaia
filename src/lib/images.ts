import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SDXL_CHARS = ["axel", "liam"];

const NEGATIVE =
  "nude, exposed nipples, areola, pubic hair, vagina, see-through clothing, " +
  "missing limbs, deformed hands, extra fingers, bad anatomy, distorted face, " +
  "cartoon, anime, drawing, painting, illustration, 3d render, " +
  "blurry, low quality, low resolution, oversaturated, watermark, text, logo, " +
  "amputated, cropped body, ugly, mutated, disfigured, bad proportions";

const PROMPTS: Record<string, string> = {
  luna:
    "photorealistic full body photo of a beautiful Latina woman with long dark hair, " +
    "wearing a tiny black lace babydoll and thigh-high stockings, huge natural breasts, curvy hourglass figure, " +
    "standing in a neon-lit bedroom, one hand on her hip, looking at camera with a seductive confident smile, " +
    "Sony A7R IV 85mm f/1.4, studio lighting, natural skin texture, pores visible, sharp focus, high detail, sensual boudoir style",
  nia:
    "photorealistic full body photo of a gamer girl with short pink hair and freckles, " +
    "wearing a tight low-cut crop top and micro skirt, thigh-high socks, large natural breasts, " +
    "sitting at a gaming setup with RGB lights, looking back at camera over her shoulder with a playful smile, " +
    "Sony A7R IV, professional lighting, sharp focus, natural skin texture, intimate bedroom atmosphere",
  vera:
    "photorealistic full body photo of a stunning redhead woman with green eyes, " +
    "wearing a sheer silk robe loosely tied, huge natural breasts visible, curvy figure, " +
    "standing in a doorway holding a wine glass, dim warm intimate lighting, sensual atmosphere, " +
    "Sony A7R IV 85mm f/1.4, natural skin texture, soft subsurface scattering, boudoir photography, sharp focus",
  alma:
    "photorealistic full body photo of a curvy Latina woman with long curly dark hair, " +
    "wearing tiny white lace lingerie, huge natural breasts, hourglass figure wide hips, " +
    "lying on a bed at night, soft moonlight coming through window, looking at camera with a sweet seductive smile, " +
    "Sony A7R IV, natural lighting, soft focus, skin texture, romantic intimate atmosphere",
  kira:
    "photorealistic full body photo of a futuristic woman with short pink bob hair, " +
    "wearing a sheer black cyberpunk bodysuit, huge breasts visible, " +
    "standing in a neon grid room with holographic displays, commanding dominant pose, hand on hip, " +
    "looking directly at camera with intense confident gaze, cinematic lighting, " +
    "Sony A7R IV, sharp focus, high detail, cyberpunk aesthetic",
  maya:
    "photorealistic full body photo of a blonde influencer woman with blue eyes, " +
    "wearing a tiny string bikini, huge natural breasts, curvy slim figure, " +
    "taking a mirror selfie in a hotel room, phone in hand, mirror reflection shows her body and back, " +
    "natural daylight from window, perfect skin, glossy lips, confident smile, " +
    "Sony A7R IV, professional portrait, sharp focus, high detail",
  sasha:
    "photorealistic full body photo of a beautiful black woman with long dark braids, " +
    "wearing tiny red lace lingerie, huge natural breasts, thick curvy figure with big round glutes, " +
    "standing in front of a full-length mirror, looking over her shoulder at camera, bold confident smile, " +
    "warm studio lighting, Sony A7R IV 85mm f/1.4, natural skin texture, perfect lighting, sharp focus",
  yuki:
    "photorealistic full body photo of a cute Japanese girl with black hair and blunt bangs, " +
    "wearing a short white cotton babydoll nightie, medium natural breasts visible through thin fabric, " +
    "sitting on the edge of a bed, knees together, shy innocent expression looking up at camera, " +
    "soft warm bedroom lighting, Sony A7R IV, natural skin texture, dreamy romantic atmosphere",
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

  if (SDXL_CHARS.includes(girlId)) {
    return `${basePath}/girls/${girlId}/${h}_${p}_${b}.jpg`;
  }

  const prompt = PROMPTS[girlId] ?? "beautiful woman full body portrait";
  let seed = 0;
  for (const ch of girlId + h + p + b) seed = (seed * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  seed = (seed % 90000) + 10000;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?negative=${encodeURIComponent(NEGATIVE)}&width=512&height=768&seed=${seed}&nofeed=true`;
}

export function getGirlImageFallback(
  girlId: string,
  hair?: HairOption | string | null,
  pose?: PoseOption | string | null,
  background?: BackgroundOption | string | null,
): string {
  return getGirlImage(girlId, hair, pose, background);
}
