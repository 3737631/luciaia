"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

export default function HeroShowcaseCarousel({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const featured = ["luna", "nia", "vera", "maya"].map(
    (id) => girls.find((g) => g.id === id) || girls[0]
  );

  return (
    <section className="container-nuvia" style={{ paddingTop: 20, paddingBottom: 0 }}>
      <div
        style={{
          borderRadius: 28,
          background: "linear-gradient(145deg, #0a0a0f 0%, #100a12 40%, #0d080f 100%)",
          border: "0.5px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
          position: "relative",
          height: "clamp(220px, 38vw, 400px)",
        }}
      >
        {/* Subtle radial glow right side */}
        <div
          style={{
            position: "absolute",
            right: "-10%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "45%",
            height: "80%",
            background:
              "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255,45,117,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            padding: "0 clamp(20px, 4vw, 40px)",
            gap: 24,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left content */}
          <div
            style={{
              flex: "1 1 55%",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(4px, 1vw, 10px)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.45rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#ff2d75",
                  display: "inline-block",
                }}
              />
              IA companions
            </span>

            <h1
              style={{
                fontSize: "clamp(22px, 4.5vw, 52px)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                margin: 0,
                color: "#fff",
                maxWidth: 540,
              }}
            >
              Conecta con personajes de IA únicos
            </h1>

            <p
              style={{
                fontSize: "clamp(11px, 1.2vw, 16px)",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: 430,
              }}
            >
              Explora perfiles, crea el tuyo y empieza una conversación
              personalizada al instante.
            </p>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: "clamp(2px, 0.6vw, 8px)",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="#characters"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "clamp(11px, 0.8vw, 14px)",
                  fontWeight: 600,
                  padding: "clamp(6px, 0.7vw, 10px) clamp(14px, 1.5vw, 22px)",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, #ff2d75, #ff5b6e)",
                  color: "#fff",
                  textDecoration: "none",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  transition: "opacity 180ms ease",
                }}
              >
                Explorar personajes
                <ChevronRight size={12} />
              </Link>
              {onOpenCreate && (
                <button
                  onClick={onOpenCreate}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "clamp(11px, 0.8vw, 14px)",
                    fontWeight: 600,
                    padding:
                      "clamp(6px, 0.7vw, 10px) clamp(14px, 1.5vw, 22px)",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                    transition: "all 180ms ease",
                  }}
                >
                  Crear mi IA
                </button>
              )}
            </div>
          </div>

          {/* Right - Avatar composition */}
          <div
            style={{
              flex: "0 0 auto",
              position: "relative",
              width: "clamp(100px, 18vw, 170px)",
              height: "clamp(120px, 22vw, 200px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Card mockup */}
            <div
              style={{
                position: "absolute",
                top: "5%",
                right: "5%",
                width: "clamp(70px, 12vw, 110px)",
                height: "clamp(95px, 17vw, 155px)",
                borderRadius: "clamp(10px, 1.5vw, 18px)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                transform: "rotate(6deg)",
                zIndex: 3,
              }}
            >
              <img
                src={getGirlImage(featured[0].id)}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "4px 6px",
                  background:
                    "linear-gradient(180deg, transparent, rgba(0,0,0,0.8))",
                }}
              >
                <span
                  style={{
                    fontSize: "0.4rem",
                    fontWeight: 700,
                    color: "#fff",
                    display: "block",
                  }}
                >
                  {featured[0].name}
                </span>
              </div>
            </div>

            {/* Second card */}
            <div
              style={{
                position: "absolute",
                bottom: "8%",
                left: "0%",
                width: "clamp(65px, 10vw, 95px)",
                height: "clamp(85px, 14vw, 130px)",
                borderRadius: "clamp(10px, 1.5vw, 18px)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                transform: "rotate(-4deg)",
                zIndex: 2,
              }}
            >
              <img
                src={getGirlImage(featured[2].id)}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Third smaller card */}
            <div
              style={{
                position: "absolute",
                top: "45%",
                left: "18%",
                width: "clamp(50px, 8vw, 75px)",
                height: "clamp(65px, 11vw, 100px)",
                borderRadius: "clamp(8px, 1vw, 14px)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                transform: "rotate(2deg)",
                zIndex: 1,
              }}
            >
              <img
                src={getGirlImage(featured[3].id)}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
