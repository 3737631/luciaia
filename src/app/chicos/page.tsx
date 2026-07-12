"use client";

import { useState } from "react";
import Header from "@/components/Header";
import GirlCard from "@/components/GirlCard";
import StoriesRow from "@/components/StoriesRow";

import { girls } from "@/data/girls";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const maleIds = new Set(["axel", "liam"]);
const maleChars = girls.filter((g) => maleIds.has(g.id));
const filters = ["Todos", "Dominante", "Tímido"];

export default function ChicosPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [animKey, setAnimKey] = useState(0);

  const filtered = activeFilter === "Todos"
    ? maleChars
    : maleChars.filter((g) => g.personality?.includes(activeFilter.replace(/o$/, "").toLowerCase()));

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", maxWidth: 1200, margin: "0 auto", padding: "20px var(--container-padding) 0" }}>
        <img src={`${basePath}/hero-banner.png`} alt="" style={{ width: "100%", borderRadius: 22, marginBottom: 8 }} />
        <StoriesRow girls={maleChars} />

        <section id="characters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "#fff" }}>
              Chicos
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setAnimKey((k) => k + 1); }}
                  style={{
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 12,
                    padding: "6px 14px",
                    lineHeight: 1,
                    background: activeFilter === f ? "#FF3B82" : "rgba(255,255,255,0.04)",
                    border: "1px solid transparent",
                    borderColor: activeFilter === f ? "rgba(255,59,130,0.4)" : "rgba(255,255,255,0.06)",
                    color: activeFilter === f ? "#fff" : "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    transform: activeFilter === f ? "scale(1.05)" : "scale(1)",
                    transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animation: activeFilter === f ? "filterPop 200ms ease" : "none",
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

    </>
  );
}
