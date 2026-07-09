"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import StoriesRow from "@/components/StoriesRow";
import CreateYourGirl from "@/components/CreateYourGirl";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const femaleIds = new Set(["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"]);
const femaleChars = girls.filter((g) => femaleIds.has(g.id));

const filters = ["Todas", "Populares", "Nuevas", "Coquetas", "Anime"];

const faqs = [
  { q: "¿De verdad responde una IA?", a: "Sí, cada personaje está impulsado por IA que entiende el contexto, recuerda la conversación y se adapta a tu forma de hablar." },
  { q: "¿Tiene memoria?", a: "Sí, cada personaje recuerda lo que hablaste en sesiones anteriores. La memoria mejora cuanto más interactúas." },
  { q: "¿Puede enviar audios?", a: "Sí, los personajes pueden enviarte notas de voz generadas por IA con su voz característica." },
  { q: "¿Puedo llamarla?", a: "Sí, hay videollamada integrada. Ves al personaje en pantalla y responde con voz en tiempo real." },
  { q: "¿Qué diferencia hay entre personajes?", a: "Cada una tiene personalidad única, historia distinta, estilo visual y forma de hablar." },
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered =
    activeFilter === "Todas"
      ? femaleChars
      : femaleChars.filter(
          (g) =>
            g.style
              ?.toLowerCase()
              .includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
            g.personality?.includes(
              activeFilter.replace(/s$/, "").toLowerCase()
            )
        );

  return (
    <>
      <Header onOpenCreate={() => setCreateOpen(true)} />
      <main style={{ minHeight: "100vh", paddingBottom: 32 }}>
        <HeroShowcaseCarousel onOpenCreate={() => setCreateOpen(true)} />
        <StoriesRow onOpenCreate={() => setCreateOpen(true)} />

        {/* Create your AI - Premium card */}
        <section
          className="container-nuvia"
          style={{ paddingTop: 24, paddingBottom: 4 }}
        >
          <div
            onClick={() => setCreateOpen(true)}
            style={{
              borderRadius: 24,
              background: "#101014",
              border: "0.5px solid rgba(255,255,255,0.08)",
              padding: "16px 20px",
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Mini avatars stack */}
                <div style={{ position: "relative", width: 40, height: 34 }}>
                  {["luna", "nia", "vera", "alma"].map((id, i) => (
                    <div
                      key={id}
                      style={{
                        position: "absolute",
                        left: i * 12,
                        top: i === 3 ? 8 : 0,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.1)",
                        zIndex: 4 - i,
                      }}
                    >
                      <img
                        src={getGirlImage(id)}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      margin: 0,
                      color: "var(--text)",
                    }}
                  >
                    Diseña tu personaje ideal
                  </h3>
                  <p
                    style={{
                      fontSize: "0.5rem",
                      color: "var(--muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    Personaliza aspecto, personalidad, estilo y forma de hablar.
                  </p>
                </div>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.5rem",
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, #ff2d75, #ff5b6e)",
                  color: "#fff",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                Crear mi IA
                <ChevronRight size={10} />
              </span>
            </div>
          </div>
        </section>

        {/* Characters section */}
        <section
          className="container-nuvia"
          style={{ paddingTop: 28, paddingBottom: 8 }}
          id="characters"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  color: "var(--text)",
                }}
              >
                Personajes populares
              </h2>
              <p
                style={{
                  fontSize: "0.5rem",
                  color: "var(--muted)",
                  margin: "2px 0 0",
                }}
              >
                Descubre perfiles destacados y empieza a chatear al instante.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div
            className="scrollbar-none"
            style={{
              display: "flex",
              gap: 4,
              overflowX: "auto",
              paddingBottom: 2,
              marginBottom: 14,
            }}
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  fontWeight: 500,
                  fontSize: "0.5rem",
                  padding: "5px 12px",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  background:
                    activeFilter === f
                      ? "rgba(255,45,117,0.12)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    activeFilter === f
                      ? "0.5px solid rgba(255,45,117,0.3)"
                      : "0.5px solid rgba(255,255,255,0.06)",
                  color:
                    activeFilter === f ? "#ff5b6e" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "all 180ms ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="character-grid">
            {filtered.length > 0
              ? filtered.map((girl) => (
                  <GirlCard key={girl.id} girl={girl} />
                ))
              : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "28px 0",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "0.6rem", color: "var(--muted)" }}>
                    No hay personajes con ese estilo
                  </p>
                </div>
              )}
          </div>
        </section>

        {/* FAQ */}
        <section
          className="container-nuvia"
          style={{ paddingTop: 32, paddingBottom: 8 }}
        >
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textAlign: "center",
                margin: "0 0 14px",
                color: "var(--text)",
              }}
            >
              Preguntas frecuentes
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  style={{
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      display: "flex",
                      cursor: "pointer",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      fontSize: "0.5rem",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.6)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {faq.q}
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div
                    style={{
                      borderTop: "0.5px solid rgba(255,255,255,0.06)",
                      padding: "8px 14px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.45rem",
                        color: "var(--muted)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info */}
        <section
          className="container-nuvia"
          style={{ paddingTop: 28, paddingBottom: 0 }}
        >
          <div
            style={{
              borderRadius: 20,
              background: "rgba(255,255,255,0.02)",
              border: "0.5px solid rgba(255,255,255,0.06)",
              padding: "20px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "var(--text)",
              }}
            >
              Nuvia
            </p>
            <p
              style={{
                fontSize: "0.5rem",
                color: "var(--muted)",
                maxWidth: 400,
                margin: "4px auto 0",
                lineHeight: 1.6,
              }}
            >
              Conversaciones IA personalizadas. Elige, personaliza y chatea con
              personajes ficticios al instante.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 6,
                marginTop: 10,
              }}
            >
              {["+18", "Personajes IA ficticios", "Sin registro"].map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.4rem",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.25)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        style={{
          position: "fixed",
          bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          right: 20,
          zIndex: 40,
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
          boxShadow: "0 4px 20px rgba(255,45,117,0.25)",
          border: 0,
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
      >
        <Plus size={16} stroke="#fff" strokeWidth={2.5} />
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
