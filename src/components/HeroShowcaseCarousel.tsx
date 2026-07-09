"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    title: "1ª Semana Gratis",
    subtitle: "Sin compromiso ni tarjeta",
    cta: "Comenzar",
    href: "#personajes",
    bg: "linear-gradient(135deg, #FF3B86, #FF6B45)",
  },
  {
    title: "Crea tu roleplay",
    subtitle: "Describe la escena que imaginas",
    cta: "Crear roleplay",
    href: "#personajes",
    bg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  {
    title: "Chicas en vivo",
    subtitle: "Conecta en tiempo real",
    cta: "Probar ahora",
    href: "#personajes",
    bg: "linear-gradient(135deg, #FF6B45, #FF3B86)",
  },
];

export default function HeroShowcaseCarousel() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const len = slides.length;

  const next = useCallback(() => {
    setActive((a) => (a + 1) % len);
  }, [len]);

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = setInterval(next, 5000);
  }
  function stopAutoplay() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }
  useEffect(() => { startAutoplay(); return stopAutoplay; }, [next]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: "clamp(140px, 28vw, 180px)",
        background: slides[active].bg,
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: i === active ? "auto" : "none",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,11,15,0.7) 0%, rgba(11,11,15,0.3) 60%, rgba(11,11,15,0.2) 100%)" }} />

          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/[0.06] blur-xl" />
          <div className="absolute -bottom-8 right-10 w-24 h-24 rounded-full bg-white/[0.04] blur-xl" />

          <div className="relative z-10 px-4 sm:px-6">
            <h2 className="text-white font-black tracking-tight" style={{ fontSize: "clamp(18px, 4vw, 28px)", lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
              {s.title}
            </h2>
            <p className="text-white/70 mt-0.5" style={{ fontSize: "clamp(11px, 1.8vw, 14px)" }}>
              {s.subtitle}
            </p>
            <Link
              href={s.href}
              className="mt-2 inline-flex h-7 items-center rounded-full px-3 text-[0.5rem] font-bold text-white transition-all active:scale-95 hover:brightness-110"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
            >
              {s.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 16 : 4,
              height: 4,
              background: i === active ? "#fff" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}