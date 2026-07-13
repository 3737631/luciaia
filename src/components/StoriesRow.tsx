"use client";

import { useState } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import { getDailyStoryIndex } from "@/lib/getDailyStoryIndex";
import type { Girl } from "@/data/girls";
import StoryViewer from "./StoryViewer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow({ girls }: { girls: Girl[] }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [storyChar, setStoryChar] = useState<{ id: string; image: string; avatar: string; name: string } | null>(null);

  const preloadStoryImage = (girl: Girl) => {
    if (!girl.storyImages?.length) return;
    const idx = getDailyStoryIndex(girl.id, girl.storyImages.length);
    if (idx === -1) return;
    const img = new Image();
    img.src = `${basePath}${girl.storyImages[idx]}`;
  };

  const handleClick = (girl: Girl) => {
    setSeen((prev) => new Set(prev).add(girl.id));
    if (!girl.storyImages?.length) return;
    const idx = getDailyStoryIndex(girl.id, girl.storyImages.length);
    if (idx === -1) return;
    setStoryChar({
      id: girl.id,
      image: `${basePath}${girl.storyImages[idx]}`,
      avatar: girl.cloudinaryImage ?? getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
      name: girl.name,
    });
  };

  return (
    <>
      {storyChar && (
        <StoryViewer
          storyImage={storyChar.image}
          avatarUrl={storyChar.avatar}
          displayName={storyChar.name}
          onClose={() => setStoryChar(null)}
        />
      )}
      <div style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        padding: "12px 0 8px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}>
      {girls.map((girl) => {
        const isSeen = seen.has(girl.id);
        const hasStory = (girl.storyImages?.length ?? 0) > 0;
        return (
          <Link
            key={girl.id}
            href={hasStory ? "#" : `${basePath}/chat/${girl.id}`}
            onPointerDown={() => { if (hasStory) preloadStoryImage(girl); }}
            onClick={(e) => { if (hasStory) e.preventDefault(); handleClick(girl); }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              padding: 3,
              background: isSeen
                ? "rgba(255,255,255,0.12)"
                : "linear-gradient(135deg, #FF5798, #FF6AA5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#1a1a1a",
              }}>
                <img
                  src={getGirlImage(girl.id, null, null, null, girl.cloudinaryImage)}
                  alt={girl.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: isSeen ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
              whiteSpace: "nowrap",
            }}>
              {girl.name}
            </span>
          </Link>
        );
      })}
    </div>
    </>
  );
}
