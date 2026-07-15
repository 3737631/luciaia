"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import { getDailyStorySelection } from "@/lib/getDailyStoryIndex";
import { getSeenStories, markStorySeen } from "@/lib/storySeenService";
import { preloadImage, isImageCached } from "@/lib/preloadImage";
import type { Girl } from "@/data/girls";
import StoryViewer from "./StoryViewer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow({ girls }: { girls: Girl[] }) {
  const [seen, setSeen] = useState<Set<string>>(() => getSeenStories());
  const [storyChar, setStoryChar] = useState<{
    characters: Array<{ id: string; images: string[]; avatar: string; name: string }>;
    startCharIndex: number;
    ready: boolean;
  } | null>(null);
  const openingRef = useRef(false);

  // ── Build URL lists for preload ──
  const avatarUrls = useMemo(
    () => girls.map((g) => getGirlImage(g.id, null, null, null, g.cloudinaryImage)).filter(Boolean),
    [girls]
  );

  const firstStoryUrls = useMemo(
    () => {
      const urls: string[] = [];
      girls.forEach((g) => {
        if (!g.storyImages?.length) return;
        const indices = getDailyStorySelection(g.id, g.storyImages.length);
        if (indices.length > 0) urls.push(`${basePath}${g.storyImages[indices[0]]}`);
      });
      return urls;
    },
    [girls]
  );

  const remainingStoryUrls = useMemo(
    () => {
      const urls: string[] = [];
      girls.forEach((g) => {
        if (!g.storyImages?.length) return;
        const indices = getDailyStorySelection(g.id, g.storyImages.length);
        for (let i = 1; i < indices.length; i++) {
          urls.push(`${basePath}${g.storyImages[indices[i]]}`);
        }
      });
      return urls;
    },
    [girls]
  );

  const stableImageKey = useMemo(
    () => [...avatarUrls, ...firstStoryUrls, ...remainingStoryUrls].join("|"),
    [avatarUrls, firstStoryUrls, remainingStoryUrls]
  );

  // ── Priority preload at page mount ──
  useEffect(() => {
    let cancelled = false;

    // Priority 1: first stories + avatars
    Promise.all(
      [...new Set([...avatarUrls, ...firstStoryUrls])].map(preloadImage)
    ).then(() => {
      if (cancelled) return;

      // Background: remaining stories
      const loadRemaining = () => {
        [...new Set(remainingStoryUrls)].forEach(preloadImage);
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadRemaining, { timeout: 1000 });
      } else {
        setTimeout(loadRemaining, 100);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableImageKey]);

  // ── Open stories ──
  async function openStories(girl: Girl) {
    if (openingRef.current) return;

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

    const firstImage = chars[startIndex]?.images?.[0];
    if (!firstImage) return;

    openingRef.current = true;

    const ready = await preloadImage(firstImage);

    if (!ready) {
      openingRef.current = false;
      return;
    }

    setSeen((prev) => { const next = new Set(prev); next.add(girl.id); return next; });
    markStorySeen(girl.id);

    setStoryChar({ characters: chars, startCharIndex: startIndex, ready: true });

    requestAnimationFrame(() => {
      openingRef.current = false;
    });
  }

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
          <div
            key={girl.id}
            onClick={() => { if (hasStory) openStories(girl); else window.location.href = `${basePath}/chat/${girl.id}`; }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              flexShrink: 0,
              cursor: "pointer",
              position: "relative" as const,
              zIndex: 2,
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
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
                  loading="eager"
                  fetchPriority="high"
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
          </div>
        );
      })}
    </div>
    </>
  );
}
