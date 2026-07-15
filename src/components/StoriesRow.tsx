"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import { getDailyStorySelection } from "@/lib/getDailyStoryIndex";
import { getSeenStories, markStorySeen } from "@/lib/storySeenService";
import { preloadImage, isImageReady } from "@/lib/preloadImage";
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
  const [criticalStoriesReady, setCriticalStoriesReady] = useState(false);

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

  const stableFirstStoriesKey = useMemo(() => firstStoryUrls.join("|"), [firstStoryUrls]);

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

  const stableRemainingKey = useMemo(() => remainingStoryUrls.join("|"), [remainingStoryUrls]);

  // ── Priority preload: first stories (immediate) ──
  useEffect(() => {
    let cancelled = false;

    Promise.all(firstStoryUrls.map(preloadImage)).then(() => {
      if (cancelled) return;
      setCriticalStoriesReady(true);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableFirstStoriesKey]);

  // ── Background preload: remaining stories (after first are ready) ──
  useEffect(() => {
    if (!criticalStoriesReady) return;
    const loadRemaining = () => {
      remainingStoryUrls.forEach((u) => preloadImage(u));
    };
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(loadRemaining, { timeout: 500 });
    } else {
      setTimeout(loadRemaining, 0);
    }
  }, [criticalStoriesReady, stableRemainingKey]);

  // ── Open stories (synchronous — no async, no await) ──
  const openStories = useCallback((girl: Girl) => {
    if (!criticalStoriesReady) return;

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

    const firstSrc = chars[startIndex]?.images?.[0];
    if (!firstSrc || !isImageReady(firstSrc)) return;

    setSeen((prev) => { const next = new Set(prev); next.add(girl.id); return next; });
    markStorySeen(girl.id);
    setStoryChar({ characters: chars, startCharIndex: startIndex, ready: true });
  }, [girls, criticalStoriesReady]);

  return (
    <>
      {storyChar && storyChar.ready && (
        <StoryViewer
          characters={storyChar.characters}
          startCharIndex={storyChar.startCharIndex}
          initialImageSrc={storyChar.characters[storyChar.startCharIndex]?.images?.[0] ?? ""}
          onClose={() => setStoryChar(null)}
          onMarkSeen={(id) => { setSeen((prev) => { const next = new Set(prev); next.add(id); return next; }); markStorySeen(id); }}
        />
      )}
      <div className="stories-row">
      {girls.map((girl) => {
        const isSeen = seen.has(girl.id);
        const hasStory = (girl.storyImages?.length ?? 0) > 0;
        return (
          <div
            key={girl.id}
            className="story-item"
            onClick={() => { if (hasStory) openStories(girl); else window.location.href = `${basePath}/chat/${girl.id}`; }}
          >
            <div className={"story-ring" + (isSeen ? " is-seen" : "")}>
              <div className="story-avatar">
                <img
                  src={getGirlImage(girl.id, null, null, null, girl.cloudinaryImage)}
                  alt={girl.name}
                  loading="eager"
                  fetchPriority="auto"
                  className="story-image"
                />
              </div>
            </div>
            <span className={"story-name" + (isSeen ? " is-seen" : "")}>
              {girl.name}
            </span>
          </div>
        );
      })}
    </div>
    </>
  );
}
