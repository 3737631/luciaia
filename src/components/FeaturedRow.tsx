"use client";

import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const featured = girls.filter((g) => g.badge).slice(0, 4);

export default function FeaturedRow() {
  if (featured.length === 0) return null;

  return (
    <div className="featured-row">
      {featured.map((girl) => (
        <Link
          key={girl.id}
          href={`/chat/${girl.id}`}
          className="featured-card"
          style={{ textDecoration: "none", display: "block" }}
        >
          <img
            src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
            alt={girl.name}
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              objectPosition: girl.imagePosition || "center center",
            }}
          />
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              left: 16,
              right: 16,
              bottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.4px",
                }}
              >
                {girl.name}
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {girl.age}
              </span>
            </div>
            {girl.badge && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: 4,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(235,35,87,0.92)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {girl.badge}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
