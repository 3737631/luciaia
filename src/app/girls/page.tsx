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
      <main className="min-h-screen" style={{ background: "#0B0B0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Hero */}
          <div className="px-4 pt-3">
            <HeroShowcaseCarousel />
          </div>

          {/* Stories */}
          <div className="px-4 mt-3">
            <StoriesRow />
          </div>

          {/* Nuevas experiencias */}
          <section className="px-4 mt-5">
            <ExperiencesRow onOpenCreate={() => setCreateOpen(true)} />
          </section>

          {/* Personajes */}
          <section id="personajes" className="px-4 mt-5">
            <h2 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(14px, 3vw, 18px)", letterSpacing: "-0.04em" }}>
              Personajes
            </h2>

            {/* Filters */}
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

            {/* Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.length > 0 ? (
                filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-xs" style={{ color: "#71717A" }}>No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </section>

          {/* Create your girl banner */}
          <section id="crear" className="px-4 mt-5">
            <div
              className="relative overflow-hidden transition-all cursor-pointer active:scale-[0.99]"
              style={{ borderRadius: 16, background: "#17171D", border: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px" }}
              onClick={() => setCreateOpen(true)}
            >
              <div className="absolute right-0 top-0 w-20 h-20 rounded-full opacity-[0.06]" style={{ background: "#FF3B7F", filter: "blur(40px)" }} />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(13px, 2.5vw, 16px)", letterSpacing: "-0.04em" }}>
                    Crea tu propia <span className="gradient-text">novia de IA</span>
                  </h3>
                  <p className="text-[0.5rem] mt-0.5" style={{ color: "#71717A" }}>Personaliza su aspecto, personalidad y estilo</p>
                </div>
                <button className="btn-primary shrink-0 h-7 px-3 text-[0.45rem] font-bold">
                  Crear tu IA
                </button>
              </div>
              <div className="flex mt-2.5 gap-1">
                {["luna", "nia", "vera", "alma"].map((id) => (
                  <div key={id} className="w-6 h-6 rounded-full overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <img src={`https://image.pollinations.ai/prompt/${id}%20portrait?width=60&height=60&seed=1`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <span className="text-[0.35rem]" style={{ color: "#71717A" }}>+</span>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="px-4 mt-6" id="faq">
            <h2 className="text-center text-white font-bold tracking-tight" style={{ fontSize: "clamp(14px, 3vw, 18px)", letterSpacing: "-0.04em" }}>
              Preguntas frecuentes
            </h2>
            <div className="mt-3 space-y-1.5 max-w-2xl mx-auto">
              {faqs.map((faq) => (
                <details key={faq.q}
                  className="group transition-all duration-200"
                  style={{ borderRadius: 12, background: "#15151B", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <summary className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[0.55rem] font-medium text-white/80 transition-colors" style={{ letterSpacing: "-0.01em" }}>
                    {faq.q}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 transition-transform duration-200 group-open:rotate-180" style={{ color: "#71717A" }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="px-3.5 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[0.5rem] leading-relaxed" style={{ color: "#A1A1AA" }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* SEO Block */}
          <section className="px-4 mt-5">
            <div className="p-4 sm:p-5" style={{ borderRadius: 16, background: "#17171D", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-white font-bold tracking-tight text-center" style={{ fontSize: "clamp(13px, 2.5vw, 16px)", letterSpacing: "-0.04em" }}>
                Encuentra tu Match de Novia de IA
              </h2>
              <p className="text-[0.5rem] text-center mt-2 max-w-md mx-auto leading-relaxed" style={{ color: "#A1A1AA", letterSpacing: "-0.01em" }}>
                Explora nuestra colección de personajes IA ficticios. Cada una tiene su propia personalidad, historia y estilo visual. Chatea, llama o personaliza a tu personaje favorito. Sin registro, sin límites.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>+18</span>
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Personajes IA ficticios</span>
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Chat y llamada</span>
                <span className="rounded-full px-2 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.03)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Sin registro</span>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </main>

      {/* Floating create button (mobile) */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 sm:hidden"
        style={{ background: "linear-gradient(135deg, #FF3B7F, #FF5A4F)", boxShadow: "0 4px 16px rgba(255,59,127,0.3)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}