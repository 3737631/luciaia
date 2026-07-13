"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GirlCard from "@/components/GirlCard";
import StoriesRow from "@/components/StoriesRow";

import { girls } from "@/data/girls";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const animeIds = new Set(["maya", "iris", "yuki"]);
const animeChars = girls.filter((g) => animeIds.has(g.id));
const filters = ["Todas", "Populares"];

const HERO_IMAGES = ["hero-banner2.png", "hero-banner3.png", "hero-banner4.png", "hero-banner.png"];

export default function AnimePage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [animKey, setAnimKey] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setHeroIndex((i) => (diff > 0 ? (i + 1) : (i - 1 + HERO_IMAGES.length)) % HERO_IMAGES.length);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const POSITIONS = ["15% center", "8% center", "50% center", "30% center"];

  const filtered = activeFilter === "Todas"
    ? animeChars
    : animeChars.filter((g) => {
        const b = (g.badge || "").toLowerCase();
        if (activeFilter === "Populares") return b === "popular";
        return false;
      });

  return (
    <>
      <Header />

      <div style={{ position: "relative", width: "100%" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img key={heroIndex} src={`${basePath}/${HERO_IMAGES[heroIndex]}`} alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "100%", display: "block", minHeight: "25vh", objectFit: "cover", objectPosition: POSITIONS[heroIndex], animation: "fadeIn 0.3s ease", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "10px 0 6px" }}>
        {HERO_IMAGES.map((_, i) => (
          <div key={i} style={{
            width: i === heroIndex ? 24 : 6, height: 6, borderRadius: 999,
            background: i === heroIndex ? "#FF5798" : "rgba(255,255,255,0.15)",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      <main style={{ minHeight: "100vh", maxWidth: 1200, margin: "0 auto", padding: "0 var(--container-padding)" }}>
        <StoriesRow girls={animeChars} />

        <section id="characters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "#fff" }}>
              Anime
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
