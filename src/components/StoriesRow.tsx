"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getGirlImage } from "@/lib/images";
import { getDailyStorySelection } from "@/lib/getDailyStoryIndex";
import { getSeenStories, markStorySeen } from "@/lib/storySeenService";
import { preloadImage } from "@/lib/preloadImage";
import type { Girl } from "@/data/girls";
import StoryViewer from "./StoryViewer";
import StoryVideoViewer from "./StoryVideoViewer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow({ girls }: { girls: Girl[] }) {
  const router = useRouter();
  const [seen, setSeen] = useState<Record<string, string>>(() => getSeenStories());
  const [storyChar, setStoryChar] = useState<{
    characters: Array<{ id: string; images: string[]; avatar: string; name: string }>;
    startCharIndex: number;
    ready: boolean;
  } | null>(null);
  const [storyVideo, setStoryVideo] = useState<{ src: string; avatar: string; name: string; girlId: string } | null>(null);
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

  // Firma de las historias de hoy para una chica (las URLs seleccionadas hoy).
  const storySignature = useCallback((girl: Girl): string => {
    if (!girl.storyImages?.length) return "";
    const idxs = getDailyStorySelection(girl.id, girl.storyImages.length);
    return idxs.map((i) => `${basePath}${girl.storyImages![i]}`).join("|");
  }, []);

  const isStorySeen = useCallback((girl: Girl): boolean => {
    if (!girl.storyImages?.length) return false;
    const sig = storySignature(girl);
    return seen[girl.id] === sig;
  }, [seen, storySignature]);

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
    if (girl.storyVideo) {
      setStoryVideo({
        src: `${basePath}${girl.storyVideo}`,
        avatar: girl.cloudinaryImage ?? getGirlImage(girl.id, null, null, null, girl.cloudinaryImage),
        name: girl.name,
        girlId: girl.id,
      });
      return;
    }
    const chars = girls
      .filter((g) => g.storyImages?.length)
      .map((g) => {
        const idxs = getDailyStorySelection(g.id, g.storyImages!.length);
        return {
          id: g.id,
          images: idxs.map((i) => { const src = g.storyImages![i]; return src.startsWith("http") ? src : `${basePath}${src}`; }),
          avatar: g.cloudinaryImage ?? getGirlImage(g.id, null, null, null, g.cloudinaryImage),
          name: g.name,
          greeting: g.roleplayGreetings?.[0] ?? "",
        };
      });
    const startIndex = chars.findIndex((c) => c.id === girl.id);
    if (startIndex === -1) return;

    setSeen((prev) => { const next = { ...prev }; next[girl.id] = storySignature(girl); return next; });
    markStorySeen(girl.id, storySignature(girl));
    setStoryChar({ characters: chars, startCharIndex: startIndex, ready: true });
  }, [girls, storySignature]);

  return (
    <>
      {storyVideo && (
        <StoryVideoViewer
          videoSrc={storyVideo.src}
          avatar={storyVideo.avatar}
          name={storyVideo.name}
          girlId={storyVideo.girlId}
          onClose={() => setStoryVideo(null)}
        />
      )}
      {storyChar && storyChar.ready && (
        <StoryViewer
          characters={storyChar.characters}
          startCharIndex={storyChar.startCharIndex}
          initialImageSrc={storyChar.characters[storyChar.startCharIndex]?.images?.[0] ?? ""}
          onClose={() => setStoryChar(null)}
          onMarkSeen={(id) => { const g = girls.find((x) => x.id === id); const sig = g ? storySignature(g) : ""; setSeen((prev) => { const next = { ...prev }; next[id] = sig; return next; }); markStorySeen(id, sig); }}
        />
      )}
      <div className="stories-row">
      {girls.map((girl) => {
        const isSeen = isStorySeen(girl);
        const hasStory = (girl.storyImages?.length ?? 0) > 0 || !!girl.storyVideo;
        return (
          <div
            key={girl.id}
            className="story-item"
            onClick={() => { if (hasStory) openStories(girl); else router.push(`/chat/${girl.id}?picker=1`); }}
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
