"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import HeroShowcaseCarousel from "@/components/HeroShowcaseCarousel";
import StoriesRow from "@/components/StoriesRow";
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
      <main style={{ background: "#0B0B0F", minHeight: "100vh" }}>
        <div className="container-nuvia">
          {/* Hero */}
          <div className="pt-3 md:pt-4">
            <HeroShowcaseCarousel />
          </div>

          {/* Stories */}
          <div className="mt-3 md:mt-4">
            <StoriesRow />
          </div>

          {/* Create banner */}
          <section id="crear" className="mt-4 md:mt-5">
            <div
              className="relative overflow-hidden transition-all cursor-pointer active:scale-[0.99]"
              style={{
                borderRadius: 14,
                background: "#17171D",
                border: "0.5px solid rgba(255,255,255,0.08)",
                padding: "14px 16px",
              }}
              onClick={() => setCreateOpen(true)}
            >
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold tracking-tight text-white" style={{ fontSize: "clamp(0.75rem, 2.5vw, 1rem)", letterSpacing: "-0.04em" }}>
                    Crea tu propia <span className="gradient-text">novia de IA</span>
                  </h3>
                  <p className="mt-0.5" style={{ fontSize: "clamp(0.45rem, 1.2vw, 0.55rem)", color: "#71717A" }}>Personaliza aspecto, personalidad y estilo</p>
                </div>
                <button className="btn-pill shrink-0" style={{ height: "clamp(26px, 3vw, 30px)", fontSize: "clamp(0.45rem, 1vw, 0.55rem)" }}>
                  Crear tu IA
                </button>
              </div>
              <div className="flex mt-2 gap-1">
                {["luna", "nia", "vera", "alma"].map((id) => (
                  <div key={id} className="rounded-full overflow-hidden" style={{ width: "clamp(20px, 3vw, 24px)", height: "clamp(20px, 3vw, 24px)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                    <img src={`https://image.pollinations.ai/prompt/${id}%20portrait?width=60&height=60&seed=1`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="rounded-full flex items-center justify-center" style={{ width: "clamp(20px, 3vw, 24px)", height: "clamp(20px, 3vw, 24px)", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.4rem" }}>+</span>
                </div>
              </div>
            </div>
          </section>

          {/* Characters */}
          <section id="personajes" className="mt-5 md:mt-6">
            <h2
              className="text-white font-bold tracking-tight"
              style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", letterSpacing: "-0.04em" }}
            >
              Personajes
            </h2>

            {/* Filters */}
            <div className="flex gap-1.5 overflow-x-auto mt-2 pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="shrink-0 rounded-full font-semibold transition-all active:scale-95"
                  style={{
                    background: activeFilter === f ? "rgba(255,59,127,0.15)" : "#15151B",
                    border: activeFilter === f ? "0.5px solid rgba(255,67,130,0.55)" : "0.5px solid rgba(255,255,255,0.08)",
                    color: activeFilter === f ? "#FF3B7F" : "#A1A1AA",
                    fontSize: "clamp(0.45rem, 1vw, 0.55rem)",
                    padding: "4px 10px",
                    height: "clamp(24px, 3vw, 28px)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="character-grid mt-3">
              {filtered.length > 0
                ? filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
                : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-xs" style={{ color: "#71717A" }}>No hay personajes con ese estilo</p>
                  </div>
                )}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-6 md:mt-8" id="faq">
            <h2
              className="text-center text-white font-bold tracking-tight"
              style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", letterSpacing: "-0.04em" }}
            >
              Preguntas frecuentes
            </h2>
            <div className="mt-3 space-y-1 max-w-lg mx-auto md:max-w-2xl">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group transition-all duration-200 overflow-hidden"
                  style={{ borderRadius: 10, background: "#15151B", border: "0.5px solid rgba(255,255,255,0.07)" }}
                >
                  <summary
                    className="flex cursor-pointer items-center justify-between px-3 py-2.5 font-medium transition-colors"
                    style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.6rem)", color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}
                  >
                    {faq.q}
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="px-3 py-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
                    <p className="leading-relaxed" style={{ fontSize: "clamp(0.45rem, 1.1vw, 0.55rem)", color: "rgba(255,255,255,0.45)" }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* SEO */}
          <section className="mt-5 pb-4 md:mt-6">
            <div style={{ borderRadius: 14, background: "#17171D", border: "0.5px solid rgba(255,255,255,0.06)", padding: "clamp(14px, 2vw, 24px)" }}>
              <h2
                className="text-center text-white font-bold tracking-tight"
                style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.25rem)", letterSpacing: "-0.04em" }}
              >
                Encuentra tu Match de Novia de IA
              </h2>
              <p
                className="text-center mt-2 mx-auto leading-relaxed"
                style={{ fontSize: "clamp(0.45rem, 1.1vw, 0.6rem)", color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em", maxWidth: 600 }}
              >
                Explora nuestra colección de personajes IA ficticios. Cada una tiene su propia personalidad, historia y estilo visual. Chatea, llama o personaliza a tu personaje favorito.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {["+18", "Personajes IA ficticios", "Chat y llamada", "Sin registro"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.06)", fontSize: "clamp(0.35rem, 0.9vw, 0.45rem)", padding: "2px 8px" }}
                  >
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
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-90 sm:hidden"
        style={{ width: 36, height: 36, background: "linear-gradient(135deg, #FF3B7F, #FF5A4F)", boxShadow: "0 4px 16px rgba(255,59,127,0.25)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}