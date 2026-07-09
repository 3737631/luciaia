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
      <main style={{ background: "#000", minHeight: "100vh" }}>
        <div className="mx-auto max-w-screen-md px-5">
          {/* Hero */}
          <div className="pt-4">
            <HeroShowcaseCarousel />
          </div>

          {/* Stories */}
          <div className="mt-4">
            <StoriesRow />
          </div>

          {/* Nuevas experiencias */}
          <section className="mt-6">
            <ExperiencesRow onOpenCreate={() => setCreateOpen(true)} />
          </section>

          {/* Personajes */}
          <section id="personajes" className="mt-6">
            <h2 className="font-semibold tracking-tight text-white" style={{ fontSize: "clamp(0.9rem, 2.8vw, 1.15rem)", letterSpacing: "-0.04em" }}>
              Personajes
            </h2>

            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button
                  key={f} onClick={() => setActiveFilter(f)}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.45rem] font-medium transition-all active:scale-95"
                  style={{
                    background: activeFilter === f ? "rgba(255,45,127,0.2)" : "rgba(255,255,255,0.06)",
                    color: activeFilter === f ? "#FF2D7F" : "rgba(255,255,255,0.5)",
                    letterSpacing: "-0.02em",
                    border: activeFilter === f ? "0.5px solid rgba(255,45,127,0.4)" : "0.5px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.length > 0
                ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
                : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No hay personajes con ese estilo</p>
                  </div>
                )}
            </div>
          </section>

          {/* Create your girl banner */}
          <section id="crear" className="mt-5">
            <div
              className="relative overflow-hidden transition-all cursor-pointer active:scale-[0.99]"
              style={{
                borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                padding: "16px 20px",
              }}
              onClick={() => setCreateOpen(true)}
            >
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold tracking-tight text-white" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)", letterSpacing: "-0.04em" }}>
                    Crea tu propia <span style={{ background: "linear-gradient(135deg, #FF2D7F, #FF5A4F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>novia de IA</span>
                  </h3>
                  <p className="text-[0.5rem] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Personaliza aspecto, personalidad y estilo</p>
                </div>
                <button className="btn-pill shrink-0 h-7 px-3 text-[0.45rem] font-semibold">
                  Crear tu IA
                </button>
              </div>
              <div className="flex mt-2.5 gap-1">
                {["luna", "nia", "vera", "alma"].map((id) => (
                  <div key={id} className="w-6 h-6 rounded-full overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>
                    <img src={`https://image.pollinations.ai/prompt/${id}%20portrait?width=60&height=60&seed=1`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.4rem" }}>+</span>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-6" id="faq">
            <h2 className="text-center font-semibold tracking-tight text-white" style={{ fontSize: "clamp(0.9rem, 2.8vw, 1.15rem)", letterSpacing: "-0.04em" }}>
              Preguntas frecuentes
            </h2>
            <div className="mt-3 space-y-1 max-w-lg mx-auto">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group transition-all duration-200 overflow-hidden"
                  style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)" }}
                >
                  <summary className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-[0.55rem] font-medium transition-colors" style={{ color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>
                    {faq.q}
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="px-3.5 py-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
                    <p className="text-[0.5rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* SEO Block */}
          <section className="mt-5 pb-4">
            <div className="p-4 sm:p-5" style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-semibold tracking-tight text-center text-white" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)", letterSpacing: "-0.04em" }}>
                Encuentra tu Match de Novia de IA
              </h2>
              <p className="text-[0.5rem] text-center mt-2 max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>
                Explora nuestra colección de personajes IA ficticios. Cada una tiene su propia personalidad, historia y estilo visual. Chatea, llama o personaliza a tu personaje favorito.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {["+18", "Personajes IA ficticios", "Chat y llamada", "Sin registro"].map((t) => (
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

      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 sm:hidden"
        style={{ background: "linear-gradient(135deg, #FF2D7F, #FF5A4F)", boxShadow: "0 4px 16px rgba(255,45,127,0.25)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}