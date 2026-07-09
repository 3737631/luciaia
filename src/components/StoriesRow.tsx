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
    <section className="container-nuvia" style={{ paddingTop: 18, paddingBottom: 4 }}>
      <div
        className="scrollbar-none"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {/* Create button */}
        <button
          onClick={onOpenCreate}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            border: 0,
            background: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1.5px dashed rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 200ms ease",
            }}
          >
            <Plus size={18} style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <span style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
            Crear
          </span>
        </button>

        {displayGirls.map((girl, i) => (
          <div
            key={girl.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                padding: 2,
                background:
                  i < 3
                    ? "linear-gradient(135deg, #ff2d75, #ff5b6e)"
                    : "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 200ms ease",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--bg)",
                }}
              >
                <img
                  src={getGirlImage(girl.id)}
                  alt={girl.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  loading="lazy"
                />
              </div>
            </div>
            <span
              style={{
                fontSize: "0.45rem",
                color: i < 3 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
            >
              {girl.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
