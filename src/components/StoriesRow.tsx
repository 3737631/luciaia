"use client";

import Link from "next/link";
import { girls } from "@/data/girls";

const STORY_SCENES: Record<string, { scene: string; seed: number }> = {
  luna:  { scene: "girl taking a mirror selfie in a neon-lit bedroom, phone hiding face, wearing a black corset, mirror reflection shows full body", seed: 4201 },
  nia:   { scene: "girl taking a mirror selfie at a gaming desk with RGB lights, phone in hand, wearing a cropped gamer tee and shorts, mirror shows full body", seed: 5202 },
  vera:  { scene: "girl taking a mirror selfie in a dark hallway at midnight, leaning against door frame, wearing a silk robe, mirror reflection", seed: 6203 },
  alma:  { scene: "girl taking a mirror selfie on a beach at sunset, wearing a white cover-up, holding phone, mirror frame on sand shows full reflection", seed: 7204 },
  kira:  { scene: "girl taking a mirror selfie in a futuristic high-tech room with holographic lights, wearing metallic dress, phone covers face", seed: 8205 },
  maya:  { scene: "girl taking a mirror selfie inside a luxury sports car at night, wearing a sequin dress, city lights in background", seed: 9206 },
  sasha: { scene: "girl taking a mirror selfie in a nightclub bathroom mirror, wearing a tight dress, dim purple lighting, full body reflection", seed: 10207 },
  yuki:  { scene: "girl taking a mirror selfie in a cozy bedroom with fairy lights, wearing an oversized sweater and thigh socks, cute pose", seed: 11208 },
};

function getStoryImage(girlId: string): string {
  const s = STORY_SCENES[girlId];
  if (!s) return "";
  const prompt = encodeURIComponent(
    `instagram story mirror selfie, ${s.scene}, ` +
    `photorealistic, detailed skin texture, natural skin, soft lighting, ` +
    `shot on iPhone 15 Pro, warm tones, cinematic, high quality, intimate candid moment, ` +
    `NO cartoon, NO drawing, NO 3d render, NO anime`
  );
  const negative = encodeURIComponent("cartoon, anime, drawing, painting, 3d render, illustration, watermark, text, low quality");
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=640&nofeed=true&seed=${s.seed}&negative=${negative}`;
}

export default function StoriesRow() {
  return (
    <div
      className="flex gap-4 overflow-x-auto px-4 sm:gap-5 sm:px-6 lg:px-8"
      style={{
        maxWidth: 1180,
        margin: "22px auto 0",
        paddingBottom: 12,
        scrollbarWidth: "none",
      }}
    >
      {girls.map((girl) => (
        <Link
          key={girl.id}
          href={`/chat/${girl.id}`}
          className="flex shrink-0 flex-col items-center text-white"
          style={{ width: 72, fontSize: 12 }}
        >
          <div
            className="relative mx-auto mb-2"
            style={{
              width: 66,
              height: 66,
              padding: 4,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff3b7f, #ff0f70, #ff7a3d)",
              boxShadow: "0 0 24px rgba(255,59,127,0.45)",
              transition: "transform 0.22s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <div
              className="absolute right-[3px] top-[3px] z-10 h-3 w-3 rounded-full border-2"
              style={{ borderColor: "#0b0b0f", background: "#ff0f70" }}
            />
            <img
              src={getStoryImage(girl.id)}
              alt={girl.name}
              className="h-full w-full rounded-full object-cover"
              style={{ border: "3px solid #0b0b0f", background: "#222" }}
              loading="lazy"
            />
          </div>
          <span className="max-w-[66px] truncate text-center font-bold text-white/80">
            {girl.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
