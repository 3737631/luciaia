"use client";

import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import type { Girl } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StoriesRow({ girls }: { girls: Girl[] }) {
  return (
    <div style={{
      display: "flex",
      gap: 12,
      overflowX: "auto",
      padding: "12px 0 8px",
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
    }}>
      {girls.map((girl) => (
        <Link
          key={girl.id}
          href={`${basePath}/chat/${girl.id}`}
          style={{
            flexShrink: 0,
            width: 110,
            borderRadius: 22,
            overflow: "hidden",
            textDecoration: "none",
            position: "relative",
            aspectRatio: "3 / 4",
            background: "#1a1a1a",
          }}
        >
          <img
            src={getGirlImage(girl.id, null, null, null, girl.cloudinaryImage)}
            alt={girl.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: girl.imagePosition || "center center",
            }}
          />
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 10px 10px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
          }}>
            <span style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}>
              {girl.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
