"use client";

import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const RING_SIZE = 74;
const INNER_SIZE = RING_SIZE - 6;

export default function StoriesRow({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        padding: "16px 16px 8px",
        scrollbarWidth: "none",
      }}
      className="scrollbar-none"
    >
      <button
        onClick={onOpenCreate}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
          background: "none",
          border: 0,
          cursor: "pointer",
          padding: 0,
          width: RING_SIZE + 2,
        }}
      >
        <div
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF5798, #FF6AA5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 3,
          }}
        >
          <div
            style={{
              width: INNER_SIZE,
              height: INNER_SIZE,
              borderRadius: "50%",
              background: "#111116",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Crear</span>
      </button>

      {girls.filter((g) => g.id !== "axel" && g.id !== "liam").map((girl) => (
        <Link
          key={girl.id}
          href={`/chat/${girl.id}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            textDecoration: "none",
            width: RING_SIZE + 2,
          }}
        >
          <div
            style={{
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: "50%",
              padding: 3,
              background: `linear-gradient(135deg, #FF5798, rgba(255,87,152,0.3))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: INNER_SIZE,
                height: INNER_SIZE,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #09090B",
              }}
            >
              <img
                src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                alt={girl.name}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              textAlign: "center",
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {girl.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
