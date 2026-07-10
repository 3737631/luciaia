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
      className="girl-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${index * 0.06}s, transform 0.5s ease ${index * 0.06}s`,
      }}
    >
      <div style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
        {failed ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, rgba(255,87,152,0.12), rgba(139,92,246,0.08))",
            }}
          >
            <span style={{ fontSize: "1.4rem", fontWeight: 600, color: "rgba(255,255,255,0.15)" }}>
              {girl.name.charAt(0)}
            </span>
          </div>
        ) : (
          <img
            src={src}
            alt={girl.name}
            loading="lazy"
            decoding="async"
            onError={() => !failed && setFailed(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              transition: "transform 0.5s ease",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 30%, rgba(9,9,11,0.4) 65%, rgba(9,9,11,0.9) 100%)",
          }}
        />
        {girl.age && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              borderRadius: 999,
              padding: "2px 8px",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {girl.age}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 12px 16px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: 2,
            }}
          >
            {girl.name}
          </div>
          {girl.style && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {girl.style}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px 12px",
          marginTop: -24,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Link
          href={`${basePath}/chat/${girl.id}`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "#FF5798",
            borderRadius: 14,
            height: 44,
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            lineHeight: 1,
            transition: "all 250ms ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chatear
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
            transition: "all 250ms ease",
          }}
          title="Llamada"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
            transition: "all 250ms ease",
          }}
          title="Videollamada"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
