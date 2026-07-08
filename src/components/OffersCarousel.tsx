"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const offers = [
  {
    name: "Gratis",
    price: "0€",
    badge: "Gratis",
    badgeType: "muted",
    description: "Prueba el chat y descubre los personajes.",
    features: ["Chat básico", "Personajes limitados", "Historias públicas"],
    buttonText: "Empezar gratis",
    primary: false,
  },
  {
    name: "Premium semanal",
    price: "4,99€",
    badge: "Oferta rápida",
    badgeType: "normal",
    description: "Ideal para probar todo sin compromiso.",
    features: ["Chat ilimitado", "Roleplay avanzado", "Personalización básica", "Acceso a historias privadas"],
    buttonText: "Probar premium",
    primary: true,
  },
  {
    name: "Premium mensual",
    price: "14,99€",
    badge: "Más popular",
    badgeType: "hot",
    description: "La experiencia completa de NuviaChat.",
    features: ["Chat ilimitado", "Videollamada simulada", "Personalización completa", "Respuestas más largas", "Nuevos personajes antes"],
    buttonText: "Elegir mensual",
    primary: true,
  },
  {
    name: "Premium anual",
    price: "79,99€",
    badge: "Ahorra 55%",
    badgeType: "save",
    description: "Para usar NuviaChat todo el año al mejor precio.",
    features: ["Todo lo del mensual", "Mejor precio", "Acceso prioritario", "Contenido exclusivo"],
    buttonText: "Elegir anual",
    primary: true,
  },
];

function badgeStyles(type: string) {
  switch (type) {
    case "hot":
      return "bg-gradient-to-r from-pink to-[#ffd166]";
    case "save":
      return "bg-gradient-to-r from-green to-orange";
    case "muted":
      return "bg-white/[0.10] border border-white/[0.12]";
    default:
      return "bg-gradient-to-r from-pink to-orange";
  }
}

export default function OffersCarousel() {
  const [active, setActive] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const len = offers.length;
  const getPrev = useCallback(() => (active - 1 + len) % len, [active, len]);
  const getNext = useCallback(() => (active + 1) % len, [active, len]);

  function goTo(i: number) {
    setActive(i);
    resetAutoplay();
  }

  function next() {
    setActive(getNext());
  }

  function prev() {
    setActive(getPrev());
  }

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
  }, [active]);

  function cardTransform(index: number): React.CSSProperties {
    if (index === active) {
      return {
        transform: "translateX(-50%) scale(1)",
        opacity: 1,
        zIndex: 5,
        pointerEvents: "auto",
        borderColor: "rgba(255, 43, 134, 0.62)",
        boxShadow: "0 26px 90px rgba(0,0,0,0.58), 0 0 60px rgba(255, 43, 134, 0.18)",
      };
    }
    if (index === getPrev()) {
      return {
        transform: `translateX(calc(-50% - min(310px, 54vw))) scale(0.84) rotateY(8deg)`,
        opacity: 0.55,
        zIndex: 3,
        filter: "saturate(0.85)",
        pointerEvents: "none",
      };
    }
    if (index === getNext()) {
      return {
        transform: `translateX(calc(-50% + min(310px, 54vw))) scale(0.84) rotateY(-8deg)`,
        opacity: 0.55,
        zIndex: 3,
        filter: "saturate(0.85)",
        pointerEvents: "none",
      };
    }
    return {
      transform: "translateX(-50%) scale(0.7)",
      opacity: 0,
      zIndex: 1,
      pointerEvents: "none",
    };
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    stopAutoplay();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (diff > 45) prev();
    if (diff < -45) next();
    setIsDragging(false);
    resetAutoplay();
  };

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-16"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(255, 43, 134, 0.18), transparent 34%), radial-gradient(circle at 80% 20%, rgba(255, 122, 61, 0.14), transparent 30%), #07070b",
      }}
    >
      <div
        className="pointer-events-none absolute inset-auto bottom-0 left-[10%] right-[10%] h-[180px]"
        style={{
          background: "linear-gradient(90deg, rgba(255, 43, 134, 0.18), rgba(255, 122, 61, 0.14))",
          filter: "blur(70px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[760px] text-center" style={{ marginBottom: 32 }}>
        <span className="mb-3 inline-flex rounded-full border border-white/[0.14] bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          Oferta especial
        </span>
        <h2 className="text-white" style={{ fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "-0.05em" }}>
          Elige cómo quieres vivir NuviaChat
        </h2>
        <p className="mx-auto mt-3 max-w-[580px] leading-relaxed text-white/60">
          Desbloquea chats ilimitados, personalización y experiencias premium con personajes IA ficticios.
        </p>
      </div>

      <div
        ref={carouselRef}
        className="relative z-10 mx-auto"
        style={{ maxWidth: 1180 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setIsDragging(false)}
      >
        {/* Arrows */}
        <button
          onClick={() => { prev(); resetAutoplay(); }}
          className="absolute left-1 top-[44%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] text-3xl text-white backdrop-blur-lg transition hover:bg-white/[0.12] sm:flex"
          style={{ lineHeight: 1 }}
          aria-label="Oferta anterior"
        >
          ‹
        </button>
        <button
          onClick={() => { next(); resetAutoplay(); }}
          className="absolute right-1 top-[44%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] text-3xl text-white backdrop-blur-lg transition hover:bg-white/[0.12] sm:flex"
          style={{ lineHeight: 1 }}
          aria-label="Siguiente oferta"
        >
          ›
        </button>

        {/* Track */}
        <div className="relative" style={{ height: 490, perspective: 1200 }}>
          {offers.map((offer, i) => (
            <article
              key={i}
              className="absolute left-1/2 top-6 w-[78vw] min-w-0 rounded-[28px] p-5 text-white sm:w-[340px] sm:p-6"
              style={{
                minHeight: 400,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045)), rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                backdropFilter: "blur(22px)",
                transition: "transform 0.45s ease, opacity 0.45s ease, border-color 0.45s ease, filter 0.45s ease, box-shadow 0.45s ease",
                ...cardTransform(i),
              }}
            >
              <span className={`mb-4 inline-flex rounded-full px-2.5 py-1.5 text-[0.65rem] font-bold text-white sm:text-xs ${badgeStyles(offer.badgeType)}`}>
                {offer.badge}
              </span>
              <h3 className="mb-2 text-2xl font-bold tracking-tight sm:text-[26px]" style={{ letterSpacing: "-0.04em" }}>
                {offer.name}
              </h3>
              <div
                className="mb-3 text-4xl font-extrabold sm:text-[42px]"
                style={{
                  letterSpacing: "-0.06em",
                  background: "linear-gradient(90deg, #fff, #ffb4d4)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {offer.price}
              </div>
              <p className="text-sm leading-relaxed text-white/60 sm:text-base">{offer.description}</p>
              <ul className="mb-5 mt-4 grid gap-2 sm:mb-6 sm:mt-[18px] sm:gap-[9px]">
                {offer.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                    <span className="shrink-0 font-extrabold text-green">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`flex h-11 w-full items-center justify-center rounded-full text-sm font-bold text-white transition active:scale-[0.97] ${
                  offer.primary
                    ? "bg-gradient-to-r from-pink to-orange shadow-[0_16px_42px_rgba(255,43,134,0.28)]"
                    : "border border-white/[0.14] bg-white/[0.09]"
                }`}
              >
                {offer.buttonText}
              </button>
            </article>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-2 flex justify-center gap-2">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full border-0 transition-all duration-200 ${
                i === active
                  ? "w-[26px] bg-gradient-to-r from-pink to-orange"
                  : "w-2 bg-white/30"
              }`}
              aria-label={`Ver oferta ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
