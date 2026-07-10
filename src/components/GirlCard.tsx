"use client";

import { useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function GirlCard({ girl }: { girl: Girl }) {
  const [failed, setFailed] = useState(false);
  const custom = getCustomization(girl.id);
  const src = failed
    ? getGirlImage(girl.id)
    : custom
      ? getGirlImage(girl.id, custom.hair, custom.pose, custom.background)
      : getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--surface)", border: "0.5px solid var(--border)" }}>
      <Link href={`${basePath}/chat/${girl.id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
          {failed ? (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(255,45,117,0.2), rgba(139,92,246,0.2))" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{girl.name.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={src}
              alt={girl.name}
              loading="lazy"
              decoding="async"
              onError={() => !failed && setFailed(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.4s ease" }}
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(8,7,12,0.85) 85%)" }} />
          <div style={{ position: "absolute", top: 6, right: 6 }}>
            <span style={{ fontSize: "0.45rem", fontWeight: 600, padding: "1px 6px", borderRadius: 999, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(4px)", color: "rgba(255,255,255,0.7)" }}>
              {girl.age}
            </span>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              {girl.name}
            </span>
            {girl.style && (
              <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.45)", margin: "1px 0 0", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {girl.style}
              </p>
            )}
          </div>
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px" }}>
        <Link
          href={`${basePath}/chat/${girl.id}`}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
            borderRadius: 8, height: 32, fontSize: "0.55rem", fontWeight: 600,
            color: "#fff", textDecoration: "none", lineHeight: 1, letterSpacing: "-0.01em",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Chatear
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: "rgba(255,255,255,0.3)", transition: "color 0.15s" }}
          title="Llamada"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: "rgba(255,255,255,0.3)", transition: "color 0.15s" }}
          title="Videollamada"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </Link>
      </div>
    </div>
  );
}