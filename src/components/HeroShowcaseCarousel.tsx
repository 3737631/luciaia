"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    id: 0,
    title: "1\u00aa Semana Gratis",
    subtitle: "Sin compromiso ni tarjeta",
    cta: "Comenzar",
    href: "#personajes",
  },
  {
    id: 1,
    title: "Crea tu roleplay",
    subtitle: "Describe la escena que imaginas",
    cta: "Crear",
    href: "#personajes",
  },
  {
    id: 2,
    title: "Chicas en vivo",
    subtitle: "Conecta en tiempo real",
    cta: "Probar",
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
        height: "clamp(145px, 28vw, 170px)",
        borderRadius: 18,
        background: "radial-gradient(circle at 20% 20%, rgba(255,59,127,0.2), transparent 30%), linear-gradient(135deg, #18141F 0%, #25131B 45%, #111116 100%)",
        border: "0.5px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 flex items-center px-5"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: i === active ? "auto" : "none",
          }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,11,15,0.6) 0%, rgba(11,11,15,0.15) 60%, rgba(11,11,15,0.3) 100%)" }} />
          <div className="relative z-10 max-w-xs">
            <span
              className="inline-block rounded-full px-2 py-0.5 font-semibold mb-2"
              style={{
                background: "rgba(255,59,127,0.2)",
                color: "#FF3B7F",
                fontSize: "clamp(0.4rem, 1.2vw, 0.5rem)",
                letterSpacing: "0.04em",
              }}
            >
              EN VIVO
            </span>
            <h2
              className="text-white font-bold tracking-tight"
              style={{
                fontSize: "clamp(1.25rem, 5vw, 2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
              }}
            >
              {s.title}
            </h2>
            <p
              className="mt-0.5"
              style={{
                fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "-0.01em",
              }}
            >
              {s.subtitle}
            </p>
            <Link
              href={s.href}
              className="btn-pill mt-2.5"
              style={{ height: "clamp(28px, 3.5vw, 34px)", fontSize: "clamp(0.55rem, 1vw, 0.65rem)" }}
            >
              {s.cta}
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 14 : 4,
              height: 4,
              background: i === active ? "#fff" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}