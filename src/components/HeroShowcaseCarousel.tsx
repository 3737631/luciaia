"use client";

import { useState } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";

export default function HeroShowcaseCarousel({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="container-nuvia" style={{ paddingTop: 20, paddingBottom: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          position: "relative",
          minHeight: "clamp(120px, 18vw, 180px)",
        }}
      >
        {/* Animated glow */}
        <div
          style={{
            position: "absolute",
            right: "8%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "clamp(100px, 18vw, 200px)",
            height: "clamp(100px, 18vw, 200px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,90,157,0.12) 0%, transparent 70%)",
            animation: "breathe 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
          <h1
            style={{
              fontSize: "clamp(20px, 3.2vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#fff",
            }}
          >
            Conecta con personajes IA
          </h1>
          <p
            style={{
              fontSize: "clamp(9px, 0.85vw, 13px)",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 280,
            }}
          >
            Miles de personalidades. Chat, voz y videollamada.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <Link
              href="#characters"
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: "clamp(9px, 0.65vw, 12px)", fontWeight: 600,
                padding: "10px 22px", borderRadius: 999, lineHeight: 1,
                background: "linear-gradient(135deg, #FF5A9D, #FF6FAB)",
                color: "#fff", textDecoration: "none",
                boxShadow: "0 2px 10px rgba(255,90,157,0.15)",
                transition: "all 250ms ease",
              }}
            >
              Explorar
            </Link>
          </div>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            width: "clamp(80px, 14vw, 130px)",
            height: "clamp(100px, 18vw, 170px)",
            borderRadius: 16,
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <img
            src={getGirlImage("luna")}
            alt=""
            fetchPriority="high"
            onError={() => !imgFailed && setImgFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      <div
        style={{
          height: 0.5,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          marginTop: 28,
        }}
      />
    </section>
  );
}