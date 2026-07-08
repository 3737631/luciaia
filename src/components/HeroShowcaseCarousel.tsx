"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    id: 0,
    title: "70% OFF",
    subtitle: "Oferta especial por tiempo limitado. Disfruta de todas las funciones premium con un 70% de descuento.",
    badge: "OFERTA",
    cta: "Aprovechar ahora",
    href: "#personajes",
  },
  {
    id: 1,
    title: "Crea tu propio roleplay",
    subtitle: "Describe la escena que siempre has imaginado y la IA lo hará realidad. Tú pones el guión.",
    badge: "NUEVO",
    cta: "Crear roleplay",
    href: "#personajes",
  },
  {
    id: 2,
    title: "Chicas en vivo ahora",
    subtitle: "Conecta en tiempo real con tu personaje favorito. Siente la conversación como nunca antes.",
    badge: "EN VIVO",
    cta: "Probar ahora",
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

  const gradients = [
    "linear-gradient(135deg, #ff0f70, #ff3b7f, #cc0f5a)",
    "linear-gradient(135deg, #7c3aed, #a78bfa, #5b21b6)",
    "linear-gradient(135deg, #ff7a3d, #ff3b7f, #e64a19)",
  ];

  return (
    <div
      className="relative mx-4 h-[185px] overflow-hidden sm:mx-6 sm:h-[260px] lg:mx-8"
      style={{
        maxWidth: 1180,
        borderRadius: 18,
        background: "#17171d",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
      }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={resetAutoplay}
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
            <div
              className="absolute inset-0"
              style={{ background: gradients[i] }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15), rgba(0,0,0,0.30))",
              }}
            />
            <div
              className="absolute left-[22px] right-5 top-1/2 z-10 max-w-[520px] -translate-y-1/2 sm:left-[42px]"
            >
              <span
                className="mb-1 inline-flex rounded-full px-2 py-1 text-[0.5rem] font-black text-white sm:mb-3 sm:px-3.5 sm:text-xs"
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
                  fontSize: "clamp(22px, 5vw, 58px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.06em",
                  textShadow: "0 8px 30px rgba(0,0,0,0.65)",
                  maxWidth: 620,
                }}
              >
                {s.title}
              </h1>
              <p
                className="mt-1 max-w-[430px] text-white/80 sm:mt-3"
                style={{ fontSize: "clamp(12px, 1.2vw, 16px)", lineHeight: 1.4 }}
              >
                {s.subtitle}
              </p>
              <Link
                href={s.href}
                className="mt-2 inline-flex h-8 items-center justify-center rounded-full px-3 text-[0.6rem] font-black text-white sm:mt-5 sm:h-[42px] sm:px-[22px] sm:text-sm"
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
