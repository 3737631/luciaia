"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import { girls } from "@/data/girls";

const animeIds = new Set(["sakura", "yumi", "rin"]);
const animeChars = girls.filter((g) => animeIds.has(g.id));
const filters = ["Todas", "Mágicas", "Catgirl", "Tsundere"];

export default function AnimePage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const filtered = activeFilter === "Todas" ? animeChars : animeChars.filter((g) => g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()));

  return (
    <>
      <Header />
      <main style={{ background: "#000", minHeight: "100vh" }}>
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="pt-4">
            <HeroShowcaseCarousel />
          </div>

          <section id="personajes" className="mt-6">
            <h2 className="font-semibold tracking-tight text-white" style={{ fontSize: "clamp(0.9rem, 2.8vw, 1.15rem)", letterSpacing: "-0.04em" }}>Anime</h2>

            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.45rem] font-medium transition-all active:scale-95"
                  style={{
                    background: activeFilter === f ? "rgba(255,45,127,0.2)" : "rgba(255,255,255,0.06)",
                    color: activeFilter === f ? "#FF2D7F" : "rgba(255,255,255,0.5)",
                    border: activeFilter === f ? "0.5px solid rgba(255,45,127,0.4)" : "0.5px solid rgba(255,255,255,0.06)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.length > 0 ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 pb-4">
            <div className="p-4 sm:p-5" style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold tracking-tight text-center text-white" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)", letterSpacing: "-0.04em" }}>NuviaChat</h2>
              <p className="text-[0.5rem] text-center mt-2 max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>
                Personajes anime con IA. Elige entre Sakura, Yumi o Rin y disfruta de conversaciones únicas con estilo anime.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {["+18", "Personajes IA ficticios", "Estilo anime"].map((t) => (
                  <span key={t} className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                    {t}
                  </span>
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