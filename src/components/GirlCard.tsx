"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function useOnScreen(ref: React.RefObject<HTMLDivElement>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "80px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function GirlCard({ girl, index = 0 }: { girl: Girl; index?: number }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  const visible = useOnScreen(ref);
  const custom = getCustomization(girl.id);
  const src = failed
    ? getGirlImage(girl.id)
    : custom
      ? getGirlImage(girl.id, custom.hair, custom.pose, custom.background)
      : getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(18,17,24,0.35)",
        border: "0.5px solid rgba(255,255,255,0.04)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${index * 0.06}s, transform 0.5s ease ${index * 0.06}s`,
      }}
    >
      <Link href={`${basePath}/chat/${girl.id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
          {failed ? (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(255,90,157,0.12), rgba(139,92,246,0.08))" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: 600, color: "rgba(255,255,255,0.15)" }}>{girl.name.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={src}
              alt={girl.name}
              loading="lazy"
              decoding="async"
              onError={() => !failed && setFailed(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.5s ease" }}
            />
          )}
          {/* Gradient overlay starts earlier for Instagram feel */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(9,9,11,0.4) 65%, rgba(9,9,11,0.85) 100%)" }} />
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <span style={{ fontSize: "0.4rem", fontWeight: 500, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.5)" }}>
              {girl.age}
            </span>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px 44px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              {girl.name}
            </span>
            {girl.style && (
              <p style={{ fontSize: "0.45rem", fontWeight: 400, color: "rgba(255,255,255,0.35)", margin: "2px 0 0", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {girl.style}
              </p>
            )}
          </div>
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 8px 8px", marginTop: -32, position: "relative", zIndex: 2 }}>
        <Link
          href={`${basePath}/chat/${girl.id}`}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            background: "linear-gradient(135deg, #FF5A9D, #FF6FAB)",
            borderRadius: 999, height: 26, fontSize: "0.45rem", fontWeight: 600,
            color: "#fff", textDecoration: "none", lineHeight: 1, letterSpacing: "-0.01em",
            boxShadow: "0 2px 8px rgba(255,90,157,0.15)",
            transition: "all 250ms ease",
          }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Chatear
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)", transition: "all 250ms ease" }}
          title="Llamada"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)", transition: "all 250ms ease" }}
          title="Videollamada"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </Link>
      </div>
    </div>
  );
}