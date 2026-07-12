"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import StoriesRow from "@/components/StoriesRow";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import { girls } from "@/data/girls";

const maleIds = new Set(["axel", "liam"]);
const maleChars = girls.filter((g) => maleIds.has(g.id));
const filters = ["Todos", "Dominante", "Tímido"];

export default function ChicosPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const filtered = activeFilter === "Todos" ? maleChars : maleChars.filter((g) => g.personality?.includes(activeFilter.replace(/o$/, "").toLowerCase()));

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh" }}>
        <HeroShowcaseCarousel />

        <div className="container-nuvia">
          <StoriesRow girls={maleChars} />
        </div>

        <section style={{ paddingTop: 18 }}>
          <div className="container-nuvia">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>Chicos</h2>
            </div>

            <div className="scrollbar-none" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  style={{
                    flexShrink: 0, borderRadius: 999, fontWeight: 600, fontSize: "0.5rem",
                    padding: "4px 10px", lineHeight: 1, letterSpacing: "-0.02em",
                    background: activeFilter === f ? "rgba(255,45,117,0.12)" : "var(--surface)",
                    border: activeFilter === f ? "0.5px solid rgba(255,45,117,0.4)" : "0.5px solid var(--border)",
                    color: activeFilter === f ? "var(--pink)" : "var(--muted)",
                    cursor: "pointer", transition: "all 180ms ease",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="character-grid" style={{ marginTop: 10 }}>
              {filtered.length > 0 ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />) : (
                <div style={{ gridColumn: "1 / -1", padding: "24px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "0.6rem", color: "var(--muted)" }}>No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={{ padding: "18px 0" }}>
          <div className="container-nuvia">
            <div style={{ borderRadius: "var(--radius-lg)", background: "var(--surface)", border: "0.5px solid var(--border)", padding: "16px 20px", textAlign: "center" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>NuviaChat</h2>
              <p style={{ fontSize: "0.55rem", color: "var(--muted)", maxWidth: 480, margin: "6px auto 0", lineHeight: 1.5 }}>
                Conversaciones IA personalizadas. Elige entre nuestros personajes ficticios, personaliza su estilo y personalidad, y empieza a chatear o llamar al instante.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 8 }}>
                {["+18", "Personajes IA ficticios", "Sin registro"].map((t) => (
                  <span key={t} style={{ fontSize: "0.45rem", fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.06)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}