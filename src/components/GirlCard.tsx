"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function shouldBeOnline(): boolean {
  return Math.random() < 0.55;
}

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
  const [online] = useState(shouldBeOnline);
  const ref = useRef<HTMLDivElement>(null!);
  const visible = useOnScreen(ref);
  const router = useRouter();
  const custom = getCustomization(girl.id);
  const src = failed
    ? getGirlImage(girl.id)
    : custom
      ? getGirlImage(girl.id, custom.hair, custom.pose, custom.background)
      : getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);

  return (
    <div
      ref={ref}
      className="person-card"
      role="button"
      tabIndex={0}
      aria-label={`${girl.name}, ${girl.age} años`}
      onClick={() => router.push(`${basePath}/chat/${girl.id}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`${basePath}/chat/${girl.id}`); } }}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`,
      }}
    >
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
          <span style={{ fontSize: "1.6rem", fontWeight: 600, color: "rgba(255,255,255,0.15)" }}>
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
          style={{ objectPosition: girl.imagePosition || "center center" }}
        />
      )}

      {girl.badge && (
        <div className="person-badges">
          <span className="person-badge">{girl.badge}</span>
        </div>
      )}

      <div className="person-card-content">
        <div className="person-name-row">
          <span className="person-name">{girl.name}</span>
          {online && <span className="online-dot" />}
          <span className="person-age">{girl.age}</span>
        </div>
        <p className="person-description">{girl.description}</p>
      </div>

      <Link
        href={`${basePath}/chat/${girl.id}`}
        className="person-action"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Chatear
      </Link>

      <div className="person-quick-actions">
        <Link
          href={`${basePath}/call/${girl.id}`}
          className="quick-action-button"
          title="Llamada"
          aria-label={`Llamar a ${girl.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          className="quick-action-button"
          title="Videollamada"
          aria-label={`Videollamada con ${girl.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
