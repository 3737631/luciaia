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

export default function StoriesRow() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
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
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

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
        @keyframes gradientRotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes unseenRing {
          0% { box-shadow: 0 0 0 0 rgba(255,59,127,0.5); }
          70% { box-shadow: 0 0 0 6px rgba(255,59,127,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,59,127,0); }
        }
        .gradient-rotate {
          animation: gradientRotate 3s linear infinite;
        }
        .dot-online {
          animation: pulseDot 2s ease-in-out infinite;
        }
        .ring-new {
          animation: unseenRing 2s ease-out infinite;
        }
      `}</style>
      <div
        className="flex gap-4 overflow-x-auto px-4 sm:gap-5 sm:px-6 lg:px-8"
        style={{
          maxWidth: 1180,
          margin: "22px auto 0",
          paddingBottom: 12,
          scrollbarWidth: "none",
        }}
      >
        {girls.map((girl, i) => (
          <button
            key={girl.id}
            onMouseDown={() => handlePointerDown(i)}
            onMouseUp={() => handlePointerUp(i)}
            onMouseLeave={handlePointerLeave}
            onTouchStart={() => handlePointerDown(i)}
            onTouchEnd={() => handlePointerUp(i)}
            className="flex shrink-0 flex-col items-center text-white relative"
            style={{ width: 72, fontSize: 12 }}
          >
            <div
              className={`relative mx-auto mb-2 ${newStoryMap[girl.id] ? "ring-new" : ""}`}
              style={{
                width: 66,
                height: 66,
                padding: 3,
                borderRadius: "50%",
                background: onlineMap[girl.id]
                  ? "linear-gradient(135deg, #ff3b7f, #ff0f70, #ff7a3d)"
                  : "rgba(255,255,255,0.15)",
                transition: "transform 0.22s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {onlineMap[girl.id] && (
                <div
                  className="dot-online absolute -bottom-[1px] -right-[1px] z-10 h-3.5 w-3.5 rounded-full border-[2.5px]"
                  style={{ borderColor: "#0b0b0f", background: "#31c24d", boxShadow: "0 0 8px rgba(49,194,77,0.7)" }}
                />
              )}
              {newStoryMap[girl.id] && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: "0 0 0 0 rgba(255,59,127,0.5)" }}
                />
              )}
              <img
                src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                alt={girl.name}
                className="h-full w-full rounded-full object-cover"
                style={{ border: "2px solid #0b0b0f", background: "#222" }}
              />
            </div>
            <span className="max-w-[66px] truncate text-center font-bold text-white/80">
              {girl.name}
            </span>
          </button>
        ))}
      </div>

      {previewIndex !== null && (
        <div
          className="fixed z-50"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: 160, border: "2px solid rgba(255,255,255,0.15)" }}
          >
            <img
              src={getGirlImage(girls[previewIndex].id, girls[previewIndex].defaultHair, girls[previewIndex].defaultPose, girls[previewIndex].defaultBackground)}
              alt={girls[previewIndex].name}
              className="w-full object-cover"
              style={{ height: 200 }}
            />
            <div className="bg-black/80 px-3 py-2 text-center">
              <span className="text-sm font-bold text-white">{girls[previewIndex].name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stories Overlay */}
      {activeGirl && currentSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
          onClick={closeStories}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl"
            style={{ aspectRatio: "9/16", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full"
                  style={{
                    background: i < slideIdx
                      ? "#fff"
                      : i === slideIdx
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(255,255,255,0.15)",
                  }}
                >
                  {i === slideIdx && (
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Top bar */}
            <div className="absolute top-3 left-0 right-0 z-20 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full border-2 border-white/30 bg-cover bg-center"
                  style={{ backgroundImage: `url(${getGirlImage(activeGirl.id, activeGirl.defaultHair, activeGirl.defaultPose, activeGirl.defaultBackground)})` }}
                />
                <span className="text-sm font-bold text-white drop-shadow-lg">{activeGirl.name}</span>
              </div>
              <button
                onClick={closeStories}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Story image */}
            <img
              src={getGirlImage(activeGirl.id, currentSlide.hair, currentSlide.pose, currentSlide.bg)}
              alt={activeGirl.name}
              className="h-full w-full object-cover"
            />

            {/* Location label */}
            <div className="absolute top-14 left-3 z-20">
              <span className="rounded-full bg-black/50 px-3 py-1 text-[0.55rem] font-semibold text-white/90 backdrop-blur-sm">
                {currentSlide.label}
              </span>
            </div>

            {/* Gradient bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-16">
              <p className="mb-3 text-center text-sm leading-relaxed text-white/90 drop-shadow-lg">
                {activeGirl.story}
              </p>
              <Link
                href={`/chat/${activeGirl.id}`}
                onClick={closeStories}
                className="btn-primary flex h-11 w-full items-center justify-center text-sm font-bold"
              >
                Chatear con {activeGirl.name}
              </Link>
            </div>

            {/* Tap zones */}
            <button
              className="absolute top-0 bottom-0 left-0 z-10 w-1/2"
              onClick={goPrev}
            />
            <button
              className="absolute top-0 bottom-0 right-0 z-10 w-1/2"
              onClick={goNext}
            />
          </div>
        </div>
      )}
    </>
  );
}
