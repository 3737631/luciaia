"use client";

import Link from "next/link";
import { MessageCircle, Phone, Video } from "lucide-react";
import type { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function GirlCard({ girl }: { girl: Girl }) {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--surface)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        transition: "all 250ms ease",
        position: "relative",
        aspectRatio: "3/4",
      }}
      className="girl-card"
    >
      {/* Full image bg */}
      <img
        src={getGirlImage(girl.id)}
        alt={girl.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          inset: 0,
          transition: "transform 350ms ease",
        }}
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 40%, rgba(5,5,7,0.85) 78%, rgba(5,5,7,0.95) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Age badge */}
      <div
        style={{
          position: "absolute", top: 8, right: 8,
          fontSize: "0.4rem", fontWeight: 700,
          padding: "2px 7px", borderRadius: 999,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.3, letterSpacing: "-0.01em",
        }}
      >
        {girl.age}
      </div>

      {/* Bottom section */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          padding: "8px 10px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Name + style */}
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, margin: 0, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {girl.name}
          </p>
          {girl.style && (
            <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.45)", margin: "1px 0 0", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              {girl.style}
            </p>
          )}
        </div>

        {/* Action row */}
        <div style={{ display: "flex", gap: 4, alignItems: "stretch" }}>
          <Link
            href={`${basePath}/chat/${girl.id}`}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
              borderRadius: 999, height: 26,
              fontSize: "0.5rem", fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
              textDecoration: "none", lineHeight: 1, letterSpacing: "-0.01em",
            }}
          >
            <MessageCircle size={10} />
            Chatear
          </Link>
          <Link
            href={`${basePath}/call/${girl.id}`}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              transition: "all 150ms ease",
            }}
            title="Llamada"
          >
            <Phone size={10} />
          </Link>
          <Link
            href={`${basePath}/call/${girl.id}`}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              transition: "all 150ms ease",
            }}
            title="Videollamada"
          >
            <Video size={10} />
          </Link>
        </div>
      </div>

      <style>{`
        .girl-card:hover img { transform: scale(1.03); }
        .girl-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.35);
          border-color: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
