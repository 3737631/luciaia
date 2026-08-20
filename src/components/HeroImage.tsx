"use client";

import { useEffect, useState } from "react";

export default function HeroImage({ src, pos, alt = "" }: { src: string; pos: string; alt?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      img.decode().then(() => alive && setReady(true)).catch(() => alive && setReady(true));
    };
    img.onerror = () => alive && setReady(true);
    img.src = src;
    return () => { alive = false; };
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      loading="eager"
      fetchPriority="high"
      decoding="sync"
      className="hero-img"
      style={{
        width: "100%",
        display: "block",
        minHeight: "25vh",
        objectFit: "cover",
        objectPosition: pos,
        opacity: ready ? 1 : 0,
        transition: "opacity 0.2s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
}
