"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const APPLE_SPRING = "cubic-bezier(.32,.72,0,1)";

export default function StoryVideoViewer({
  videoSrc,
  avatar,
  name,
  onClose,
}: {
  videoSrc: string;
  avatar: string;
  name: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [closing, setClosing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const scrollYRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const diff = now.getTime() - start.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h >= 1) setTimeAgo(`Hace ${h}h`);
      else setTimeAgo(`Hace ${m}m`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    scrollYRef.current = window.scrollY;
    const b = document.body;
    const h = document.documentElement;
    const origB = { position: b.style.position, top: b.style.top, overflow: b.style.overflow };
    const origH = { overflow: h.style.overflow };
    h.style.overflow = "hidden";
    b.style.position = "fixed";
    b.style.top = `-${scrollYRef.current}px`;
    b.style.overflow = "hidden";
    return () => {
      mountedRef.current = false;
      b.style.position = origB.position;
      b.style.top = origB.top;
      b.style.overflow = origB.overflow;
      h.style.overflow = origH.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, []);

  const mountedRef = useRef(true);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    videoRef.current?.pause();
    setTimeout(onClose, 280);
  };

  const frame = (
    <div
      className="story-desktop-shell"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
        overscrollBehavior: "none",
        height: "100dvh",
        fontFamily: `-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif`,
        transition: `transform 280ms ${APPLE_SPRING}, opacity 240ms ease`,
        transform: closing ? "translate3d(0,105%,0)" : "translate3d(0,0,0)",
        opacity: closing ? 0 : 1,
      }}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("[data-story-interactive]")) return;
        handleClose();
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)", pointerEvents: "none" }} />

      {/* Video */}
      <div
        style={{
          position: "relative",
          width: "min(430px, calc(100vw - 0px))",
          height: "100dvh",
          minHeight: "100dvh",
          overflow: "hidden",
          background: "#000",
          borderRadius: 0,
          boxShadow: "0 20px 70px rgba(0,0,0,.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            pointerEvents: "none",
          }}
        />

        {/* Top gradient */}
        <div style={{
          position: "absolute", zIndex: 25, inset: "0 0 auto", height: 145,
          background: "linear-gradient(to bottom,rgba(0,0,0,.64) 0%,rgba(0,0,0,.29) 55%,transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{
          position: "absolute", zIndex: 60,
          top: "calc(env(safe-area-inset-top,0px) + 12px)",
          left: 10, right: 10,
          display: "flex", alignItems: "center", minHeight: 38,
        }} data-story-interactive>
          <button
            aria-label="Volver atrás"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            style={{
              width: 40, height: 40, display: "grid", placeItems: "center", padding: 0,
              border: 0, background: "transparent", color: "#fff", cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <img src={avatar} alt="" style={{
            width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flex: "0 0 auto",
            border: "1.5px solid rgba(255,255,255,.85)",
          }} />
          <span style={{
            marginLeft: 9, fontSize: 13.5, lineHeight: "17px",
            fontWeight: 600, color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,.4)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {name}
          </span>
          <span style={{
            marginLeft: 6, fontSize: 12.5, lineHeight: "17px", fontWeight: 400,
            color: "rgba(255,255,255,.72)",
            textShadow: "0 1px 2px rgba(0,0,0,.35)",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {timeAgo}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <button
              aria-label="Cerrar"
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              style={{
                width: 40, height: 40, display: "grid", placeItems: "center", padding: 0,
                border: 0, background: "transparent", color: "#fff", cursor: "pointer",
              }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{
          position: "absolute", zIndex: 30, left: 0, right: 0, bottom: 0, height: 120,
          background: "linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 100%)",
          pointerEvents: "none",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "max(18px, env(safe-area-inset-bottom,0px))",
        }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.55)", letterSpacing: 0.2 }}>
            Video en bucle · toca para cerrar
          </span>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(frame, document.body);
}