"use client";

import { useState, useEffect } from "react";
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
  { q: "¿De verdad responde una IA?", a: "Sí, cada personaje está impulsado por IA que entiende el contexto, recuerda la conversación y se adapta a tu forma de hablar. No son respuestas prefabricadas." },
  { q: "¿Tiene memoria?", a: "Sí, cada personaje recuerda lo que hablaste en sesiones anteriores. Puede referirse a temas pasados y la memoria mejora cuanto más interactúas." },
  { q: "¿Puede enviar audios?", a: "Sí, los personajes pueden enviarte notas de voz generadas por IA con su voz característica. También puedes hablar con ellos mediante micrófono." },
  { q: "¿Puedo llamarla?", a: "Sí, hay videollamada integrada. Ves al personaje en pantalla, responde con voz y reacciona a lo que dices en tiempo real." },
  { q: "¿Cuánto tarda en responder?", a: "Normalmente 1-3 segundos. Las respuestas son rápidas y fluidas, como una conversación real." },
  { q: "¿Qué diferencia hay entre personajes?", a: "Cada una tiene personalidad única, historia distinta, estilo visual y forma de hablar. También puedes personalizar pelo, ropa, fondo y actitud." },
];

const girlNames = ["Luna", "Nia", "Vera", "Alma", "Kira", "Maya", "Sasha", "Yuki"];
const activities = [
  "está escribiendo...",
  "acaba de subir una historia",
  "está en videollamada",
  "acaba de conectarse",
  "está escuchando música",
  "está viendo una peli",
  "está en el gimnasio",
  "está tomando algo",
  "está arreglándose",
  "está de humor",
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [activityIdx, setActivityIdx] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setOnlineCount(120 + Math.floor(Math.random() * 80));
    const actTimer = setInterval(() => { setActivityIdx((i) => (i + 1) % activities.length); }, 4000);
    const usersTimer = setInterval(() => { setOnlineCount((c) => c + Math.floor(Math.random() * 5) - 2); }, 8000);
    return () => { clearInterval(actTimer); clearInterval(usersTimer); };
  }, []);

  const filtered = activeFilter === "Todas"
    ? femaleChars
    : femaleChars.filter((g) =>
        g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
        g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  const currentGirl = girlNames[activityIdx % girlNames.length];
  const currentActivity = activities[activityIdx % activities.length];

  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ background: "#0b0b0f" }}>
        {/* Premium social proof bar */}
        <div className="border-b border-white/[0.04]" style={{ background: "linear-gradient(90deg, rgba(255,60,136,0.03), rgba(255,107,61,0.03))" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2.5 text-[0.55rem] sm:text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30D158] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30D158]" />
              </span>
              <span className="font-bold text-[#30D158]/90">{onlineCount}</span>
              <span className="text-white/50">usuarios conectados</span>
            </span>
            <span className="text-white/[0.12]">|</span>
            <span className="hidden sm:inline text-white/40">
              <span className="font-bold text-white/60">{currentGirl}</span> <span className="text-white/30">{currentActivity}</span>
            </span>
          </div>
        </div>

        {/* Hero + Stories + Create button */}
        <div className="mx-auto max-w-6xl" style={{ padding: "20px 0 0" }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <HeroShowcaseCarousel />
            <StoriesRow />
          </div>
        </div>

        {/* Personajes section */}
        <section id="personajes" className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl" style={{ letterSpacing: "-0.04em" }}>
                  Personajes <span className="text-[#FF3C88]">·</span>
                </h2>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">Elige tu favorita y empieza a chatear al instante</p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="btn-primary flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.55rem] font-bold sm:h-10 sm:px-5 sm:text-xs active:scale-95 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Crear personaje
              </button>
            </div>

            {/* Filters */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[0.55rem] font-semibold transition-all active:scale-95 ${
                    activeFilter === f
                      ? "border-[#FF3C88]/40 bg-[#FF3C88]/15 text-[#FF3C88] shadow-[0_0_16px_rgba(255,60,136,0.1)]"
                      : "border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 max-[380px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {filtered.length > 0 ? (
                filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
              ) : (
                <div className="col-span-full py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <p className="text-sm text-white/40">No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Real FAQ */}
        <section className="mt-16 px-4 sm:px-6 lg:px-8" id="faq">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-xl font-black tracking-tight text-white sm:text-2xl" style={{ letterSpacing: "-0.04em" }}>
              Preguntas frecuentes
            </h2>
            <p className="mt-1 text-center text-xs text-white/40 sm:text-sm">Todo lo que necesitas saber sobre NuviaChat</p>
            <div className="mt-8 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all duration-200 hover:border-white/15"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium text-white transition-colors sm:text-base">
                    {faq.q}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/30 transition-transform duration-200 group-open:rotate-180"><path d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <div className="border-t border-white/[0.06] px-4 py-3.5">
                    <p className="text-xs leading-relaxed text-white/50 sm:text-sm">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info */}
        <section className="mt-16 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF3C88]/20 to-[#FF6B3D]/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF3C88]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">NuviaChat</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/50">
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

      {/* Floating create button (mobile) */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#FF3C88] to-[#FF6B3D] text-white shadow-[0_0_30px_rgba(255,60,136,0.4)] transition-all hover:shadow-[0_0_40px_rgba(255,60,136,0.6)] active:scale-90 sm:hidden"
        title="Crear personaje"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <CreateYourGirl open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
