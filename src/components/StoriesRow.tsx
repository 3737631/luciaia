"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

interface StorySlide { hair: string; pose: string; bg: string; label: string; }

const ALL_SLIDES: Record<string, StorySlide[]> = {
  axel: [{ hair: "cafe", pose: "ropa", bg: "studio", label: "Gimnasio vacío" }, { hair: "negro", pose: "casual", bg: "car-night", label: "Después del entrenamiento" }],
  liam: [{ hair: "negro", pose: "casual", bg: "neon-room", label: "Noche de pelis" }, { hair: "cafe", pose: "ropa", bg: "studio", label: "Relajado" }],
  sakura: [{ hair: "rosa", pose: "bata", bg: "studio", label: "Dimensión mágica" }, { hair: "azul", pose: "tanga", bg: "neon-room", label: "Portal estelar" }],
  yumi: [{ hair: "azul", pose: "bata", bg: "neon-room", label: "Noche de mimos" }, { hair: "rosa", pose: "tanga", bg: "studio", label: "Jugando" }],
  rin: [{ hair: "negro", pose: "ropa", bg: "studio", label: "Después de clase" }, { hair: "moreno", pose: "casual", bg: "neon-room", label: "Fin de semana" }],
  luna: [{ hair: "moreno", pose: "tanga", bg: "car-night", label: "De noche en el coche" }, { hair: "pelirrojo", pose: "bata", bg: "neon-room", label: "En mi cuarto" }, { hair: "moreno", pose: "estrellas", bg: "studio", label: "Sesión de fotos" }],
  nia: [{ hair: "rosa", pose: "tanga", bg: "studio", label: "Streaming setup" }, { hair: "moreno", pose: "bata", bg: "neon-room", label: "After game" }],
  vera: [{ hair: "pelirrojo", pose: "tanga", bg: "neon-room", label: "Noche de vino" }, { hair: "rubio", pose: "estrellas", bg: "car-night", label: "Paseo nocturno" }, { hair: "moreno", pose: "bata", bg: "studio", label: "En casa" }],
  alma: [{ hair: "moreno", pose: "tanga", bg: "beach-night", label: "Playa de noche" }, { hair: "rubio", pose: "bata", bg: "neon-room", label: "Saliendo" }],
  kira: [{ hair: "rosa", pose: "tanga", bg: "neon-room", label: "Virtual" }, { hair: "pelirrojo", pose: "bata", bg: "studio", label: "Conexión" }, { hair: "moreno", pose: "estrellas", bg: "car-night", label: "Fuera de línea" }],
  maya: [{ hair: "rubio", pose: "tanga", bg: "car-night", label: "After party" }, { hair: "moreno", pose: "bata", bg: "studio", label: "Backstage" }],
  sasha: [{ hair: "moreno", pose: "tanga", bg: "neon-room", label: "Saliendo" }, { hair: "rubio", pose: "estrellas", bg: "car-night", label: "De fiesta" }, { hair: "pelirrojo", pose: "bata", bg: "studio", label: "En casa" }],
  yuki: [{ hair: "moreno", pose: "estrellas", bg: "neon-room", label: "En mi cuarto" }, { hair: "rosa", pose: "bata", bg: "studio", label: "Tímida" }],
};

export default function StoriesRow() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [onlineMap] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    girls.forEach((g) => { m[g.id] = Math.random() < 0.5; });
    return m;
  });

  const progressVal = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const activeIndexRef = useRef<number | null>(null);
  const slideIdxRef = useRef(0);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { slideIdxRef.current = slideIdx; }, [slideIdx]);

  const clearTimer = useCallback(() => { clearInterval(timer.current); timer.current = undefined; }, []);
  const startTimer = useCallback(() => {
    clearTimer(); progressVal.current = 0; setProgress(0);
    timer.current = setInterval(() => {
      progressVal.current += 1; setProgress(progressVal.current);
      if (progressVal.current >= 100) {
        clearTimer(); const gi = activeIndexRef.current; if (gi === null) return;
        const slides = ALL_SLIDES[girls[gi].id] || []; const si = slideIdxRef.current;
        if (si < slides.length - 1) { setSlideIdx(si + 1); slideIdxRef.current = si + 1; startTimer(); }
        else if (gi < girls.length - 1) { const ng = gi + 1; setActiveIndex(ng); activeIndexRef.current = ng; setSlideIdx(0); slideIdxRef.current = 0; startTimer(); }
        else { setActiveIndex(null); activeIndexRef.current = null; }
      }
    }, 60);
  }, [clearTimer]);

  const openStory = useCallback((idx: number) => { setActiveIndex(idx); activeIndexRef.current = idx; setSlideIdx(0); slideIdxRef.current = 0; startTimer(); }, [startTimer]);
  const closeStories = useCallback(() => { clearTimer(); setActiveIndex(null); activeIndexRef.current = null; setSlideIdx(0); slideIdxRef.current = 0; setProgress(0); }, [clearTimer]);
  const goNext = useCallback(() => {
    const gi = activeIndexRef.current; if (gi === null) return; clearTimer();
    const slides = ALL_SLIDES[girls[gi].id] || []; const si = slideIdxRef.current;
    if (si < slides.length - 1) { setSlideIdx(si + 1); slideIdxRef.current = si + 1; }
    else if (gi < girls.length - 1) { const ng = gi + 1; setActiveIndex(ng); activeIndexRef.current = ng; setSlideIdx(0); slideIdxRef.current = 0; }
    else { closeStories(); return; }
    startTimer();
  }, [clearTimer, startTimer, closeStories]);
  const goPrev = useCallback(() => {
    const gi = activeIndexRef.current; if (gi === null) return; clearTimer(); const si = slideIdxRef.current;
    if (si > 0) { setSlideIdx(si - 1); slideIdxRef.current = si - 1; }
    else if (gi > 0) { const ng = gi - 1; const prevSlides = ALL_SLIDES[girls[ng].id] || []; setActiveIndex(ng); activeIndexRef.current = ng; setSlideIdx(prevSlides.length - 1); slideIdxRef.current = prevSlides.length - 1; }
    else { closeStories(); return; }
    startTimer();
  }, [clearTimer, startTimer, closeStories]);
  useEffect(() => clearTimer, [clearTimer]);

  const activeGirl = activeIndex !== null ? girls[activeIndex] : null;
  const slides = activeGirl ? (ALL_SLIDES[activeGirl.id] || []) : [];
  const currentSlide = slides[slideIdx];

  return (
    <>
      <div className="flex gap-3.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {girls.map((girl, i) => {
          const online = onlineMap[girl.id];
          return (
            <button key={girl.id} onClick={() => openStory(i)} className="shrink-0 text-center transition-all active:scale-90" style={{ width: 54 }}>
              <div className="relative mx-auto" style={{ width: 48, height: 48 }}>
                <div className="absolute inset-0 rounded-full" style={{ padding: 1.5, background: "linear-gradient(135deg, #FF2D7F, #FF5A4F)" }}>
                  <div className="h-full w-full rounded-full" style={{ background: "#000" }} />
                </div>
                <div className="absolute inset-0 overflow-hidden rounded-full" style={{ margin: 2 }}>
                  <img
                    src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                    alt={girl.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {online && (
                  <span className="absolute -bottom-px -right-px z-10 h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: "#000", background: "#30D158" }} />
                )}
              </div>
              <span className="block mt-0.5 truncate text-[0.5rem] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                {girl.name}
              </span>
            </button>
          );
        })}
      </div>

      {activeGirl && currentSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(30px)" }} onClick={closeStories}>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "90vh", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
              {slides.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  {i === slideIdx && <div className="h-full rounded-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />}
                  {i < slideIdx && <div className="h-full w-full rounded-full bg-white/40" />}
                </div>
              ))}
            </div>
            <div className="absolute top-3 left-0 right-0 z-20 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-cover bg-center border" style={{ borderColor: "rgba(255,255,255,0.15)", backgroundImage: `url(${getGirlImage(activeGirl.id, activeGirl.defaultHair, activeGirl.defaultPose, activeGirl.defaultBackground)})` }} />
                <span className="text-sm font-semibold drop-shadow-lg">{activeGirl.name}</span>
              </div>
              <button onClick={closeStories} className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.5)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <img src={getGirlImage(activeGirl.id, currentSlide.hair, currentSlide.pose, currentSlide.bg)} alt={activeGirl.name} className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12">
              <Link href={`/chat/${activeGirl.id}`} onClick={closeStories} className="btn-pill h-8 w-full text-xs font-semibold rounded-lg">
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