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

export default function StoriesRow() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const [onlineMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    girls.forEach((g) => { m[g.id] = Math.random() < 0.6; });
    return m;
  });

  const [seenMap, setSeenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("stories_seen");
    if (saved) setSeenMap(JSON.parse(saved));
  }, []);

  const progressVal = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const activeIndexRef = useRef<number | null>(null);
  const slideIdxRef = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { slideIdxRef.current = slideIdx; }, [slideIdx]);

  const persistSeen = useCallback((id: string) => {
    setSeenMap((prev) => {
      const next = { ...prev, [id]: true };
      localStorage.setItem("stories_seen", JSON.stringify(next));
      return next;
    });
  }, []);

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
          persistSeen(girls[gi].id);
          const ng = gi + 1;
          setActiveIndex(ng);
          activeIndexRef.current = ng;
          setSlideIdx(0);
          slideIdxRef.current = 0;
          startTimer();
        } else {
          persistSeen(girls[gi].id);
          setActiveIndex(null);
          activeIndexRef.current = null;
        }
      }
    }, 60);
  }, [clearTimer, persistSeen]);

  const openStory = useCallback((idx: number) => {
    setActiveIndex(idx);
    activeIndexRef.current = idx;
    setSlideIdx(0);
    slideIdxRef.current = 0;
    startTimer();
  }, [startTimer]);

  const closeStories = useCallback(() => {
    if (activeIndexRef.current !== null) {
      persistSeen(girls[activeIndexRef.current].id);
    }
    clearTimer();
    setActiveIndex(null);
    activeIndexRef.current = null;
    setSlideIdx(0);
    slideIdxRef.current = 0;
    setProgress(0);
  }, [clearTimer, persistSeen]);

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
      persistSeen(girls[gi].id);
      const ng = gi + 1;
      setActiveIndex(ng);
      activeIndexRef.current = ng;
      setSlideIdx(0);
      slideIdxRef.current = 0;
    } else {
      persistSeen(girls[gi].id);
      closeStories();
      return;
    }
    startTimer();
  }, [clearTimer, startTimer, closeStories, persistSeen]);

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

  function handlePointerDown(i: number) {
    longPressTimer.current = setTimeout(() => {
      setPreviewIndex(i);
      setTimeout(() => {
        setPreviewIndex(null);
        openStory(i);
      }, 800);
    }, 500);
  }

  function handlePointerUp(i: number) {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
    if (previewIndex !== null) {
      setPreviewIndex(null);
    } else {
      openStory(i);
    }
  }

  function handlePointerLeave() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
    setPreviewIndex(null);
  }

  return (
    <>
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,60,136,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(255,60,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,60,136,0); }
        }
        .story-avatar-online { animation: dotPulse 2s ease-in-out infinite; }
        .story-ring-unseen { animation: ringPulse 2s ease-out infinite; }
        .story-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        className="story-scrollbar flex gap-4 overflow-x-auto sm:gap-5"
        style={{
          maxWidth: 1180,
          margin: "24px auto 0",
          padding: "0 16px 12px",
          scrollbarWidth: "none",
        }}
      >
        {girls.map((girl, i) => {
          const seen = seenMap[girl.id];
          const online = onlineMap[girl.id];

          return (
            <button
              key={girl.id}
              onMouseDown={() => handlePointerDown(i)}
              onMouseUp={() => handlePointerUp(i)}
              onMouseLeave={handlePointerLeave}
              onTouchStart={() => handlePointerDown(i)}
              onTouchEnd={() => handlePointerUp(i)}
              className="group shrink-0 text-center text-white transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ width: 70 }}
            >
              <div className="relative mx-auto mb-2" style={{ width: 64, height: 64 }}>
                {/* Ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    seen
                      ? "opacity-30"
                      : online
                        ? "story-ring-unseen"
                        : ""
                  }`}
                  style={{
                    padding: 3,
                    background: seen
                      ? "rgba(255,255,255,0.12)"
                      : "linear-gradient(135deg, #FF3C88, #FF6B3D)",
                    WebkitMask: "radial-gradient(circle at 50% 50%, transparent 26px, #000 26px)",
                    mask: "radial-gradient(circle at 50% 50%, transparent 26px, #000 26px)",
                  }}
                />

                {/* Avatar */}
                <div
                  className={`absolute inset-0 rounded-full overflow-hidden ${
                    seen ? "opacity-60 saturate-0" : ""
                  }`}
                  style={{ margin: 3, transition: "opacity 0.3s, filter 0.3s" }}
                >
                  <img
                    src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                    alt={girl.name}
                    className="h-full w-full rounded-full object-cover"
                    style={{ background: "#1A1A22" }}
                  />
                </div>

                {/* Online dot */}
                {online && !seen && (
                  <span
                    className="story-avatar-online absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full border-[2.5px]"
                    style={{
                      borderColor: "#0B0B0F",
                      background: "#30D158",
                      boxShadow: "0 0 10px rgba(48,209,88,0.7)",
                    }}
                  />
                )}
              </div>
              <span
                className={`block max-w-[64px] truncate text-xs font-semibold transition-colors duration-300 ${
                  seen ? "text-white/30" : "text-white/80"
                }`}
              >
                {girl.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview popup */}
      {previewIndex !== null && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            style={{ width: 160, border: "2px solid rgba(255,255,255,0.1)" }}
          >
            <img
              src={getGirlImage(girls[previewIndex].id, girls[previewIndex].defaultHair, girls[previewIndex].defaultPose, girls[previewIndex].defaultBackground)}
              alt={girls[previewIndex].name}
              className="w-full object-cover"
              style={{ height: 200 }}
            />
            <div className="bg-[#121218] px-3 py-2 text-center">
              <span className="text-sm font-bold text-white">{girls[previewIndex].name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stories overlay */}
      {activeGirl && currentSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(24px)" }}
          onClick={closeStories}
        >
          <div
            className="relative w-full overflow-hidden rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            style={{ aspectRatio: "9/16", maxHeight: "90vh", maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  {i === slideIdx && (
                    <div
                      className="h-full rounded-full bg-white transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  {i < slideIdx && (
                    <div className="h-full w-full rounded-full bg-white" />
                  )}
                </div>
              ))}
            </div>

            {/* Top bar */}
            <div className="absolute top-3 left-0 right-0 z-20 flex items-center justify-between px-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-9 w-9 rounded-full border-2 border-white/30 bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url(${getGirlImage(activeGirl.id, activeGirl.defaultHair, activeGirl.defaultPose, activeGirl.defaultBackground)})` }}
                />
                <div>
                  <span className="block text-sm font-bold text-white drop-shadow-lg">{activeGirl.name}</span>
                  <span className="text-[0.5rem] text-white/50">{currentSlide.label}</span>
                </div>
              </div>
              <button
                onClick={closeStories}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white active:scale-90"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Image */}
            <img
              src={getGirlImage(activeGirl.id, currentSlide.hair, currentSlide.pose, currentSlide.bg)}
              alt={activeGirl.name}
              className="h-full w-full object-cover"
            />

            {/* Gradient + CTA */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-16">
              <p className="mb-4 text-center text-sm leading-relaxed text-white/80 drop-shadow-lg line-clamp-3">
                {activeGirl.story}
              </p>
              <Link
                href={`/chat/${activeGirl.id}`}
                onClick={closeStories}
                className="btn-primary flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold shadow-[0_0_24px_rgba(255,60,136,0.3)]"
              >
                Chatear con {activeGirl.name}
              </Link>
            </div>

            {/* Tap zones */}
            <button className="absolute top-0 bottom-0 left-0 z-10 w-1/2" onClick={goPrev} />
            <button className="absolute top-0 bottom-0 right-0 z-10 w-1/2" onClick={goNext} />
          </div>
        </div>
      )}
    </>
  );
}
