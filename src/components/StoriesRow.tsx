"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

interface StorySlide {
  hair: string;
  pose: string;
  bg: string;
  label: string;
}

const FALLBACK_ALL_SLIDES: Record<string, StorySlide[]> = {
  axel: [
    { hair: "cafe", pose: "ropa", bg: "studio", label: "Gimnasio vacío" },
    { hair: "negro", pose: "casual", bg: "car-night", label: "Después del entrenamiento" },
  ],
  liam: [
    { hair: "negro", pose: "casual", bg: "neon-room", label: "Noche de pelis" },
    { hair: "cafe", pose: "ropa", bg: "studio", label: "Relajado" },
  ],
  sakura: [
    { hair: "rosa", pose: "bata", bg: "studio", label: "Dimensión mágica" },
    { hair: "azul", pose: "tanga", bg: "neon-room", label: "Portal estelar" },
  ],
  yumi: [
    { hair: "azul", pose: "bata", bg: "neon-room", label: "Noche de mimos" },
    { hair: "rosa", pose: "tanga", bg: "studio", label: "Jugando" },
  ],
  rin: [
    { hair: "negro", pose: "ropa", bg: "studio", label: "Después de clase" },
    { hair: "moreno", pose: "casual", bg: "neon-room", label: "Fin de semana" },
  ],
};

const ALL_SLIDES: Record<string, StorySlide[]> = { ...FALLBACK_ALL_SLIDES,
  luna: [
    { hair: "moreno", pose: "tanga", bg: "car-night", label: "De noche en el coche" },
    { hair: "pelirrojo", pose: "bata", bg: "neon-room", label: "En mi cuarto" },
    { hair: "moreno", pose: "estrellas", bg: "studio", label: "Sesión de fotos" },
  ],
  nia: [
    { hair: "rosa", pose: "tanga", bg: "studio", label: "Streaming setup" },
    { hair: "moreno", pose: "bata", bg: "neon-room", label: "After game" },
  ],
  vera: [
    { hair: "pelirrojo", pose: "tanga", bg: "neon-room", label: "Noche de vino" },
    { hair: "rubio", pose: "estrellas", bg: "car-night", label: "Paseo nocturno" },
    { hair: "moreno", pose: "bata", bg: "studio", label: "En casa" },
  ],
  alma: [
    { hair: "moreno", pose: "tanga", bg: "beach-night", label: "Playa de noche" },
    { hair: "rubio", pose: "bata", bg: "neon-room", label: "Saliendo" },
  ],
  kira: [
    { hair: "rosa", pose: "tanga", bg: "neon-room", label: "Virtual" },
    { hair: "pelirrojo", pose: "bata", bg: "studio", label: "Conexión" },
    { hair: "moreno", pose: "estrellas", bg: "car-night", label: "Fuera de línea" },
  ],
  maya: [
    { hair: "rubio", pose: "tanga", bg: "car-night", label: "After party" },
    { hair: "moreno", pose: "bata", bg: "studio", label: "Backstage" },
  ],
  sasha: [
    { hair: "moreno", pose: "tanga", bg: "neon-room", label: "Saliendo" },
    { hair: "rubio", pose: "estrellas", bg: "car-night", label: "De fiesta" },
    { hair: "pelirrojo", pose: "bata", bg: "studio", label: "En casa" },
  ],
  yuki: [
    { hair: "moreno", pose: "estrellas", bg: "neon-room", label: "En mi cuarto" },
    { hair: "rosa", pose: "bata", bg: "studio", label: "Tímida" },
  ],
};

function shouldBeOnline(): boolean {
  return Math.random() < 0.6;
}

function hasNewStory(): boolean {
  return Math.random() < 0.35;
}

export default function StoriesRow({ ringSize = 86 }: { ringSize?: number }) {
  const innerSize = ringSize - 8;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [onlineMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    girls.forEach((g) => { m[g.id] = shouldBeOnline(); });
    return m;
  });
  const [newStoryMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    girls.forEach((g) => { m[g.id] = hasNewStory(); });
    return m;
  });

  const progressVal = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const activeIndexRef = useRef<number | null>(null);
  const slideIdxRef = useRef(0);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { slideIdxRef.current = slideIdx; }, [slideIdx]);

  const clearTimer = useCallback(() => {
    clearInterval(timer.current);
    timer.current = undefined;
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    progressVal.current = 0;
    setProgress(0);
    timer.current = setInterval(() => {
      progressVal.current += 1;
      setProgress(progressVal.current);
      if (progressVal.current >= 100) {
        clearTimer();
        const gi = activeIndexRef.current;
        if (gi === null) return;
        const slides = ALL_SLIDES[girls[gi].id] || [];
        const si = slideIdxRef.current;
        if (si < slides.length - 1) {
          setSlideIdx(si + 1);
          slideIdxRef.current = si + 1;
          startTimer();
        } else if (gi < girls.length - 1) {
          const ng = gi + 1;
          setActiveIndex(ng);
          activeIndexRef.current = ng;
          setSlideIdx(0);
          slideIdxRef.current = 0;
          startTimer();
        } else {
          setActiveIndex(null);
          activeIndexRef.current = null;
        }
      }
    }, 60);
  }, [clearTimer]);

  const openStory = useCallback((idx: number) => {
    setActiveIndex(idx);
    activeIndexRef.current = idx;
    setSlideIdx(0);
    slideIdxRef.current = 0;
    startTimer();
  }, [startTimer]);

  const closeStories = useCallback(() => {
    clearTimer();
    setActiveIndex(null);
    activeIndexRef.current = null;
    setSlideIdx(0);
    slideIdxRef.current = 0;
    setProgress(0);
  }, [clearTimer]);

  const goNext = useCallback(() => {
    const gi = activeIndexRef.current;
    if (gi === null) return;
    clearTimer();
    const slides = ALL_SLIDES[girls[gi].id] || [];
    const si = slideIdxRef.current;
    if (si < slides.length - 1) {
      setSlideIdx(si + 1);
      slideIdxRef.current = si + 1;
    } else if (gi < girls.length - 1) {
      setActiveIndex(gi + 1);
      activeIndexRef.current = gi + 1;
      setSlideIdx(0);
      slideIdxRef.current = 0;
    } else {
      closeStories();
      return;
    }
    startTimer();
  }, [clearTimer, startTimer, closeStories]);

  const goPrev = useCallback(() => {
    const gi = activeIndexRef.current;
    if (gi === null) return;
    clearTimer();
    const si = slideIdxRef.current;
    if (si > 0) {
      setSlideIdx(si - 1);
      slideIdxRef.current = si - 1;
    } else if (gi > 0) {
      const ng = gi - 1;
      const prevSlides = ALL_SLIDES[girls[ng].id] || [];
      setActiveIndex(ng);
      activeIndexRef.current = ng;
      setSlideIdx(prevSlides.length - 1);
      slideIdxRef.current = prevSlides.length - 1;
    } else {
      closeStories();
      return;
    }
    startTimer();
  }, [clearTimer, startTimer, closeStories]);

  useEffect(() => clearTimer, [clearTimer]);

  const activeGirl = activeIndex !== null ? girls[activeIndex] : null;
  const slides = activeGirl ? (ALL_SLIDES[activeGirl.id] || []) : [];
  const currentSlide = slides[slideIdx];

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        .dot-online { animation: pulseDot 2s ease-in-out infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 sm:gap-4 sm:px-6 scrollbar-none snap-x snap-mandatory"
        style={{ paddingTop: 16, paddingBottom: 8 }}
      >
        {/* Crear button - first item */}
        <Link
          href="/customize/luna"
          className="flex shrink-0 flex-col items-center gap-1.5 snap-start"
          style={{ width: ringSize + 2 }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: ringSize,
              height: ringSize,
              background: "linear-gradient(135deg, #ff3b7f, #8b5cf6)",
              padding: 3,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: innerSize,
                height: innerSize,
                background: "#171717",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: innerSize - 6,
                  height: innerSize - 6,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
          </div>
          <span className="font-medium text-white/40" style={{ fontSize: 11 }}>Crear</span>
        </Link>

        {girls.map((girl, i) => {
          const online = onlineMap[girl.id];
          const hasNew = newStoryMap[girl.id];

          return (
            <button
              key={girl.id}
              onClick={() => openStory(i)}
              className="flex shrink-0 flex-col items-center gap-1.5 snap-start"
              style={{ width: ringSize + 2 }}
            >
              <div className="relative" style={{ width: ringSize, height: ringSize }}>
                {online && (
                  <div
                    className="dot-online absolute -bottom-[1px] -right-[1px] z-10 h-3.5 w-3.5 rounded-full border-[2.5px]"
                    style={{ borderColor: "#171717", background: "#31c24d" }}
                  />
                )}
                <div
                  className="flex h-full w-full items-center justify-center rounded-full"
                  style={{
                    padding: 3,
                    background: hasNew
                      ? "linear-gradient(135deg, #ff3b7f, #a855f7)"
                      : "rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    className="h-full w-full overflow-hidden rounded-full"
                    style={{ border: "2.5px solid #171717" }}
                  >
                    <img
                      src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                      alt={girl.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                </div>
              </div>
              <span className="max-w-[80px] truncate text-center font-medium text-white/50" style={{ fontSize: 11 }}>
                {girl.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stories Viewer - full overlay */}
      {activeGirl && currentSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.94)" }}
          onClick={closeStories}
        >
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "9/16", maxHeight: "95vh", maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: i <= slideIdx ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)" }}
                >
                  {i === slideIdx && (
                    <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
                  )}
                </div>
              ))}
            </div>

            {/* Top bar */}
            <div className="absolute top-3 left-0 right-0 z-20 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-full border border-white/20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${getGirlImage(activeGirl.id, activeGirl.defaultHair, activeGirl.defaultPose, activeGirl.defaultBackground)})` }}
                />
                <span className="text-xs font-semibold text-white">{activeGirl.name}</span>
              </div>
              <button
                onClick={closeStories}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/60"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <img
              src={getGirlImage(activeGirl.id, currentSlide.hair, currentSlide.pose, currentSlide.bg)}
              alt={activeGirl.name}
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />

            <div className="absolute top-12 left-3 z-20">
              <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[0.45rem] font-medium text-white/80">
                {currentSlide.label}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 pt-14">
              <p className="mb-3 text-center text-xs leading-relaxed text-white/80">
                {activeGirl.story}
              </p>
              <Link
                href={`/chat/${activeGirl.id}`}
                onClick={closeStories}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Chatear con {activeGirl.name}
              </Link>
            </div>

            <button className="absolute top-0 bottom-0 left-0 z-10 w-1/2" onClick={goPrev} />
            <button className="absolute top-0 bottom-0 right-0 z-10 w-1/2" onClick={goNext} />
          </div>
        </div>
      )}
    </>
  );
}
