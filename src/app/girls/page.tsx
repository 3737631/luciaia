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
  { q: "¿De verdad responde una IA?", a: "Sí, cada personaje está impulsado por IA que entiende el contexto, recuerda la conversación y se adapta a tu forma de hablar.No son respuestas prefabricadas." },
  { q: "¿Tiene memoria?", a: "Sí, cada personaje recuerda lo que hablaste en sesiones anteriores. Puede referirse a temas pasados  y la memoria mejora cuanto más interactúas." },
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

const features = [
  { icon: "🧠", title: "Memoria ilimitada", desc: "Recuerda cada conversación, se adapta a ti con el tiempo." },
  { icon: "🎤", title: "Responde con voz", desc: "Notas de voz y llamadas con IA. Oyes su voz real." },
  { icon: "📹", title: "Videollamadas", desc: "Ves al personaje en pantalla mientras hablas con él." },
  { icon: "❤️", title: "Personalidad que evoluciona", desc: "Cada interacción cambia su forma de responderte." },
  { icon: "📸", title: "Fotos en segundos", desc: "Pídele una foto y la genera al instante." },
  { icon: "⏰", title: "Disponible 24/7", desc: "Siempre conectada, siempre lista para hablar." },
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [activityIdx, setActivityIdx] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    setOnlineCount(120 + Math.floor(Math.random() * 80));
    const actTimer = setInterval(() => {
      setActivityIdx((i) => (i + 1) % activities.length);
    }, 4000);
    const usersTimer = setInterval(() => {
      setOnlineCount((c) => c + Math.floor(Math.random() * 5) - 2);
    }, 8000);
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
      <main className="min-h-screen overflow-x-hidden" style={{ background: "#0b0b0f" }}>
        {/* Social proof bar */}
        <div className="border-b border-white/[0.04] bg-white/[0.02]">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 px-4 py-2 text-[0.6rem] sm:text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="font-semibold text-green-400/90">{onlineCount}</span> usuarios hablando ahora
            </span>
            <span className="hidden text-white/20 sm:inline">|</span>
            <span className="hidden sm:inline">
              <span className="font-semibold text-pink">{currentGirl}</span> {currentActivity}
            </span>
          </div>
        </div>

        <div style={{ padding: "18px 0 0" }} className="sm:pt-7">
          <HeroShowcaseCarousel />
          <StoriesRow />
          <CreateYourGirl />
        </div>

        {/* Features section */}
        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-lg font-bold tracking-tight text-white sm:text-xl">
              ¿Por qué NuviaChat es diferente?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-xs text-white/50 sm:text-sm">
              No es un chat cualquiera. Cada personaje tiene memoria, voz y personalidad propia.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-300 hover:border-pink/30 hover:bg-pink/[0.04] hover:shadow-[0_0_30px_rgba(255,59,127,0.08)]"
                >
                  <span className="text-2xl sm:text-3xl">{f.icon}</span>
                  <h3 className="mt-2 text-sm font-bold text-white sm:text-base">{f.title}</h3>
                  <p className="mt-1 text-[0.6rem] leading-relaxed text-white/50 sm:text-xs">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personajes */}
        <section id="personajes" className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Personajes</h2>
                <p className="mt-0.5 text-xs text-white/50 sm:text-sm">Elige tu favorita y empieza a chatear</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[0.6rem] font-medium transition-all sm:text-xs active:scale-95 ${
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
              {filtered.length > 0 ? (
                filtered.map((girl) => <GirlCard key={girl.id} girl={girl} />)
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-white/50">No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Real FAQ */}
        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-lg font-bold tracking-tight text-white sm:text-xl">Preguntas frecuentes</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-[22px] border border-white/[0.10] bg-white/[0.04] backdrop-blur-sm transition-all duration-200 hover:border-white/20"
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
