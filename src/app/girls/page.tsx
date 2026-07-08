"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GirlCard from "@/components/GirlCard";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

const experiences = [
  { title: "Chat", desc: "Conversaciones naturales con IA", icon: "chat" },
  { title: "Roleplay", desc: "Con acciones y gestos", icon: "sparkles" },
  { title: "Videollamada", desc: "Llamada simulada con voz", icon: "video" },
  { title: "Personalizar", desc: "Pelo, ropa y personalidad", icon: "edit" },
];

const filters = ["Todas", "Coquetas", "Gamer", "Misteriosas", "Dulces", "Atrevidas"];

const expIcons: Record<string, JSX.Element> = {
  chat: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  sparkles: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  video: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  edit: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
};

const faqs = [
  { q: "¿Qué es NuviaChat?", a: "Es una plataforma de compañía virtual con personajes ficticios generados por IA. Puedes chatear, rolear y llamar con ellas." },
  { q: "¿Es gratis?", a: "Sí, completamente gratis. Sin registro, sin límites." },
  { q: "¿Los personajes son reales?", a: "No, todos los personajes son ficticios y generados por IA. No representan personas reales." },
  { q: "¿Puedo personalizar a mi personaje?", a: "Sí, puedes cambiar su pelo, ropa, fondo y personalidad antes de empezar." },
];

export default function GirlsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const storiesRef = useRef<HTMLDivElement>(null);

  const filtered = activeFilter === "Todas"
    ? girls
    : girls.filter((g) =>
        g.style?.toLowerCase().includes(activeFilter.replace(/s$/, "").toLowerCase()) ||
        g.personality?.includes(activeFilter.replace(/s$/, "").toLowerCase())
      );

  const featured = girls[0];

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section
          className="relative mx-4 mt-6 overflow-hidden sm:mx-6 lg:mx-8"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 32,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025)), radial-gradient(circle at top left, rgba(255,43,134,0.28), transparent 36%), radial-gradient(circle at bottom right, rgba(255,122,61,0.20), transparent 34%)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-pink/30 bg-pink/15 px-2.5 py-0.5 text-[0.55rem] font-semibold text-pink">+18</span>
                <span className="rounded-full border border-white/[0.10] bg-white/[0.06] px-2.5 py-0.5 text-[0.55rem] font-semibold text-muted">Personajes IA</span>
                <span className="rounded-full border border-white/[0.10] bg-white/[0.06] px-2.5 py-0.5 text-[0.55rem] font-semibold text-muted">Sin registro</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Chatea con chicas{' '}
                <span className="bg-gradient-to-r from-pink via-orange to-[#ffd166] bg-clip-text text-transparent">IA ficticias</span>
              </h1>
              <p className="mt-2 max-w-lg text-sm text-white/60 sm:text-base">
                Personaliza su estilo, tono y personalidad. Sin registro, sin límites, sin pagos.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="#personajes"
                  className="btn-primary inline-flex h-11 items-center justify-center px-6 text-sm font-bold"
                >
                  Empezar ahora
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-6 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/[0.08] active:scale-[0.97]"
                >
                  Ver experiencias
                </Link>
              </div>
            </div>
            {/* Right card - desktop only */}
            <div className="hidden lg:relative lg:block lg:w-72 xl:w-80">
              <div className="character-card overflow-hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={getGirlImage(featured.id, featured.defaultHair, featured.defaultOutfit, featured.defaultBackground)}
                    alt={featured.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-12">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[0.5rem] font-semibold tracking-wide text-green-400 uppercase">Online ahora</span>
                    </div>
                    <h3 className="text-lg font-bold drop-shadow-lg">{featured.name}</h3>
                    <p className="text-xs text-white/60">{featured.style}</p>
                  </div>
                </div>
                <div className="p-3">
                  <Link href={`/chat/${featured.id}`} className="btn-primary flex h-9 w-full items-center justify-center text-[0.65rem] font-bold">
                    Chatear ahora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Historias */}
        <section className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">Historias</h2>
              <span className="text-[0.55rem] font-medium text-muted sm:text-xs">Toca para chatear</span>
            </div>
            <div ref={storiesRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {girls.map((girl) => (
                <Link key={girl.id} href={`/chat/${girl.id}`} className="group flex shrink-0 flex-col items-center gap-2">
                  <div className="story-ring flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    <div className="h-full w-full overflow-hidden rounded-full bg-[#101018]">
                      <img
                        src={getGirlImage(girl.id, girl.defaultHair, girl.defaultOutfit, girl.defaultBackground)}
                        alt={girl.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  </div>
                  <span className="max-w-[68px] truncate text-center text-[0.55rem] font-medium text-muted sm:text-xs">{girl.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Nuevas experiencias */}
        <section id="features" className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Nuevas experiencias</h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">Descubre todo lo que puedes hacer</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {experiences.map((exp) => (
                <div
                  key={exp.title}
                  className="group cursor-pointer rounded-[22px] border border-white/[0.12] bg-white/[0.055] p-4 backdrop-blur-sm transition-all duration-300 hover:border-pink/40 hover:shadow-[0_20px_60px_rgba(255,43,134,0.10)] sm:p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink/20 to-orange/20 text-pink sm:h-12 sm:w-12">
                    {expIcons[exp.icon]}
                  </div>
                  <h3 className="text-sm font-bold sm:text-base">{exp.title}</h3>
                  <p className="mt-0.5 text-[0.6rem] text-muted/80 sm:text-xs">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personajes */}
        <section id="personajes" className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">Personajes</h2>
                <p className="mt-0.5 text-xs text-muted sm:text-sm">Elige tu favorita y empieza a chatear</p>
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
                      ? "border-pink/40 bg-gradient-to-r from-pink/20 to-orange/20 text-pink"
                      : "border-white/[0.12] bg-white/[0.04] text-muted hover:border-white/25 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 max-[380px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {filtered.length > 0 ? (
                filtered.map((girl) => (
                  <GirlCard key={girl.id} girl={girl} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-muted">No hay personajes con ese estilo</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-lg font-bold tracking-tight sm:text-xl">Preguntas frecuentes</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-[22px] border border-white/[0.12] bg-white/[0.04] backdrop-blur-sm transition-all duration-200"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors sm:text-base">
                    {faq.q}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"><path d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <div className="border-t border-white/[0.06] px-4 py-3.5">
                    <p className="text-xs leading-relaxed text-muted sm:text-sm">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info block */}
        <section className="mt-12 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-[26px] border border-white/[0.12] bg-white/[0.04] p-6 text-center backdrop-blur-sm sm:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink/20 to-orange/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-pink" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">NuviaChat</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Conversaciones IA personalizadas. Elige entre nuestras chicas ficticias, personaliza su estilo y personalidad,
              y empieza a chatear o llamar al instante. Sin registro, sin límites, sin anuncios.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
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
