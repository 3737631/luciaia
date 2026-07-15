"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Header from "@/components/Header";
import GirlCard from "@/components/GirlCard";
import StoriesRow from "@/components/StoriesRow";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getDailyStorySelection } from "@/lib/getDailyStoryIndex";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const femaleIds = new Set([
  "luna","nia","vera","alma","kira","sasha",
  "zara","shadow","morgana","roxy","athena","eva",
  "cora","mira","yumi_lib","raven","sky","jade","gemma",
  "nova","lena"
]);
const maleIds = new Set(["axel", "liam"]);
const animeIds = new Set(["maya", "iris", "yuki"]);
const femaleGirls = girls.filter(g => femaleIds.has(g.id));
const maleChars = girls.filter((g) => maleIds.has(g.id));
const animeChars = girls.filter((g) => animeIds.has(g.id));
const filters = ["Todas", "Nuevas", "Populares"];

const HERO_IMAGES = ["hero-banner2.png", "hero-banner3.png", "hero-banner4.png", "hero-banner.png"];

const preloadImage = (src: string): Promise<void> =>
  new Promise((r) => { const img = new Image(); img.onload = () => r(); img.onerror = () => r(); img.src = src; });

export default function GirlsPage() {
  const [appReady, setAppReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [animKey, setAnimKey] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const preloadedRef = useRef(false);

  // Preload link hrefs for first story of each visible character
  const firstStoryPreloads = useMemo(
    () =>
      femaleGirls
        .filter((g) => g.storyImages?.length)
        .map((g) => {
          const indices = getDailyStorySelection(g.id, g.storyImages!.length);
          if (indices.length === 0) return null;
          return `${basePath}${g.storyImages![indices[0]]}`;
        })
        .filter(Boolean) as string[],
    []
  );

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

  // Preload critical images and other categories
  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    const critical = [
      `${basePath}/${HERO_IMAGES[0]}`,
      ...femaleGirls.slice(0, 8).map(g => getGirlImage(g.id, null, null, null, g.cloudinaryImage)),
    ];
    // Also preload avatars for story circles
    femaleGirls.slice(0, 8).forEach(g => {
      const url = getGirlImage(g.id, null, null, null, g.cloudinaryImage);
      critical.push(url);
    });
    // Background preload other categories' key images
    const otherImages: string[] = [];
    HERO_IMAGES.forEach(h => otherImages.push(`${basePath}/${h}`));
    maleChars.slice(0, 4).forEach(g => otherImages.push(getGirlImage(g.id, null, null, null, g.cloudinaryImage)));
    animeChars.slice(0, 4).forEach(g => otherImages.push(getGirlImage(g.id, null, null, null, g.cloudinaryImage)));
    otherImages.forEach(src => { const img = new Image(); img.src = src; });

    Promise.all(critical.map(preloadImage)).then(() => setAppReady(true));
  }, []);

  const POSITIONS = ["15% center", "8% center", "50% center", "30% center"];

  const filtered = activeFilter === "Todas"
    ? femaleGirls
    : femaleGirls.filter((g) => {
        const b = (g.badge || "").toLowerCase();
        if (activeFilter === "Nuevas") return b.startsWith("nuev");
        if (activeFilter === "Populares") return b === "popular";
        return false;
      });

  if (!appReady) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111", zIndex: 99999 }}>
        <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#FF5798", borderRadius: "50%", animation: "appSpin 600ms linear infinite" }} />
        <style>{`@keyframes appSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <Header />

      {/* Preload first story images for visible characters */}
      {firstStoryPreloads.map((src) => (
        <link key={src} rel="preload" as="image" href={src} fetchPriority="high" />
      ))}

      <div style={{ position: "relative", width: "100%" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img key={heroIndex} src={`${basePath}/${HERO_IMAGES[heroIndex]}`} alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          loading="eager" fetchPriority="high"
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
        <StoriesRow girls={femaleGirls} />

        <section className="fantasy-card">
          <div className="fantasy-card__icon" aria-hidden="true">
            <svg
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                d="M13 35.5 30.5 18l4.5 4.5L17.5 40H13v-4.5Z"
                fill="currentColor"
              />
              <path
                d="m31 12.5 1.8-4.3 1.8 4.3 4.3 1.8-4.3 1.8-1.8 4.3-1.8-4.3-4.3-1.8 4.3-1.8Z"
                fill="currentColor"
              />
              <path
                d="m14 13 1.2-2.8 1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2L14 13Z"
                fill="currentColor"
              />
              <path
                d="m38 31.5 1.2-2.8 1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="fantasy-card__text">
            <h2>Crea tu <span>fantasía</span></h2>
            <p>Describe cómo quieres que sea y Nuvia la convertirá en un personaje único con IA.</p>
          </div>
          <button type="button" className="fantasy-card__button" onClick={() => { const h = document.querySelector('[href="#crear"]'); if (h instanceof HTMLElement) h.click(); }}>
            <span>Crear</span><span aria-hidden="true">→</span>
          </button>
        </section>

        <section id="characters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "#fff" }}>
              Personajes
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
