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
      <main className="min-h-screen" style={{ background: "#0B0B0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="px-4 pt-3">
            <HeroShowcaseCarousel />
          </div>

          <section id="personajes" className="px-4 mt-5">
            <h2 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(14px, 3vw, 18px)", letterSpacing: "-0.04em" }}>Chicos</h2>

            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="shrink-0 rounded-full border px-2.5 py-1 text-[0.45rem] font-semibold transition-all active:scale-95"
                  style={{
                    background: activeFilter === f ? "rgba(255,59,127,0.15)" : "#15151B",
                    borderColor: activeFilter === f ? "rgba(255,67,130,0.55)" : "rgba(255,255,255,0.08)",
                    color: activeFilter === f ? "#FF3B7F" : "#A1A1AA",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.length > 0 ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xs" style={{ color: "#71717A" }}>No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </section>

          <section className="px-4 mt-6 pb-8">
            <div className="p-4 sm:p-5" style={{ borderRadius: 16, background: "#17171D", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-white font-bold tracking-tight text-center" style={{ fontSize: "clamp(13px, 2.5vw, 16px)", letterSpacing: "-0.04em" }}>NuviaChat</h2>
              <p className="text-[0.5rem] text-center mt-2 max-w-md mx-auto leading-relaxed" style={{ color: "#A1A1AA", letterSpacing: "-0.01em" }}>
                Conversaciones IA personalizadas. Elige entre nuestros personajes ficticios, personaliza su estilo y personalidad, y empieza a chatear o llamar al instante.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>+18</span>
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Personajes IA ficticios</span>
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Sin registro</span>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </>
  );
}