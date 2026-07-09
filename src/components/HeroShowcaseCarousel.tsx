"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    title: "1\u00aa Semana Gratis",
    subtitle: "Sin compromiso ni tarjeta",
    cta: "Comenzar",
    href: "#personajes",
  },
  {
    title: "Crea tu roleplay",
    subtitle: "Describe la escena que imaginas",
    cta: "Crear roleplay",
    href: "#personajes",
  },
  {
    title: "Chicas en vivo",
    subtitle: "Conecta en tiempo real",
    cta: "Probar ahora",
    href: "#personajes",
  },
];

export default function HeroShowcaseCarousel() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setActive((a) => (a + 1) % slides.length), []);

  function startAutoplay() { stopAutoplay(); intervalRef.current = setInterval(next, 5000); }
  function stopAutoplay() { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }
  useEffect(() => { startAutoplay(); return stopAutoplay; }, [next]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "clamp(130px, 26vw, 170px)",
        borderRadius: 20,
        background: "radial-gradient(circle at 20% 20%, rgba(255,59,127,0.22), transparent 30%), linear-gradient(135deg, #18141F 0%, #25131B 45%, #111116 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center"
          style={{ opacity: i === active ? 1 : 0, transition: "opacity 0.4s ease", pointerEvents: i === active ? "auto" : "none" }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,11,15,0.6) 0%, rgba(11,11,15,0.15) 60%, rgba(11,11,15,0.3) 100%)" }} />
          <div className="relative z-10 px-5">
            <span className="inline-block rounded-full bg-white/[0.1] px-2 py-0.5 text-[0.4rem] font-semibold text-white/70 mb-2 backdrop-blur-sm">
              EN VIVO
            </span>
            <h2 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(16px, 3vw, 24px)", lineHeight: 1.1, letterSpacing: "-0.04em" }}>
              {s.title}
            </h2>
            <p className="text-white/50 mt-0.5" style={{ fontSize: "clamp(10px, 1.5vw, 13px)", letterSpacing: "-0.01em" }}>
              {s.subtitle}
            </p>
            <Link href={s.href} className="btn-primary mt-2.5 h-6 px-3 text-[0.45rem] font-bold">
              {s.cta}
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="rounded-full transition-all duration-200"
            style={{ width: i === active ? 14 : 4, height: 4, background: i === active ? "#fff" : "rgba(255,255,255,0.25)" }}
          />
        ))}
      </div>
    </div>
  );
}