"use client";

import { useState } from "react";
import Header from "@/components/Header";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import CreateYourGirl from "@/components/CreateYourGirl";
import { girls } from "@/data/girls";

const femaleIds = new Set(["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"]);
const femaleChars = girls.filter((g) => femaleIds.has(g.id));
const filters = ["Todas", "Nuevas", "Populares", "Coquetas"];

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
        <HeroShowcaseCarousel />

        {/* Crea tus fantasías */}
        <section className="container-nuvia" style={{ paddingTop: 20, paddingBottom: 2 }}>
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

        <section style={{ padding: "16px 16px 0" }} id="characters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "#fff" }}>
              Personajes
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 11,
                    padding: "5px 12px",
                    lineHeight: 1,
                    background: activeFilter === f ? "#FF5798" : "rgba(255,255,255,0.04)",
                    border: "1px solid transparent",
                    borderColor: activeFilter === f ? "transparent" : "rgba(255,255,255,0.06)",
                    color: activeFilter === f ? "#fff" : "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    transition: "all 250ms ease",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="character-grid">
            {filtered.length > 0
              ? filtered.map((girl, i) => <GirlCard key={girl.id} girl={girl} index={i} />)
              : (
                <div style={{ gridColumn: "1 / -1", padding: "24px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>No hay personajes con ese estilo</p>
                </div>
              )}
          </div>
        </section>

        <div style={{ height: 24 }} />
      </main>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
