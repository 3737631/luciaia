"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TOTAL_STORIES = 17;
const STORY_IMAGES = Array.from({ length: TOTAL_STORIES }, (_, i) => {
  const n = i + 1;
  const ext = n <= 9 ? "jpg" : "png";
  return `${basePath}/iris_stories/iris_story_${n}.${ext}`;
});

function getDayIndex(): number {
  const start = new Date(2026, 6, 12);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return diff % TOTAL_STORIES;
}

function timeAgo(): string {
  const h = new Date().getHours();
  if (h < 1) return "Hace 1 hora";
  if (h < 6) return `Hace ${h} horas`;
  return `Hace ${h} horas`;
}

export default function StoryViewer({ onClose }: { onClose: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { onClose(); return 0; }
        return p + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{
        display: "flex", gap: 4, padding: "8px 8px 0",
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
      }}>
        <div key={getDayIndex()} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: "rgba(255,255,255,0.25)", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${progress}%`, background: "#fff",
            transition: "width 0.05s linear",
          }} />
        </div>
      </div>

      <div style={{
        position: "absolute", top: 20, left: 12, right: 60, zIndex: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", overflow: "hidden",
          border: "2px solid #FF5798", flexShrink: 0,
        }}>
          <img src={`${basePath}/iris_stories/iris_story_${getDayIndex() + 1}.jpg`} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>iris</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginLeft: 8 }}>{timeAgo()}</span>
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute", top: 20, right: 12, zIndex: 10,
          background: "none", border: 0, color: "#fff", fontSize: 24, cursor: "pointer",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1, opacity: 0.8,
        }}
      >&#10005;</button>

      <div
        style={{ position: "absolute", left: 0, top: 0, bottom: 80, width: "100%", zIndex: 5 }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src={STORY_IMAGES[getDayIndex()]} alt=""
          style={{
            width: "100%", maxHeight: "80vh", objectFit: "contain",
            userSelect: "none", WebkitUserSelect: "none",
          }}
        />
      </div>

      <div style={{
        padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        marginTop: "auto",
      }}>
        <Link href="/chat/iris"
          style={{
            flex: 1, display: "block", padding: "10px 16px",
            borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none",
          }}
          onClick={onClose}
        >Enviar mensaje</Link>
      </div>
    </div>
  );
}
