"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

export default function HeroShowcaseCarousel({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const featured = ["luna", "nia", "vera"].map(
    (id) => girls.find((g) => g.id === id) || girls[0]
  );

  return (
    <section className="container-nuvia" style={{ paddingTop: 14, paddingBottom: 0 }}>
      <div
        style={{
          borderRadius: 24,
          background: "linear-gradient(160deg, #08080c 0%, #0d0710 50%, #070608 100%)",
          border: "0.5px solid rgba(255,255,255,0.05)",
          overflow: "hidden",
          position: "relative",
          height: "clamp(200px, 36vw, 380px)",
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 60% 70% at 85% 50%, rgba(255,45,117,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            padding: "0 clamp(18px, 3.5vw, 36px)",
            gap: 16,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left content */}
          <div style={{ flex: "1 1 58%", display: "flex", flexDirection: "column", gap: "clamp(3px, 0.8vw, 8px)" }}>
            <span style={{ fontSize: "0.4rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              IA companions
            </span>

            <h1
              style={{
                fontSize: "clamp(20px, 4vw, 48px)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                margin: 0,
                color: "#fff",
                maxWidth: 500,
              }}
            >
              Conecta con personajes de IA únicos
            </h1>

            <p
              style={{
                fontSize: "clamp(10px, 1.1vw, 15px)",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: 400,
              }}
            >
              Explora perfiles, crea el tuyo y empieza una conversación
              personalizada al instante.
            </p>

            <div style={{ display: "flex", gap: 6, marginTop: "clamp(2px, 0.4vw, 6px)", flexWrap: "wrap" }}>
              <Link
                href="#characters"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  fontSize: "clamp(10px, 0.75vw, 13px)", fontWeight: 600,
                  padding: "clamp(5px, 0.6vw, 9px) clamp(12px, 1.2vw, 20px)",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
                  color: "#fff", textDecoration: "none", lineHeight: 1,
                  letterSpacing: "-0.01em", transition: "opacity 180ms ease",
                }}
              >
                Explorar
                <ChevronRight size={11} />
              </Link>
              {onOpenCreate && (
                <button
                  onClick={onOpenCreate}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontSize: "clamp(10px, 0.75vw, 13px)", fontWeight: 600,
                    padding: "clamp(5px, 0.6vw, 9px) clamp(12px, 1.2vw, 20px)",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)", cursor: "pointer",
                    lineHeight: 1, letterSpacing: "-0.01em",
                    transition: "all 180ms ease",
                  }}
                >
                  Crear mi IA
                </button>
              )}
            </div>
          </div>

          {/* Right - minimal cards */}
          <div
            style={{
              flex: "0 0 auto",
              position: "relative",
              width: "clamp(90px, 16vw, 150px)",
              height: "clamp(110px, 20vw, 180px)",
            }}
          >
            <div
              style={{
                position: "absolute", top: "8%", right: "8%",
                width: "clamp(60px, 10vw, 95px)",
                height: "clamp(80px, 14vw, 135px)",
                borderRadius: "clamp(10px, 1.2vw, 16px)",
                overflow: "hidden",
                border: "0.5px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                transform: "rotate(5deg)",
                zIndex: 3,
              }}
            >
              <img src={getGirlImage(featured[0].id)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div
              style={{
                position: "absolute", bottom: "10%", left: "2%",
                width: "clamp(55px, 9vw, 80px)",
                height: "clamp(72px, 12vw, 115px)",
                borderRadius: "clamp(10px, 1.2vw, 16px)",
                overflow: "hidden",
                border: "0.5px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                transform: "rotate(-3deg)",
                zIndex: 2,
              }}
            >
              <img src={getGirlImage(featured[1].id)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
