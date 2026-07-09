"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import StoriesRow from "@/components/StoriesRow";
import CreateYourGirl from "@/components/CreateYourGirl";
import { girls } from "@/data/girls";

const femaleIds = new Set(["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"]);
const femaleChars = girls.filter((g) => femaleIds.has(g.id));

const filters = ["Todas", "Coquetas", "Gamer", "Misteriosas", "Dulces", "Atrevidas"];

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

  const filtered = activeFilter === "Todas"
    ? femaleChars
    : femaleChars.filter((g) =>
        g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
        g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh" }}>
        <HeroShowcaseCarousel />
        <StoriesRow />

        <section style={{ paddingTop: 14, paddingBottom: 8 }}>
          <div className="container-nuvia">
            <div
              onClick={() => setCreateOpen(true)}
              style={{
                borderRadius: "var(--radius-lg)",
                background: "var(--surface)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>
                    Crea tu propia <span className="gradient-text">novia de IA</span>
                  </h3>
                  <p style={{ fontSize: "0.5rem", color: "var(--muted)", margin: "2px 0 0" }}>Personaliza aspecto, personalidad y estilo</p>
                </div>
                <button className="btn-pill">Crear tu IA</button>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {["luna", "nia", "vera", "alma"].map((id) => (
                  <div key={id} style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                    <img src={`https://image.pollinations.ai/prompt/${id}%20portrait?width=60&height=60&seed=1`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
                <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.4rem" }}>+</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 14, paddingBottom: 8 }}>
          <div className="container-nuvia">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>
                Personajes
              </h2>
            </div>

            <div className="scrollbar-none" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    flexShrink: 0,
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: "0.5rem",
                    padding: "4px 10px",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    background: activeFilter === f ? "rgba(255,45,117,0.12)" : "var(--surface)",
                    border: activeFilter === f ? "0.5px solid rgba(255,45,117,0.4)" : "0.5px solid var(--border)",
                    color: activeFilter === f ? "var(--pink)" : "var(--muted)",
                    cursor: "pointer",
                    transition: "all 180ms ease",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="character-grid" style={{ marginTop: 10 }}>
              {filtered.length > 0
                ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
                : (
                  <div style={{ gridColumn: "1 / -1", padding: "24px 0", textAlign: "center" }}>
                    <p style={{ fontSize: "0.6rem", color: "var(--muted)" }}>No hay personajes con ese estilo</p>
                  </div>
                )}
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 18 }}>
          <div className="container-nuvia">
            <h2 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 10px", color: "var(--text)" }}>
              Preguntas frecuentes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 480, margin: "0 auto" }}>
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  style={{
                    borderRadius: 10,
                    background: "var(--surface)",
                    border: "0.5px solid var(--border)",
                    overflow: "hidden",
                    transition: "all 200ms ease",
                  }}
                >
                  <summary style={{
                    display: "flex",
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    fontSize: "0.55rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "-0.01em",
                  }}>
                    {faq.q}
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink: 0, transition: "transform 200ms ease" }} className="group-open:rotate-180">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div style={{ borderTop: "0.5px solid var(--border)", padding: "8px 12px" }}>
                    <p style={{ fontSize: "0.5rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "18px 0" }}>
          <div className="container-nuvia">
            <div style={{
              borderRadius: "var(--radius-lg)",
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              padding: "16px 20px",
              textAlign: "center",
            }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>
                Encuentra tu Match de Novia de IA
              </h2>
              <p style={{ fontSize: "0.55rem", color: "var(--muted)", maxWidth: 480, margin: "6px auto 0", lineHeight: 1.5 }}>
                Explora nuestra colección de personajes IA ficticios. Cada una tiene su propia personalidad, historia y estilo visual. Chatea, llama o personaliza a tu personaje favorito.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 8 }}>
                {["+18", "Personajes IA ficticios", "Chat y llamada", "Sin registro"].map((t) => (
                  <span key={t} style={{
                    fontSize: "0.45rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                    background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
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
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--pink), var(--coral))",
          boxShadow: "0 4px 16px rgba(255,45,117,0.25)",
          border: 0,
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}