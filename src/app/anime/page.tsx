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

  const filtered =
    activeFilter === "Todas"
      ? animeChars
      : animeChars.filter((g) =>
          g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase())
        );

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden" style={{ background: "#0b0b0f" }}>
        <div style={{ padding: "18px 0 0" }} className="sm:pt-7">
          <HeroShowcaseCarousel />
        </div>

        <section id="personajes" className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Anime</h2>
                <p className="mt-0.5 text-xs text-white/50 sm:text-sm">Personajes anime para conversaciones únicas</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[0.6rem] font-medium transition-all sm:text-xs ${
                    activeFilter === f
                      ? "border-[#ff3b7f]/40 bg-[#ff3b7f]/15 text-[#ff3b7f]"
                      : "border-white/[0.10] bg-white/[0.04] text-white/50 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 max-[380px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {filtered.length > 0
                ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
                : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-sm text-white/50">No hay personajes con ese estilo</p>
                  </div>
                )}
            </div>
          </div>
        </section>

        <section className="mt-12 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[26px] border border-white/[0.10] bg-white/[0.04] p-6 text-center backdrop-blur-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3b7f]/20 to-[#ff7a3d]/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ff3b7f]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">NuviaChat</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Personajes anime con IA. Elige entre Sakura, Yumi o Rin y disfruta de conversaciones únicas
              con estilo anime. Personaliza su pelo, ropa y fondo.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">+18</span>
              <span className="text-white/20">·</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">Personajes IA ficticios</span>
              <span className="text-white/20">·</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">Estilo anime</span>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
