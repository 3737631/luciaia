"use client";

import { useEffect, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TOTAL_STORIES = 9;
const STORY_IMAGES = Array.from({ length: TOTAL_STORIES }, (_, i) => `${basePath}/iris_stories/iris_story_${i + 1}.jpg`);

function getDayIndex(): number {
  const start = new Date(2026, 6, 12);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return diff % TOTAL_STORIES;
}

export default function StoryViewer({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(getDayIndex());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIndex((i) => (i + 1) % TOTAL_STORIES);
          return 0;
        }
        return p + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [index]);

  const goNext = () => setIndex((i) => (i + 1) % TOTAL_STORIES);
  const goPrev = () => setIndex((i) => (i - 1 + TOTAL_STORIES) % TOTAL_STORIES);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000",
        display: "flex", flexDirection: "column",
      }}
      onClick={goNext}
    >
      <div style={{
        display: "flex", gap: 4, padding: "8px 8px 0",
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
      }}>
        {STORY_IMAGES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < index ? "#fff" : i === index ? "#fff" : "rgba(255,255,255,0.25)",
            position: "relative", overflow: "hidden",
          }}>
            {i === index && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${progress}%`, background: "#fff",
                transition: "width 0.05s linear",
              }} />
            )}
          </div>
        ))}
      </div>

      <button onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          background: "rgba(0,0,0,0.4)", border: 0, borderRadius: "50%",
          width: 32, height: 32, color: "#fff", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
        }}
      >&#10005;</button>

      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%", zIndex: 5 }}
        onClick={(e) => { e.stopPropagation(); goPrev(); }} />

      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "30%", zIndex: 5 }}
        onClick={(e) => { e.stopPropagation(); goNext(); }} />

      <img src={STORY_IMAGES[index]} alt=""
        style={{
          flex: 1, width: "100%", objectFit: "contain",
          userSelect: "none", WebkitUserSelect: "none",
        }}
      />
    </div>
  );
}
