"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StoriesRow from "@/components/StoriesRow";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const femaleIds = new Set(["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"]);
const femaleChars = girls.filter((g) => femaleIds.has(g.id));

const heroSlides = [
  { id: "luna", title: "Tu compañera ideal", subtitle: "Conversaciones infinitas sin límites" },
  { id: "vera", title: "Misterio y seducción", subtitle: "Cada noche es una nueva historia" },
  { id: "yuki", title: "Dulce tentación", subtitle: "La timidez nunca fue tan irresistible" },
];

const experiences = [
  { id: "romance", title: "Romance virtual", subtitle: "Conexiones profundas", badge: "Nuevo", girl: "luna" },
  { id: "gaming", title: "Gaming +18", subtitle: "Juega y seduce", badge: "Popular", girl: "nia" },
  { id: "mystery", title: "Misterio nocturno", subtitle: "Secretos al anochecer", badge: "TOP", girl: "vera" },
  { id: "virtual", title: "Realidad virtual", subtitle: "Experiencia inmersiva", badge: "PRO", girl: "kira" },
  { id: "magic", title: "Magia y fantasía", subtitle: "Historias de otro mundo", badge: "Nuevo", girl: "yumi" },
];

const filters = ["Todas", "Coquetas", "Gamer", "Misteriosas", "Dulces", "Atrevidas", "Latina", "Futurista"];

export default function GirlsPage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState("Todas");

  const filtered = activeFilter === "Todas"
    ? femaleChars
    : femaleChars.filter(
        (g) =>
          g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
          g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  const slide = heroSlides[heroIdx];

  return (
    <>
      <Header />
      <main style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}>
        {/* === HERO CAROUSEL === */}
        <section style={{ position: "relative", width: "100%", height: 250, overflow: "hidden" }}>
          {heroSlides.map((s, i) => (
            <div
              key={s.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === heroIdx ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              <img
                src={getGirlImage(s.id)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 16,
              right: 16,
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
              {slide.title}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>
              {slide.subtitle}
            </p>
          </div>
          {/* Arrows */}
          <button
            onClick={() => setHeroIdx((heroIdx - 1 + heroSlides.length) % heroSlides.length)}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              border: 0,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              fontSize: 16,
            }}
          >
            ‹
          </button>
          <button
            onClick={() => setHeroIdx((heroIdx + 1) % heroSlides.length)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              border: 0,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              fontSize: 16,
            }}
          >
            ›
          </button>
          {/* Dots */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 16,
              display: "flex",
              gap: 6,
            }}
          >
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                style={{
                  width: i === heroIdx ? 20 : 8,
                  height: 4,
                  borderRadius: 2,
                  border: 0,
                  background: i === heroIdx ? "#ff5f8f" : "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </section>

        {/* === STORIES === */}
        <StoriesRow ringSize={86} />

        {/* === NUEVAS EXPERIENCIAS === */}
        <section style={{ padding: "8px 0 12px" }}>
          <div style={{ padding: "0 16px", marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
              Nuevas experiencias
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 16px",
              scrollbarWidth: "none",
            }}
          >
            {experiences.map((exp) => (
              <Link
                key={exp.id}
                href={`/chat/${exp.girl}`}
                style={{
                  flex: "0 0 200px",
                  height: 130,
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                <img
                  src={getGirlImage(exp.girl)}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15))",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "#ff2b86",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    textTransform: "uppercase",
                  }}
                >
                  {exp.badge}
                </span>
                <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>
                    {exp.title}
                  </h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>
                    {exp.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* === PERSONAJES DE NUVIA AI === */}
        <section style={{ padding: "8px 0 12px" }}>
          <div style={{ padding: "0 16px", marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
              Personajes de Nuvia AI
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              padding: "0 16px",
              scrollbarWidth: "none",
            }}
          >
            {femaleChars.slice(0, 8).map((girl) => (
              <Link
                key={girl.id}
                href={`/chat/${girl.id}`}
                style={{
                  flex: "0 0 110px",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                <div
                  style={{
                    width: 110,
                    height: 146,
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                    marginBottom: 6,
                  }}
                >
                  <img
                    src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                    alt={girl.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      padding: "8px 6px 6px",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      {girl.name}
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>
                      {girl.age}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {girl.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* === SEARCH + FILTER === */}
        <div style={{ padding: "12px 16px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {/* Search button */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "0 12px",
                height: 38,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Buscar personajes...</span>
            </div>
            <button
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(255,255,255,0.07)",
                border: 0,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
          {/* Filter chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: activeFilter === f
                    ? "linear-gradient(135deg, #ff5f8f, #ff2b86)"
                    : "rgba(255,255,255,0.08)",
                  color: activeFilter === f ? "#fff" : "rgba(255,255,255,0.6)",
                  transition: "all 0.2s ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* === CHARACTER GRID === */}
        <section style={{ padding: "4px 16px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((girl) => (
                <Link
                  key={girl.id}
                  href={`/chat/${girl.id}`}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "3/4",
                    display: "block",
                    textDecoration: "none",
                    background: "#12121a",
                  }}
                >
                  <img
                    src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                    alt={girl.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                        {girl.name}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>
                        {girl.age}
                      </span>
                    </div>
                    {girl.badge && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#ff5f8f",
                          background: "rgba(255,95,143,0.15)",
                          padding: "2px 6px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                        }}
                      >
                        {girl.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "40px 0",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                }}
              >
                No hay personajes con ese estilo
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
