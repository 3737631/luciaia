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
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = activeFilter === "Todas"
    ? girls
    : girls.filter((g) => g.style?.toLowerCase().includes(activeFilter.replace("s", "").toLowerCase()) || g.personality?.includes(activeFilter.replace("s", "").toLowerCase()));

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative mx-4 mt-4 overflow-hidden rounded-2xl sm:mx-6 sm:mt-6 lg:mx-8">
          <div className="relative h-48 w-full sm:h-64 lg:h-72">
            <div className="absolute inset-0 bg-gradient-to-r from-pink/30 via-purple/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
              <span className="mb-2 inline-block rounded-full bg-pink/20 px-2.5 py-0.5 text-[0.6rem] font-semibold text-pink border border-pink/30">Gratis</span>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Chatea con chicas{' '}
                <span className="bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent">IA ficticias</span>
              </h1>
              <p className="mt-1 max-w-md text-xs text-white/60 sm:text-sm">Personaliza su estilo, tono y personalidad. Sin registro.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="#personajes"
                  className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-pink to-purple px-5 text-xs font-bold text-white shadow-lg shadow-pink/25 transition-all hover:shadow-xl hover:shadow-pink/30 active:scale-[0.97] sm:h-11 sm:text-sm"
                >
                  Empezar ahora
                </Link>
                <Link
                  href="#nuevas"
                  className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-medium text-white/80 transition-all hover:bg-white/10 active:scale-[0.97] sm:h-11 sm:text-sm"
                >
                  Ver más
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Avatar row */}
        <section className="mt-6 px-4 sm:px-6 lg:px-8">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {girls.map((girl) => (
              <Link key={girl.id} href={`/chat/${girl.id}`} className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-pink/40 p-0.5 sm:h-20 sm:w-20">
                  <div className="h-full w-full overflow-hidden rounded-full bg-[#14141c]">
                    <img
                      src={getGirlImage(girl.id, girl.defaultHair, girl.defaultOutfit, girl.defaultBackground)}
                      alt={girl.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>
                <span className="text-[0.6rem] font-medium text-muted sm:text-xs">{girl.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Nuevas experiencias */}
        <section id="nuevas" className="mt-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Nuevas experiencias</h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">Descubre todo lo que puedes hacer</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {experiences.map((exp) => (
                <div key={exp.title} className="rounded-xl border border-white/[0.06] bg-[#14141c] p-4 transition-all hover:border-white/15 sm:p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-pink/10 text-pink sm:h-10 sm:w-10">
                    {expIcons[exp.icon]}
                  </div>
                  <h3 className="text-sm font-bold sm:text-base">{exp.title}</h3>
                  <p className="mt-0.5 text-[0.6rem] text-muted sm:text-xs">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personajes section */}
        <section id="personajes" className="mt-8 px-4 sm:px-6 lg:px-8">
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
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.65rem] font-medium transition-all sm:text-xs ${
                    activeFilter === f
                      ? "border-pink/50 bg-pink/15 text-pink"
                      : "border-white/10 bg-white/5 text-muted hover:border-white/25 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {filtered.map((girl) => (
                <GirlCard key={girl.id} girl={girl} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-lg font-bold tracking-tight sm:text-xl">Preguntas frecuentes</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-white/[0.06] bg-[#14141c]">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors sm:text-base">
                    {faq.q}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted transition-transform group-open:rotate-180"><path d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <div className="border-t border-white/[0.06] px-4 py-3.5">
                    <p className="text-xs leading-relaxed text-muted sm:text-sm">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Info block */}
        <section className="mt-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-[#14141c] p-6 text-center sm:p-10">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">NuviaChat</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Conversaciones IA personalizadas. Elige entre nuestras chicas ficticias, personaliza su estilo y personalidad, 
              y empieza a chatear o llamar al instante. Sin registro, sin límites, sin anuncios.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
              <span>+18</span>
              <span className="text-white/20">·</span>
              <span>Personajes IA ficticios</span>
              <span className="text-white/20">·</span>
              <span>Sin registro</span>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}


