"use client";

import { useState } from "react";
import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const STORY_IDS = ["luna", "nia", "vera", "alma", "maya", "kira", "sasha", "yuki"];
const storyGirls = STORY_IDS.map((id) => girls.find((g) => g.id === id)).filter(Boolean) as typeof girls;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow() {
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const handleClick = (id: string) => {
    setSeen((prev) => new Set(prev).add(id));
  };

  return (
    <div style={{
      display: "flex",
      gap: 16,
      overflowX: "auto",
      padding: "12px 0 8px",
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
    }}>
      {storyGirls.map((girl) => {
        const isSeen = seen.has(girl.id);
        return (
          <Link
            key={girl.id}
            href={`${basePath}/chat/${girl.id}`}
            onClick={() => handleClick(girl.id)}
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
                  src={getGirlImage(girl.id)}
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
  );
}
