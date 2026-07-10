"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import CreateYourGirl from "@/components/CreateYourGirl";
import { girls } from "@/data/girls";

const femaleIds = new Set(["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"]);
const femaleChars = girls.filter((g) => femaleIds.has(g.id));
const filters = ["Todas", "Populares", "Nuevas", "Coquetas"];
const faqs = [
  { q: "¿De verdad responde una IA?", a: "Sí, cada personaje está impulsado por IA que entiende el contexto, recuerda la conversación y se adapta a tu forma de hablar." },
  { q: "¿Tiene memoria?", a: "Sí, cada personaje recuerda lo que hablaste en sesiones anteriores. La memoria mejora cuanto más interactúas." },
  { q: "¿Puedo llamarla?", a: "Sí, hay videollamada integrada. Ves al personaje en pantalla y responde con voz en tiempo real." },
  { q: "¿Qué diferencia hay entre personajes?", a: "Cada una tiene personalidad única, historia distinta, estilo visual y forma de hablar." },
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = activeFilter === "Todas"
    ? femaleChars
    : femaleChars.filter(
        (g) =>
          g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
          g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", paddingBottom: 80 }}>
        <HeroShowcaseCarousel onOpenCreate={() => setCreateOpen(true)} />

        <section className="container-nuvia" style={{ paddingTop: 40 }} id="characters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>
              Personajes populares
            </h2>
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: "0.5rem", fontWeight: 600, padding: "5px 10px",
                borderRadius: 999, lineHeight: 1, letterSpacing: "-0.01em",
                background: "rgba(255,79,151,0.1)",
                border: "0.5px solid rgba(255,79,151,0.15)",
                color: "var(--pink)", cursor: "pointer",
                transition: "all 250ms ease",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              Crea tus fantasías
            </button>
          </div>

          <div className="scrollbar-none" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20 }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  fontWeight: 500,
                  fontSize: "0.45rem",
                  padding: "4px 10px",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  background: activeFilter === f ? "var(--pink)" : "rgba(255,255,255,0.03)",
                  border: "0.5px solid transparent",
                  color: activeFilter === f ? "#fff" : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  transition: "all 250ms ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="character-grid">
            {filtered.length > 0
              ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
              : (
                <div style={{ gridColumn: "1 / -1", padding: "24px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "0.5rem", color: "var(--muted)" }}>No hay personajes con ese estilo</p>
                </div>
              )}
          </div>
        </section>

        <section className="container-nuvia" style={{ paddingTop: 48, paddingBottom: 6 }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 14px", color: "var(--text)" }}>
              Preguntas frecuentes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group"
                  style={{
                    borderRadius: 12,
                    background: "rgba(18,17,24,0.4)",
                    border: "0.5px solid rgba(255,255,255,0.04)",
                    overflow: "hidden",
                    transition: "all 250ms ease",
                  }}
                >
                  <summary
                    style={{
                      display: "flex", cursor: "pointer", alignItems: "center",
                      justifyContent: "space-between", padding: "10px 14px",
                      fontSize: "0.45rem", fontWeight: 500,
                      color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em",
                    }}
                  >
                    {faq.q}
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ flexShrink: 0, transition: "transform 250ms ease" }} className="group-open:rotate-180">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.04)", padding: "8px 14px 10px" }}>
                    <p style={{ fontSize: "0.4rem", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container-nuvia" style={{ paddingTop: 32, paddingBottom: 0 }}>
          <div style={{ borderRadius: 16, background: "rgba(18,17,24,0.3)", border: "0.5px solid rgba(255,255,255,0.04)", padding: "18px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>Nuvia</p>
            <p style={{ fontSize: "0.45rem", color: "var(--muted)", maxWidth: 360, margin: "4px auto 0", lineHeight: 1.6 }}>
              Conversaciones IA personalizadas. Elige, personaliza y chatea con personajes ficticios al instante.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 }}>
              {["+18", "Personajes IA", "Sin registro"].map((t) => (
                <span key={t} style={{ fontSize: "0.4rem", fontWeight: 500, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.2)", border: "0.5px solid rgba(255,255,255,0.04)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}