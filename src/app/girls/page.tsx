"use client";

import { useState } from "react";
import Header from "@/components/Header";
import GirlCard from "@/components/GirlCard";
import FeaturedRow from "@/components/FeaturedRow";
import BottomNav from "@/components/BottomNav";
import { girls } from "@/data/girls";

const filters = ["Todas", "Nuevas", "Populares"];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");

  const filtered = activeFilter === "Todas"
    ? girls
    : girls.filter(
        (g) =>
          g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
          g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", maxWidth: 1200, margin: "0 auto", padding: "20px var(--container-padding) 0" }}>
        <FeaturedRow />

        <section id="characters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "#fff" }}>
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
                    fontSize: 12,
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

          <div className="person-grid">
            {filtered.length > 0
              ? filtered.map((girl, i) => <GirlCard key={girl.id} girl={girl} index={i} />)
              : (
                <div style={{ gridColumn: "1 / -1", padding: "24px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 14, color: "var(--muted)" }}>No hay personajes con ese estilo</p>
                </div>
              )}
          </div>
        </section>

        <div style={{ height: 32 }} />
      </main>

      <BottomNav />
    </>
  );
}
