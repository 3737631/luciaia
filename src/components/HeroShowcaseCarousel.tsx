"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    id: 0,
    title: "1ª Semana Gratis",
    subtitle: "Tu primera semana completamente gratis. Sin compromiso, sin tarjeta, sin límites.",
    badge: "EN VIVO",
    cta: "Comenzar ahora",
    href: "#personajes",
    gradient: "linear-gradient(135deg, #FF3C88, #FF6B3D)",
  },
  {
    id: 1,
    title: "Crea tu propio roleplay",
    subtitle: "Describe la escena que siempre has imaginado y la IA lo hará realidad.",
    badge: "NUEVO",
    cta: "Crear roleplay",
    href: "#personajes",
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  {
    id: 2,
    title: "Chicas en vivo ahora",
    subtitle: "Conecta en tiempo real con tu personaje favorito. Siente la conversación.",
    badge: "EN VIVO",
    cta: "Probar ahora",
    href: "#personajes",
    gradient: "linear-gradient(135deg, #FF6B3D, #FF3C88)",
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
  }, [next]);

  return (
    <div
      className="relative mx-4 overflow-hidden sm:mx-6 lg:mx-8"
      style={{
        maxWidth: 1180,
        height: "clamp(200px, 40vw, 340px)",
        borderRadius: 28,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
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
      <div className="relative h-full w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 overflow-hidden"
            style={{
              opacity: i === active ? 1 : 0,
              transform: i === active ? "scale(1)" : "scale(1.06)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            {/* Full gradient background */}
            <div className="absolute inset-0" style={{ background: s.gradient }} />

            {/* Animated blur pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 30%, rgba(0,0,0,0.2) 0%, transparent 40%)
                `,
              }}
            />

            {/* Floating orbs */}
            <div
              className="absolute rounded-full blur-3xl animate-float"
              style={{
                width: "40%",
                height: "80%",
                top: "10%",
                right: "-10%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              className="absolute rounded-full blur-3xl animate-float2"
              style={{
                width: "25%",
                height: "50%",
                bottom: "-10%",
                left: "20%",
                background: "rgba(0,0,0,0.15)",
              }}
            />

            {/* Dark overlay for text readability */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.15) 50%, rgba(9,9,11,0.35) 100%)",
              }}
            />

            {/* Content */}
            <div
              className="absolute left-[22px] right-5 top-1/2 z-10 max-w-[520px] -translate-y-1/2 sm:left-[42px]"
            >
              <span
                className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.5rem] font-black text-white sm:mb-4 sm:px-4 sm:text-xs"
                style={{
                  background: i === 1 ? "rgba(124,58,237,0.9)" : "rgba(255,60,136,0.9)",
                  boxShadow: i === 1 ? "0 0 24px rgba(124,58,237,0.5)" : "0 0 24px rgba(255,60,136,0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {i !== 1 && <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" /></span>}
                {s.badge}
              </span>
              <h1
                className="text-white"
                style={{
                  fontSize: "clamp(24px, 5.5vw, 62px)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.06em",
                  fontWeight: 900,
                  textShadow: "0 8px 30px rgba(0,0,0,0.65)",
                  maxWidth: 620,
                }}
              >
                {s.title}
              </h1>
              <p
                className="mt-1 max-w-[430px] text-white/70 sm:mt-3"
                style={{ fontSize: "clamp(12px, 1.2vw, 16px)", lineHeight: 1.4 }}
              >
                {s.subtitle}
              </p>
              <Link
                href={s.href}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full px-4 text-[0.6rem] font-black text-white transition-all duration-300 hover:scale-105 active:scale-95 sm:mt-5 sm:h-[46px] sm:px-[24px] sm:text-sm"
                style={{
                  background: s.gradient,
                  boxShadow: `0 0 30px ${i === 1 ? "rgba(124,58,237,0.4)" : "rgba(255,60,136,0.4)"}`,
                }}
              >
                {s.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Animated dots */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-[6px] sm:bottom-[14px]">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full border-0 transition-all duration-500"
            style={{
              width: i === active ? 28 : 6,
              height: 6,
              background: i === active
                ? "linear-gradient(90deg, #FF3C88, #FF6B3D)"
                : "rgba(255,255,255,0.25)",
              boxShadow: i === active ? "0 0 12px rgba(255,60,136,0.5)" : "none",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
