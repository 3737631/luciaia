"use client";

import { useState } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";

export default function HeroShowcaseCarousel({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="container-nuvia" style={{ paddingTop: 16, paddingBottom: 0 }}>
      <div
        style={{
          borderRadius: 24,
          background: "linear-gradient(145deg, #0c0b14 0%, #0e0914 100%)",
          border: "0.5px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          padding: "24px",
          gap: 20,
          position: "relative",
          overflow: "hidden",
          minHeight: "clamp(130px, 20vw, 200px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "12%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "clamp(80px, 16vw, 160px)",
            height: "clamp(80px, 16vw, 160px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,79,151,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
          <h1
            style={{
              fontSize: "clamp(18px, 3vw, 34px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#fff",
            }}
          >
            Conecta con IA
          </h1>
          <p
            style={{
              fontSize: "clamp(9px, 0.85vw, 13px)",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 300,
            }}
          >
            Explora, crea y chatea con personajes únicos al instante.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <Link
              href="#characters"
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: "clamp(9px, 0.7vw, 12px)", fontWeight: 600,
                padding: "10px 20px", borderRadius: 999, lineHeight: 1,
                background: "linear-gradient(135deg, #FF4F97, #FF63A2)",
                color: "#fff", textDecoration: "none",
                boxShadow: "0 2px 12px rgba(255,79,151,0.18)",
                transition: "all 250ms ease",
              }}
            >
              Explorar
            </Link>
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: "clamp(9px, 0.7vw, 12px)", fontWeight: 600,
                  padding: "10px 20px", borderRadius: 999, lineHeight: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  transition: "all 250ms ease",
                }}
              >
                Crear mi IA
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            width: "clamp(70px, 13vw, 120px)",
            height: "clamp(90px, 17vw, 160px)",
            borderRadius: 16,
            overflow: "hidden",
            border: "0.5px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
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
    </section>
  );
}