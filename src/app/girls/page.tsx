"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import CustomGirlCard from "@/components/CustomGirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import StoriesRow from "@/components/StoriesRow";
import CreateYourGirl from "@/components/CreateYourGirl";
import { girls } from "@/data/girls";
import { getCustomGirls } from "@/lib/storage";

const filters = ["Todas", "Coquetas", "Gamer", "Misteriosas", "Dulces", "Atrevidas"];

const faqs = [
  { q: "¿Qué es NuviaChat?", a: "Es una plataforma de compañía virtual con personajes ficticios generados por IA. Puedes chatear, rolear y llamar con ellas." },
  { q: "¿Es gratis?", a: "Sí, completamente gratis. Sin registro, sin límites." },
  { q: "¿Los personajes son reales?", a: "No, todos los personajes son ficticios y generados por IA. No representan personas reales." },
  { q: "¿Puedo personalizar a mi personaje?", a: "Sí, puedes cambiar su pelo, ropa, fondo y personalidad antes de empezar." },
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [customGirlsList, setCustomGirlsList] = useState<ReturnType<typeof getCustomGirls>>([]);

  useEffect(() => {
    setCustomGirlsList(getCustomGirls());
    function onCreated() { setCustomGirlsList(getCustomGirls()); }
    window.addEventListener("customGirlCreated", onCreated);
    return () => window.removeEventListener("customGirlCreated", onCreated);
  }, []);

  const allGirls = [...customGirlsList.map((c) => ({ ...c, _custom: true })), ...girls];

  const filtered = activeFilter === "Todas"
    ? allGirls
    : allGirls.filter((g) =>
        "_custom" in g || g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
        g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden" style={{ background: "#0b0b0f" }}>
        {/* === NEW TOP SECTION === */}
        <div style={{ padding: "18px 0 0" }} className="sm:pt-7">
          <HeroShowcaseCarousel />
          <StoriesRow />
          <CreateYourGirl />
        </div>

        {/* Personajes */}
        <section id="personajes" className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Personajes</h2>
                <p className="mt-0.5 text-xs text-white/50 sm:text-sm">Elige tu favorita y empieza a chatear</p>
              </div>
            </div>

            {/* Filters */}
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

            {/* Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 max-[380px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {filtered.length > 0 ? (
                filtered.map((girl) =>
                  "_custom" in girl ? (
                    <CustomGirlCard key={girl.id} data={girl as any} />
                  ) : (
                    <GirlCard key={girl.id} girl={girl as any} />
                  )
                )
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-white/50">No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-lg font-bold tracking-tight text-white sm:text-xl">Preguntas frecuentes</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-[22px] border border-white/[0.10] bg-white/[0.04] backdrop-blur-sm transition-all duration-200"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium text-white transition-colors sm:text-base">
                    {faq.q}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/40 transition-transform duration-200 group-open:rotate-180"><path d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <div className="border-t border-white/[0.06] px-4 py-3.5">
                    <p className="text-xs leading-relaxed text-white/50 sm:text-sm">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info block */}
        <section className="mt-12 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[26px] border border-white/[0.10] bg-white/[0.04] p-6 text-center backdrop-blur-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3b7f]/20 to-[#ff7a3d]/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ff3b7f]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">NuviaChat</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Conversaciones IA personalizadas. Elige entre nuestras chicas ficticias, personaliza su estilo y personalidad,
              y empieza a chatear o llamar al instante. Sin registro, sin límites, sin anuncios.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">+18</span>
              <span className="text-white/20">·</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">Personajes IA ficticios</span>
              <span className="text-white/20">·</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">Sin registro</span>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
