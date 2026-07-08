"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { girls } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

export default function StoriesRow() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const openStory = useCallback((idx: number) => {
    setActiveIndex(idx);
    setProgress(0);
    progressRef.current = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      progressRef.current += 1;
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        clearInterval(timerRef.current);
        setActiveIndex((prev) => {
          if (prev === null) return null;
          const next = prev + 1;
          if (next >= girls.length) return null;
          setProgress(0);
          progressRef.current = 0;
          timerRef.current = setInterval(() => {
            progressRef.current += 1;
            setProgress(progressRef.current);
            if (progressRef.current >= 100) {
              clearInterval(timerRef.current);
              setActiveIndex((p2) => {
                if (p2 === null) return null;
                const n2 = p2 + 1;
                if (n2 >= girls.length) return null;
                setProgress(0);
                progressRef.current = 0;
                return n2;
              });
            }
          }, 50);
          return next;
        });
      }
    }, 50);
  }, []);

  const closeStories = useCallback(() => {
    clearInterval(timerRef.current);
    setActiveIndex(null);
    setProgress(0);
    progressRef.current = 0;
  }, []);

  const goNext = useCallback(() => {
    if (activeIndex === null) return;
    clearInterval(timerRef.current);
    const next = activeIndex + 1;
    if (next >= girls.length) return closeStories();
    openStory(next);
  }, [activeIndex, openStory, closeStories]);

  const goPrev = useCallback(() => {
    if (activeIndex === null) return;
    clearInterval(timerRef.current);
    const prev = activeIndex - 1;
    if (prev < 0) return closeStories();
    openStory(prev);
  }, [activeIndex, openStory, closeStories]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const activeGirl = activeIndex !== null ? girls[activeIndex] : null;

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
      {activeGirl && activeIndex !== null && (
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
              {girls.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full"
                  style={{
                    background: i < activeIndex
                      ? "#fff"
                      : i === activeIndex
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(255,255,255,0.15)",
                  }}
                >
                  {i === activeIndex && (
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
                <img
                  src={getGirlImage(activeGirl.id, activeGirl.defaultHair, activeGirl.defaultPose, activeGirl.defaultBackground)}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-white/30 object-cover"
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

            {/* Image - use full image for story */}
            <img
              src={getGirlImage(activeGirl.id, activeGirl.defaultHair, "bata", activeGirl.defaultBackground)}
              alt={activeGirl.name}
              className="h-full w-full object-cover"
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
