"use client";

import { Plus } from "lucide-react";
import { getGirlImage } from "@/lib/images";

const displayGirls = [
  { id: "luna", name: "Luna" },
  { id: "nia", name: "Nia" },
  { id: "vera", name: "Vera" },
  { id: "alma", name: "Alma" },
  { id: "kira", name: "Kira" },
  { id: "maya", name: "Maya" },
  { id: "sasha", name: "Sasha" },
  { id: "yuki", name: "Yuki" },
];

export default function StoriesRow({ onOpenCreate }: { onOpenCreate?: () => void }) {
  return (
    <section className="container-nuvia" style={{ paddingTop: 16, paddingBottom: 2 }}>
      <div
        className="scrollbar-none"
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {/* Create */}
        <button
          onClick={onOpenCreate}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            flexShrink: 0, border: 0, background: "none", cursor: "pointer", padding: 0,
          }}
        >
          <div
            style={{
              width: 58, height: 58, borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 200ms ease",
            }}
          >
            <Plus size={16} style={{ color: "rgba(255,255,255,0.25)" }} />
          </div>
          <span style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>Crear</span>
        </button>

        {displayGirls.map((girl) => (
          <div
            key={girl.id}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              flexShrink: 0, cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 58, height: 58, borderRadius: "50%",
                padding: 2,
                background: "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
              }}
              className="story-ring"
            >
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "var(--bg)" }}>
                <img src={getGirlImage(girl.id)} alt={girl.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              </div>
            </div>
            <span style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", fontWeight: 500 }}>
              {girl.name}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .story-ring { transition: all 200ms ease; }
        .story-ring:hover { background: linear-gradient(135deg, #ff2d75, #ff5b6e) !important; }
      `}</style>
    </section>
  );
}
