"use client";

import { useEffect, useRef } from "react";

export default function HeroImage({ src, pos, alt = "" }: { src: string; pos: string; alt?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Parallax + fundido del hero al hacer scroll (solo escritorio, composited)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        const img = imgRef.current;
        if (!wrap || !img) return;
        const y = window.scrollY;
        if (y < window.innerHeight) {
          wrap.style.opacity = String(Math.max(0.35, 1 - y / (window.innerHeight * 0.55)));
          img.style.transform = `translateY(${y * 0.16}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", overflow: "hidden", background: "#0B0B0F", willChange: "opacity" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -60,
          left: -60,
          right: -60,
          bottom: -60,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: pos,
          filter: "blur(20px) brightness(0.65) saturate(1.05)",
          transform: "scale(1.04)",
          opacity: 1,
        }}
      />
      <div
        aria-hidden="true"
        className="hero-blend"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, #0B0B0F 0%, rgba(11,11,15,0) 14%, rgba(11,11,15,0) 86%, #0B0B0F 100%)",
          opacity: 1,
        }}
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        className="hero-img kenburns"
        style={{
          position: "relative",
          width: "100%",
          display: "block",
          minHeight: "25vh",
          objectFit: "cover",
          objectPosition: pos,
          opacity: 1,
          userSelect: "none",
          WebkitUserSelect: "none",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
    </div>
  );
}
