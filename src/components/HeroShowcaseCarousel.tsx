"use client";

import { useState } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";

export default function HeroShowcaseCarousel({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="container-nuvia" style={{ paddingTop: 12, paddingBottom: 0 }}>
      <div
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #0c0b12 0%, #0e0912 100%)",
          border: "0.5px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          minHeight: "clamp(130px, 22vw, 220px)",
          padding: "14px 16px",
          gap: 14,
        }}
      >
        <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: 4 }}>
          <h1
            style={{
              fontSize: "clamp(16px, 3vw, 32px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#fff",
            }}
          >
            Conecta con IA
          </h1>
          <p
            style={{
              fontSize: "clamp(9px, 0.9vw, 13px)",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: 320,
            }}
          >
            Explora, crea y chatea con personajes únicos al instante.
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <Link
              href="#characters"
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: "clamp(9px, 0.7vw, 12px)", fontWeight: 600,
                padding: "5px 12px", borderRadius: 999,
                background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
                color: "#fff", textDecoration: "none", lineHeight: 1,
              }}
            >
              Explorar
            </Link>
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  fontSize: "clamp(9px, 0.7vw, 12px)", fontWeight: 600,
                  padding: "5px 12px", borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer", lineHeight: 1,
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
            width: "clamp(70px, 14vw, 130px)",
            height: "clamp(90px, 18vw, 170px)",
            borderRadius: 12,
            overflow: "hidden",
            border: "0.5px solid rgba(255,255,255,0.08)",
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