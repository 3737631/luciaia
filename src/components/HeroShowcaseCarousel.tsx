"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";

const slides = [
  {
    id: 0,
    title: "Nuevas historias disponibles",
    subtitle: "Descubre escenas, chats y momentos nuevos con tus personajes favoritos.",
    badge: "¡NUEVO!",
    cta: "Ver ahora",
    href: "#personajes",
  },
  {
    id: 1,
    title: "Personajes destacados",
    subtitle: "Elige una personalidad y empieza una conversación privada al instante.",
    badge: "TOP",
    cta: "Explorar",
    href: "#personajes",
  },
  {
    id: 2,
    title: "Crea tu chica IA",
    subtitle: "Personaliza estilo, actitud, fondo y forma de hablar.",
    badge: "PERSONALIZABLE",
    cta: "Crear ahora",
    href: "#personajes",
  },
];

export default function HeroShowcaseCarousel() {
  const [active, setActive] = useState(0);
  const [startX, setStartX] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const len = slides.length;

  function goTo(i: number) {
    setActive(i);
    resetAutoplay();
  }

  const next = useCallback(() => {
    setActive((a) => (a + 1) % len);
  }, [len]);

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + len) % len);
  }, [len]);

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = setInterval(next, 5000);
  }

  function stopAutoplay() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function resetAutoplay() {
    startAutoplay();
  }

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);

  const placeholderImg = getGirlImage("luna", "moreno", "toalla", "neon-room");

  return (
    <div
      className="relative mx-auto overflow-hidden sm:mx-6 lg:mx-8"
      style={{
        maxWidth: 1180,
        height: 185,
        borderRadius: 18,
        background: "#17171d",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
      }}
      onPointerDown={(e) => { setStartX(e.clientX); stopAutoplay(); }}
      onPointerUp={(e) => {
        const diff = e.clientX - startX;
        if (diff > 45) prev();
        if (diff < -45) next();
        resetAutoplay();
      }}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0"
            style={{
              opacity: i === active ? 1 : 0,
              transform: i === active ? "scale(1)" : "scale(1.03)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            {/* Placeholder image - REPLACE with real banners later */}
            <img
              src={placeholderImg}
              alt={s.title}
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.75), rgba(0,0,0,0.22), rgba(0,0,0,0.55)), radial-gradient(circle at 80% 30%, rgba(255,59,127,0.32), transparent 35%)",
              }}
            />
            <div
              className="absolute left-[22px] right-5 top-1/2 z-10 max-w-[520px] -translate-y-1/2 sm:left-[42px]"
            >
              <span
                className="mb-2 inline-flex rounded-full px-2.5 py-1.5 text-[0.65rem] font-black text-white sm:mb-3 sm:px-3.5 sm:text-xs"
                style={{
                  background: "#ff0f70",
                  boxShadow: "0 0 24px rgba(255,15,112,0.7)",
                }}
              >
                {s.badge}
              </span>
              <h1
                className="text-white"
                style={{
                  fontSize: "clamp(30px, 5vw, 58px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.06em",
                  textShadow: "0 8px 30px rgba(0,0,0,0.65)",
                  maxWidth: 620,
                }}
              >
                {s.title}
              </h1>
              <p
                className="mt-2 max-w-[430px] text-white/80 sm:mt-3"
                style={{ fontSize: "clamp(13px, 1.2vw, 16px)", lineHeight: 1.45 }}
              >
                {s.subtitle}
              </p>
              <Link
                href={s.href}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-black text-white sm:mt-5 sm:h-[42px] sm:px-[22px] sm:text-sm"
                style={{
                  background: "linear-gradient(135deg, #ff3b7f, #ff7a3d)",
                  boxShadow: "0 0 28px rgba(255,59,127,0.55)",
                }}
              >
                {s.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => { prev(); resetAutoplay(); }}
        className="absolute left-[14px] top-1/2 z-10 hidden h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white sm:flex"
        style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(12px)", lineHeight: 1 }}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={() => { next(); resetAutoplay(); }}
        className="absolute right-[14px] top-1/2 z-10 hidden h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white sm:flex"
        style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(12px)", lineHeight: 1 }}
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-[7px] sm:bottom-[14px]">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full border-0 transition-all duration-200"
            style={{
              width: i === active ? 26 : 7,
              height: 7,
              background: i === active ? "#ff3b7f" : "rgba(255,255,255,0.45)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
