"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import StoriesRow from "@/components/StoriesRow";
import ExperiencesRow from "@/components/ExperiencesRow";
import CreateYourGirl from "@/components/CreateYourGirl";
import { girls } from "@/data/girls";

const femaleIds = new Set(["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"]);
const femaleChars = girls.filter((g) => femaleIds.has(g.id));

const filters = ["Todas", "Coquetas", "Gamer", "Misteriosas", "Dulces", "Atrevidas"];

const faqs = [
  { q: "¿De verdad responde una IA?", a: "Sí, cada personaje está impulsado por IA que entiende el contexto, recuerda la conversación y se adapta a tu forma de hablar." },
  { q: "¿Tiene memoria?", a: "Sí, cada personaje recuerda lo que hablaste en sesiones anteriores. La memoria mejora cuanto más interactúas." },
  { q: "¿Puede enviar audios?", a: "Sí, los personajes pueden enviarte notas de voz generadas por IA con su voz característica." },
  { q: "¿Puedo llamarla?", a: "Sí, hay videollamada integrada. Ves al personaje en pantalla y responde con voz en tiempo real." },
  { q: "¿Qué diferencia hay entre personajes?", a: "Cada una tiene personalidad única, historia distinta, estilo visual y forma de hablar." },
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = activeFilter === "Todas"
    ? femaleChars
    : femaleChars.filter((g) =>
        g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
        g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ background: "#0b0b0f" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Hero */}
          <div className="px-3 pt-3 sm:px-4">
            <HeroShowcaseCarousel />
          </div>

          {/* Stories */}
          <div className="px-3 mt-2 sm:px-4">
            <StoriesRow />
          </div>

          {/* Nuevas experiencias */}
          <section className="px-3 mt-4 sm:px-4">
            <ExperiencesRow onOpenCreate={() => setCreateOpen(true)} />
          </section>

          {/* Personajes */}
          <section id="personajes" className="px-3 mt-5 sm:px-4">
            <h2 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(16px, 3.5vw, 22px)" }}>
              Personajes
            </h2>

            {/* Filters */}
            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.5rem] font-semibold transition-all active:scale-95 ${
                    activeFilter === f
                      ? "border-[#FF3B86]/40 bg-[#FF3B86]/15 text-[#FF3B86]"
                      : "border-white/[0.08] text-white/40 hover:text-white/70"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.length > 0 ? (
                filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xs text-white/40">No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </section>

          {/* Create your girl banner */}
          <section id="crear" className="px-3 mt-6 sm:px-4">
            <div
              className="relative overflow-hidden rounded-xl p-4 sm:p-5 cursor-pointer transition-all active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #15151b, #1c1c24)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => setCreateOpen(true)}
            >
              {/* Decorative mini circles */}
              <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-[#FF3B86]/10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-[#FF6B45]/10 blur-xl" />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold" style={{ fontSize: "clamp(15px, 3vw, 20px)" }}>
                    Crea tu propia <span className="gradient-text">novia de IA</span>
                  </h3>
                  <p className="text-[0.55rem] text-white/50 mt-0.5">Personaliza su aspecto, personalidad y estilo</p>
                </div>
                <button className="btn-primary shrink-0 h-8 px-3 text-[0.5rem] font-bold active:scale-95">
                  Crear tu IA
                </button>
              </div>

              {/* Mini decorative avatars */}
              <div className="flex mt-3 gap-1.5">
                {["luna", "nia", "vera", "alma"].map((id) => (
                  <div key={id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/[0.08]">
                    <img
                      src={`https://image.pollinations.ai/prompt/${id}%20portrait?width=60&height=60&seed=1`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center border-2 border-white/[0.08]">
                  <span className="text-[0.4rem] text-white/40">+</span>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-3 mt-6 sm:px-4" id="faq">
            <h2 className="text-center text-white font-bold tracking-tight" style={{ fontSize: "clamp(16px, 3.5vw, 20px)" }}>
              Preguntas frecuentes
            </h2>
            <div className="mt-3 space-y-1.5 max-w-2xl mx-auto">
              {faqs.map((faq) => (
                <details key={faq.q}
                  className="group rounded-lg border border-white/[0.08] transition-all duration-200"
                  style={{ background: "#15151b" }}
                >
                  <summary className="flex cursor-pointer items-center justify-between px-3 py-2.5 text-[0.6rem] font-medium text-white/80 transition-colors">
                    {faq.q}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/30 transition-transform duration-200 group-open:rotate-180">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="border-t border-white/[0.06] px-3 py-2">
                    <p className="text-[0.55rem] leading-relaxed text-white/50">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* SEO Block */}
          <section className="px-3 mt-6 sm:px-4">
            <div className="rounded-xl p-4 sm:p-5" style={{ background: "#17171c", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-white font-bold tracking-tight text-center" style={{ fontSize: "clamp(14px, 3vw, 18px)" }}>
                Encuentra tu Match de Novia de IA
              </h2>
              <p className="text-[0.55rem] text-white/50 text-center mt-2 max-w-md mx-auto leading-relaxed">
                Explora nuestra colección de personajes IA ficticios. Cada una tiene su propia personalidad, historia y estilo visual. Chatea, llama o personaliza a tu personaje favorito. Sin registro, sin límites.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">+18</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">Personajes IA ficticios</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">Chat y llamada</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.45rem] text-white/40 border border-white/[0.06]">Sin registro</span>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </main>

      {/* Floating create button (mobile) */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#FF3B86] to-[#FF6B45] text-white shadow-[0_0_24px_rgba(255,59,134,0.4)] transition-all active:scale-90 sm:hidden"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}