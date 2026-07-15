"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import { getDailyStorySelection } from "@/lib/getDailyStoryIndex";
import { getSeenStories, markStorySeen } from "@/lib/storySeenService";
import type { Girl } from "@/data/girls";
import StoryViewer, { preloadAndDecodeImage } from "./StoryViewer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow({ girls }: { girls: Girl[] }) {
  const [seen, setSeen] = useState<Set<string>>(() => getSeenStories());
  const [storyChar, setStoryChar] = useState<{
    characters: Array<{ id: string; images: string[]; avatar: string; name: string }>;
    startCharIndex: number;
    ready: boolean;
  } | null>(null);

  // Priority preload at page mount: first stories + avatars
  const preloadUrls = useMemo(() => {
    const urls: string[] = [];
    girls.forEach((g) => {
      if (g.cloudinaryImage) urls.push(getGirlImage(g.id, null, null, null, g.cloudinaryImage));
      if (g.storyImages?.length) {
        const indices = getDailyStorySelection(g.id, g.storyImages.length);
        if (indices.length > 0) urls.push(`${basePath}${g.storyImages[indices[0]]}`);
      }
    });
    return [...new Set(urls.filter(Boolean))];
  }, [girls]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(preloadUrls.map((u) => preloadAndDecodeImage(u))).then(() => {
      if (cancelled) return;
      // Background: preload remaining stories
      const remaining: string[] = [];
      girls.forEach((g) => {
        const si = g.storyImages;
        if (!si?.length) return;
        const indices = getDailyStorySelection(g.id, si.length);
        indices.slice(1).forEach((i) => {
          remaining.push(`${basePath}${si[i]}`);
        });
      });
      [...new Set(remaining.filter(Boolean))].forEach((u) => preloadAndDecodeImage(u));
    });
    return () => { cancelled = true; };
  }, [preloadUrls, girls]);

  const handleClick = async (girl: Girl) => {
    setSeen((prev) => { const next = new Set(prev); next.add(girl.id); return next; });
    markStorySeen(girl.id);
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
    // Decode first image before mounting viewer
    const firstImage = chars[startIndex]?.images?.[0];
    if (firstImage) await preloadAndDecodeImage(firstImage);
    setStoryChar({ characters: chars, startCharIndex: startIndex, ready: true });
  };

  return (
    <>
      {storyChar && storyChar.ready && (
        <StoryViewer
          characters={storyChar.characters}
          startCharIndex={storyChar.startCharIndex}
          onClose={() => setStoryChar(null)}
          onMarkSeen={(id) => { setSeen((prev) => { const next = new Set(prev); next.add(id); return next; }); markStorySeen(id); }}
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
            onPointerDown={() => {}}
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
