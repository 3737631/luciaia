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

  const s = slides[active];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "clamp(7rem, 28vw, 10rem)",
        borderRadius: 20,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(40px) saturate(1.4)",
        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center px-5"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 0.45s ease",
            pointerEvents: i === active ? "auto" : "none",
          }}
        >
          <div className="relative z-10 max-w-xs">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[0.4rem] font-semibold mb-2"
              style={{
                background: "rgba(255,45,122,0.2)",
                color: "#FF2D7A",
                letterSpacing: "0.04em",
              }}
            >
              EN VIVO
            </span>
            <h2
              className="text-white font-semibold tracking-tight"
              style={{
                fontSize: "clamp(1.1rem, 3.6vw, 1.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.04em",
              }}
            >
              {slide.title}
            </h2>
            <p
              className="mt-0.5"
              style={{
                fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "-0.02em",
              }}
            >
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="btn-pill mt-2.5 h-7 px-3.5 text-[0.5rem] font-semibold"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 16 : 5,
              height: 5,
              background: i === active ? "#FFFFFF" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}