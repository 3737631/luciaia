"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

interface StorySlide {
  prompt: string;
  seed: number;
}

const STORIES: Record<string, StorySlide[]> = {
  luna: [
    {
      seed: 9101,
      prompt:
        "mirror selfie of a stunning 22yo brunette woman in a bedroom, wearing a black lace bralette and high-waisted jeans, " +
        "holding smartphone in front of her face, mirror reflects her full body and the messy bed behind, " +
        "warm golden hour lighting through window, soft natural skin texture, visible pores, " +
        "photorealistic, ultra detailed skin, sharp focus, iPhone photo style, candid moment, " +
        "intimate atmosphere, beautiful face, perfect body proportions, all limbs visible"
    },
    {
      seed: 9102,
      prompt:
        "bathroom mirror selfie of a gorgeous 22yo brunette woman after shower, wearing only a white towel wrapped around her body, " +
        "steam on mirror partially obscuring reflection, phone held up, wet hair, droplets on skin, " +
        "soft vanity lighting, dewy skin, hyper realistic skin texture, natural beauty, " +
        "photorealistic, 8K detail, film grain, candid, intimate, full body reflection visible"
    },
    {
      seed: 9103,
      prompt:
        "full length mirror selfie of a beautiful 22yo dark-haired woman in a walk-in closet, wearing a slinky black dress, " +
        "high heels, taking a mirror selfie with phone, surrounded by clothes and shoe racks, " +
        "warm ambient lighting, photorealistic skin detail, soft subsurface scattering, " +
        "natural pose, elegant, confident, sharp focus, candid mirror photo style, all limbs visible"
    },
  ],
  nia: [
    {
      seed: 9201,
      prompt:
        "mirror selfie of a cute 20yo girl with pink hair in a gaming room, wearing a cropped white t-shirt and shorts, " +
        "RGB LED strips on walls reflecting in the mirror, phone in hand covering face, " +
        "full body in mirror reflection, gaming chair visible behind her, " +
        "photorealistic skin texture, visible pores, natural lighting with blue/pink ambient glow, " +
        "sharp focus, candid selfie style, detailed skin, teen girl next door look, all limbs visible"
    },
    {
      seed: 9202,
      prompt:
        "mirror selfie of a young woman with pink hair in a messy bedroom, sitting cross-legged on the floor in front of a mirror, " +
        "wearing baggy hoodie and thigh-high socks, phone in one hand, peace sign with other hand, " +
        "strand lights on wall behind her, cozy warm atmosphere, soft natural lighting, " +
        "hyper realistic skin texture, youthful glow, candid photo style, photorealistic, " +
        "all limbs visible, full body in reflection"
    },
  ],
  vera: [
    {
      seed: 9301,
      prompt:
        "mirror selfie of a mysterious 24yo redhead woman in a dimly lit hallway, leaning against the wall, " +
        "wearing a burgundy silk robe loosely tied, phone in hand partially hiding face, " +
        "full body reflection in an ornate floor mirror, moody lighting, shadows, " +
        "intense green eyes visible above phone, photorealistic skin texture, pores visible, " +
        "intimate atmosphere, sharp focus, film grain, candid, sensual but classy, all limbs visible"
    },
    {
      seed: 9302,
      prompt:
        "bathroom mirror selfie of a stunning redhead woman in her late 20s, wearing only a sheer black negligee, " +
        "leaning toward mirror, phone capturing reflection, soft candlelit bathroom, " +
        "steam creating atmospheric haze, wet hair, dewy glowing skin, " +
        "hyper realistic, detailed skin pores, subsurface scattering, intimate moody lighting, " +
        "photorealistic texture, 8K quality, sensual but tasteful, full body visible"
    },
    {
      seed: 9303,
      prompt:
        "full length mirror selfie of a gorgeous redhead woman in a luxury bedroom, wearing a satin cami and lace shorts, " +
        "posing naturally with phone in hand, her reflection shows hourglass figure, " +
        "soft morning light through curtains, warm tones, photorealistic skin detail, " +
        "visible skin texture, natural lighting, sharp focus, intimate candid moment, all limbs visible"
    },
  ],
  alma: [
    {
      seed: 9401,
      prompt:
        "mirror selfie of a beautiful 22yo Latina woman on a beach boardwalk at golden hour, wearing a white crochet cover-up, " +
        "phone in hand covering face, full body reflection in a large beachfront mirror, " +
        "ocean sunset behind her in the mirror reflection, warm golden light, " +
        "photorealistic skin, glowing complexion, natural texture visible, " +
        "soft wind blowing her hair, candid, dreamy atmosphere, all limbs visible"
    },
    {
      seed: 9402,
      prompt:
        "mirror selfie of a gorgeous Latina woman in a boutique hotel room, wearing a red satin slip dress, " +
        "standing in front of an antique mirror, phone held up, full body reflection, " +
        "soft warm hotel lighting, luxurious atmosphere, photorealistic skin detail, " +
        "visible pores, natural texture, sharp focus, candid selfie style, elegant, confident, all limbs visible"
    },
  ],
  kira: [
    {
      seed: 9501,
      prompt:
        "mirror selfie of a futuristic 20yo woman with pink hair in a high-tech room, wearing a metallic silver bodysuit, " +
        "holographic blue and purple lights reflecting in floor-to-ceiling mirrors, " +
        "phone in hand, full body reflection, cyberpunk aesthetic, neon lighting, " +
        "photorealistic skin texture, glowing highlights on skin, sharp focus, " +
        "ultra detailed, sci-fi glam, all limbs visible"
    },
    {
      seed: 9502,
      prompt:
        "mirror selfie of a girl with pink hair in a minimalist white room with neon strip lights, wearing an oversized techwear jacket and shorts, " +
        "phone covering face, mirror shows full body, cool blue and pink lighting, " +
        "photorealistic, detailed skin texture, soft subsurface scattering, " +
        "candid selfie style, sharp focus, modern aesthetic, all limbs visible"
    },
    {
      seed: 9503,
      prompt:
        "bathroom mirror selfie of a young woman with pink hair, wearing a black lace bodysuit, " +
        "leaning toward mirror, phone in hand, dramatic lighting from above, " +
        "dark atmosphere with neon purple edge lighting, photorealistic skin, " +
        "detailed pores, natural texture, moody, sensual but tasteful, all limbs visible"
    },
  ],
  maya: [
    {
      seed: 9601,
      prompt:
        "car mirror selfie of a gorgeous blonde influencer inside a luxury sports car at night, " +
        "wearing a sparkling gold sequin dress, taking a selfie using the rearview mirror, " +
        "city lights glowing through car windows, diamond jewelry catching light, " +
        "photorealistic skin texture, perfect makeup, glamorous, soft flash lighting, " +
        "ultra detailed, sharp focus, candid luxury lifestyle, all limbs visible"
    },
    {
      seed: 9602,
      prompt:
        "elevator mirror selfie of a stunning blonde woman in a silver mini dress and stilettos, " +
        "taking a selfie in the mirror, phone in hand, full body reflection, " +
        "warm elevator lighting, glamorous night out vibe, photorealistic skin detail, " +
        "visible pores, natural skin texture, sharp focus, confident pose, all limbs visible"
    },
  ],
  sasha: [
    {
      seed: 9701,
      prompt:
        "nightclub bathroom mirror selfie of a stunning curvy woman with dark skin and braids, " +
        "wearing a tight leopard print dress, leaning toward mirror with phone in hand, " +
        "dim purple and pink club lighting, her reflection shows full curvy body, " +
        "photorealistic skin, glowing complexion, visible skin texture, " +
        "confident pose, sensual but classy, all limbs visible"
    },
    {
      seed: 9702,
      prompt:
        "full length mirror selfie of a gorgeous curvy woman with braids, wearing a black lace teddy, " +
        "in a bedroom with warm candlelight, phone in hand partly covering face, " +
        "full body reflection, soft moody lighting, photorealistic skin, " +
        "curvy hourglass figure visible, intimate atmosphere, tasteful boudoir, all limbs visible"
    },
    {
      seed: 9703,
      prompt:
        "mirror selfie of a confident curvy woman in a walk-in closet, wearing an oversized designer blazer and nothing else, " +
        "phone capturing reflection, tall floor mirror, surrounded by designer bags and clothes, " +
        "soft natural light from window, photorealistic skin detail, visible pores, " +
        "confident empowered pose, luxury lifestyle aesthetic, all limbs visible"
    },
  ],
  yuki: [
    {
      seed: 9801,
      prompt:
        "mirror selfie of a shy cute 19yo brunette girl in a cozy bedroom with fairy lights, " +
        "wearing an oversized cream knit sweater and no pants, standing in front of a mirror, " +
        "phone covering her blushing face, warm string lights reflecting in mirror, " +
        "soft warm lighting, photorealistic skin, natural glow, visible skin texture, " +
        "cute innocent vibe, cozy atmosphere, all limbs visible"
    },
    {
      seed: 9802,
      prompt:
        "full length mirror selfie of a cute young brunette in a sundress, standing in a sunlit bedroom, " +
        "taking a selfie with phone, mirror shows her full body and a neatly made bed behind, " +
        "bright natural daylight, photorealistic skin detail, soft texture, " +
        "fresh natural look, no heavy makeup, girl next door aesthetic, all limbs visible"
    },
  ],
};

function getStoryImageUrl(girlId: string, slide: StorySlide): string {
  const negative = encodeURIComponent(
    "cartoon, anime, drawing, painting, 3d render, illustration, CG, " +
    "bad anatomy, missing limbs, deformed, disfigured, ugly, low quality, " +
    "blurry, watermark, text, logo, nude, nipples, topless, explicit"
  );
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.prompt)}?width=576&height=768&seed=${slide.seed}&nofeed=true&negative=${negative}`;
}

export default function StoriesRow() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);

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
        const slides = STORIES[girls[gi].id] || [];
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
    const slides = STORIES[girls[gi].id] || [];
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
      const prevSlides = STORIES[girls[ng].id] || [];
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
  const slides = activeGirl ? (STORIES[activeGirl.id] || []) : [];
  const currentSlide = slides[slideIdx];

  return (
    <>
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
            onClick={() => openStory(i)}
            className="flex shrink-0 flex-col items-center text-white"
            style={{ width: 72, fontSize: 12 }}
          >
            <div
              className="relative mx-auto mb-2"
              style={{
                width: 66,
                height: 66,
                padding: 4,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff3b7f, #ff0f70, #ff7a3d)",
                boxShadow: "0 0 24px rgba(255,59,127,0.45)",
                transition: "transform 0.22s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div
                className="absolute right-[3px] top-[3px] z-10 h-3 w-3 rounded-full border-2"
                style={{ borderColor: "#0b0b0f", background: "#ff0f70" }}
              />
              <img
                src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
                alt={girl.name}
                className="h-full w-full rounded-full object-cover"
                style={{ border: "3px solid #0b0b0f", background: "#222" }}
              />
            </div>
            <span className="max-w-[66px] truncate text-center font-bold text-white/80">
              {girl.name}
            </span>
          </button>
        ))}
      </div>

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

            {/* Story image with shimmer loading */}
              <StoryImage
                src={getStoryImageUrl(activeGirl.id, currentSlide)}
                alt={activeGirl.name}
              />

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

function StoryImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!loaded) setError(true);
    }, 20000);
    return () => clearTimeout(timerRef.current);
  }, [src]);

  return (
    <div className="absolute inset-0 top-0">
      {!loaded && !error && (
        <div className="h-full w-full animate-pulse shimmer-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink/40 border-t-pink" />
            <span className="text-[0.55rem] font-semibold text-pink/60 tracking-widest uppercase">Generando imagen...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="h-full w-full flex items-center justify-center" style={{ background: "#1a1a24" }}>
          <p className="text-xs text-white/40">No se pudo cargar la imagen</p>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0 absolute"}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
      />
    </div>
  );
}
