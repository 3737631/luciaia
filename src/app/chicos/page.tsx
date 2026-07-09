"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
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
      <main style={{ background: "#0B0B0F", minHeight: "100vh" }}>
        <div className="container-nuvia">
          <div className="pt-3 md:pt-4">
            <HeroShowcaseCarousel />
          </div>
          <section id="personajes" className="mt-5 md:mt-6">
            <h2 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", letterSpacing: "-0.04em" }}>Chicos</h2>
            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="shrink-0 rounded-full font-semibold transition-all active:scale-95"
                  style={{ background: activeFilter === f ? "rgba(255,59,127,0.15)" : "#15151B", border: activeFilter === f ? "0.5px solid rgba(255,67,130,0.55)" : "0.5px solid rgba(255,255,255,0.08)", color: activeFilter === f ? "#FF3B7F" : "#A1A1AA", fontSize: "clamp(0.45rem, 1vw, 0.55rem)", padding: "4px 10px", height: "clamp(24px, 3vw, 28px)", letterSpacing: "-0.02em" }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="character-grid mt-3">
              {filtered.length > 0 ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xs" style={{ color: "#71717A" }}>No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </section>
          <section className="mt-5 pb-4">
            <div style={{ borderRadius: 14, background: "#17171D", border: "0.5px solid rgba(255,255,255,0.06)", padding: "clamp(14px, 2vw, 24px)" }}>
              <h2 className="text-center text-white font-bold tracking-tight" style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.25rem)", letterSpacing: "-0.04em" }}>NuviaChat</h2>
              <p className="text-center mt-2 mx-auto leading-relaxed" style={{ fontSize: "clamp(0.45rem, 1.1vw, 0.6rem)", color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em", maxWidth: 600 }}>
                Conversaciones IA personalizadas. Elige entre nuestros personajes ficticios, personaliza su estilo y personalidad, y empieza a chatear o llamar al instante.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {["+18", "Personajes IA ficticios", "Sin registro"].map((t) => (
                  <span key={t} className="rounded-full font-medium" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.06)", fontSize: "clamp(0.35rem, 0.9vw, 0.45rem)", padding: "2px 8px" }}>{t}</span>
                ))}
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}