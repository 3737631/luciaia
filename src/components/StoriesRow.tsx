"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import { getDailyStorySelection } from "@/lib/getDailyStoryIndex";
import type { Girl } from "@/data/girls";
import StoryViewer from "./StoryViewer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow({ girls }: { girls: Girl[] }) {
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [storyChar, setStoryChar] = useState<{
    characters: Array<{ id: string; images: string[]; avatar: string; name: string }>;
    startCharIndex: number;
    ready: boolean;
  } | null>(null);
  const imagesLoadedRef = useRef(new Set<string>());

  const preloadStoryImage = (girl: Girl, onReady?: () => void) => {
    const imgs = girl.storyImages;
    if (!imgs || !imgs.length) return;
    const indices = getDailyStorySelection(girl.id, imgs.length);
    let loaded = 0;
    let done = false;
    indices.forEach((i) => {
      const url = `${basePath}${imgs[i]}`;
      const el = new Image();
      el.onload = () => { imagesLoadedRef.current.add(url); loaded++; if (loaded === indices.length && !done) { done = true; onReady?.(); } };
      el.onerror = () => { loaded++; if (loaded === indices.length && !done) { done = true; onReady?.(); } };
      el.src = url;
    });
  };

  // Preload story images for all girls as soon as the page loads
  useEffect(() => {
    girls.forEach((girl) => preloadStoryImage(girl));
  }, [girls]);

  const handleClick = (girl: Girl) => {
    setSeen((prev) => new Set(prev).add(girl.id));
    const chars = girls
      .filter((g) => g.storyImages?.length)
      .map((g) => {
        const idxs = getDailyStorySelection(g.id, g.storyImages!.length);
        return {
          id: g.id,
          images: idxs.map((i) => `${basePath}${g.storyImages![i]}`),
          avatar: g.cloudinaryImage ?? getGirlImage(g.id, null, null, null, g.cloudinaryImage),
          name: g.name,
        };
      });
    const startIndex = chars.findIndex((c) => c.id === girl.id);
    if (startIndex === -1) return;
    const ready = chars.every((c) => c.images.every((url) => imagesLoadedRef.current.has(url)));
    setStoryChar({ characters: chars, startCharIndex: startIndex, ready });
    if (!ready) {
      preloadStoryImage(girl, () =>
        setStoryChar((prev) =>
          prev?.startCharIndex === startIndex ? { ...prev, ready: true } : prev
        )
      );
    }
  };

  return (
    <>
      {storyChar && storyChar.ready && (
        <StoryViewer
          characters={storyChar.characters}
          startCharIndex={storyChar.startCharIndex}
          onClose={() => setStoryChar(null)}
          onMarkSeen={(id) => setSeen((prev) => new Set(prev).add(id))}
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
