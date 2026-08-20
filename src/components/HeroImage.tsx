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
    <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#0B0B0F" }}>
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
          filter: "blur(46px) brightness(0.55)",
          transform: "scale(1.05)",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />
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
          position: "relative",
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
    </div>
  );
}
