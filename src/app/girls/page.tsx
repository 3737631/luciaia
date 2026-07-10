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
      <main style={{ minHeight: "100vh" }}>
        <HeroShowcaseCarousel onOpenCreate={() => setCreateOpen(true)} />

        {/* Crea tus fantasías */}
        <section className="container-nuvia" style={{ paddingTop: 26, paddingBottom: 2 }}>
          <div
            onClick={() => setCreateOpen(true)}
            style={{
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(255,45,117,0.08) 0%, rgba(255,91,110,0.04) 100%)",
              border: "0.5px solid rgba(255,45,117,0.15)",
              padding: "20px 22px",
              cursor: "pointer",
              transition: "all 200ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>
                Crea tus <span className="gradient-text">fantasías</span>
              </h3>
              <p style={{ fontSize: "0.5rem", color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                Personaliza aspecto, personalidad y estilo. <br className="sm:hidden" />Tu personaje ideal te espera.
              </p>
            </div>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: "0.5rem", fontWeight: 700,
                padding: "8px 16px", borderRadius: 999, lineHeight: 1,
                background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
                color: "#fff", letterSpacing: "-0.01em",
                whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(255,45,117,0.25)",
              }}
            >
              Crear
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
          </div>
        </section>

        {/* Characters section */}
        <section className="container-nuvia" style={{ paddingTop: 26, paddingBottom: 6 }} id="characters">
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>
              Personajes populares
            </h2>
            <p style={{ fontSize: "0.45rem", color: "var(--muted)", margin: "2px 0 0" }}>
              Descubre perfiles destacados y empieza a chatear al instante.
            </p>
          </div>

          {/* Filters */}
          <div className="scrollbar-none" style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2, marginBottom: 12 }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  fontWeight: 500,
                  fontSize: "0.45rem",
                  padding: "4px 11px",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  background: activeFilter === f ? "rgba(255,45,117,0.1)" : "rgba(255,255,255,0.03)",
                  border: activeFilter === f ? "0.5px solid rgba(255,45,117,0.25)" : "0.5px solid rgba(255,255,255,0.05)",
                  color: activeFilter === f ? "#ff5b6e" : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
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

        {/* FAQ */}
        <section className="container-nuvia" style={{ paddingTop: 28, paddingBottom: 6 }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 12px", color: "var(--text)" }}>
              Preguntas frecuentes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  style={{
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "0.5px solid rgba(255,255,255,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      display: "flex", cursor: "pointer", alignItems: "center",
                      justifyContent: "space-between", padding: "8px 12px",
                      fontSize: "0.45rem", fontWeight: 500,
                      color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em",
                    }}
                  >
                    {faq.q}
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.04)", padding: "6px 12px 8px" }}>
                    <p style={{ fontSize: "0.4rem", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info */}
        <section className="container-nuvia" style={{ paddingTop: 24, paddingBottom: 0 }}>
          <div style={{ borderRadius: 18, background: "rgba(255,255,255,0.015)", border: "0.5px solid rgba(255,255,255,0.05)", padding: "18px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>Nuvia</p>
            <p style={{ fontSize: "0.45rem", color: "var(--muted)", maxWidth: 360, margin: "4px auto 0", lineHeight: 1.6 }}>
              Conversaciones IA personalizadas. Elige, personaliza y chatea con personajes ficticios al instante.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 8 }}>
              {["+18", "Personajes IA", "Sin registro"].map((t) => (
                <span key={t} style={{ fontSize: "0.4rem", fontWeight: 500, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.2)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
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
