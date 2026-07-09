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
      <main className="min-h-screen" style={{ background: "#0b0b0f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="px-3 pt-3 sm:px-4">
            <HeroShowcaseCarousel />
          </div>

          <section id="personajes" className="px-3 mt-5 sm:px-4">
            <h2 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(16px, 3.5vw, 22px)" }}>Chicos</h2>

            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.5rem] font-semibold transition-all active:scale-95 ${activeFilter === f ? "border-[#FF3B86]/40 bg-[#FF3B86]/15 text-[#FF3B86]" : "border-white/[0.08] text-white/40 hover:text-white/70"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.length > 0 ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xs text-white/40">No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </section>

          <section className="px-3 mt-6 pb-8 sm:px-4">
            <div className="rounded-xl p-4 sm:p-5" style={{ background: "#17171c", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-white font-bold tracking-tight text-center" style={{ fontSize: "clamp(14px, 3vw, 18px)" }}>NuviaChat</h2>
              <p className="text-[0.55rem] text-white/50 text-center mt-2 max-w-md mx-auto leading-relaxed">
                Conversaciones IA personalizadas. Elige entre nuestros personajes ficticios, personaliza su estilo y personalidad, y empieza a chatear o llamar al instante.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">+18</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">Personajes IA ficticios</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">Sin registro</span>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}