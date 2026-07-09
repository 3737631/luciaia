"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

export default function GirlCard({ girl, href }: { girl: Girl; href?: string }) {
  const link = href || `/girl/${girl.id}`;

  return (
    <Link href={link} style={{ textDecoration: "none", display: "block", borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface)", border: "0.5px solid var(--border)", transition: "all 200ms ease", position: "relative", aspectRatio: "3/4" }}>
      <img
        src={getGirlImage(girl.id)}
        alt={girl.name}
        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
        loading="lazy"
      />

      {/* Overlay gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 50%, rgba(5,5,7,0.85) 85%)",
        pointerEvents: "none",
      }} />

      {/* Top info */}
      <div style={{ position: "absolute", top: 6, left: 6, right: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
        {girl.personality && (
          <span style={{
            fontSize: "0.45rem", fontWeight: 600, padding: "1px 5px", borderRadius: 999,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.85)", lineHeight: 1.4, letterSpacing: "-0.01em",
          }}>
            {girl.personality}
          </span>
        )}
        <span style={{
          fontSize: "0.45rem", fontWeight: 600, padding: "1px 5px", borderRadius: 999,
          background: "rgba(255,45,117,0.2)", backdropFilter: "blur(8px)",
          color: "#ff5b6e", lineHeight: 1.4, letterSpacing: "-0.01em",
        }}>
          {girl.age || 18}
        </span>
      </div>

      {/* Bottom content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px" }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, margin: 0, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          {girl.name}
        </p>
        {girl.style && (
          <p style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.5)", margin: "1px 0 4px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            {girl.style}
          </p>
        )}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
          background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
          borderRadius: 999, height: 24, fontSize: "0.55rem", fontWeight: 600, color: "#fff",
          lineHeight: 1, letterSpacing: "-0.01em",
        }}>
          <MessageCircle size={10} />
          Chatear
        </div>
      </div>
    </Link>
  );
}