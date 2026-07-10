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
    <div
      className="fade-in"
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(18,17,24,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        transition: "all 250ms ease",
      }}
    >
      <Link href={`${basePath}/chat/${girl.id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
          {failed ? (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(255,79,151,0.15), rgba(139,92,246,0.12))" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: 600, color: "rgba(255,255,255,0.2)" }}>{girl.name.charAt(0)}</span>
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
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(8,7,12,0.6) 80%, rgba(8,7,12,0.85) 100%)" }} />
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <span style={{ fontSize: "0.4rem", fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.6)" }}>
              {girl.age}
            </span>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              {girl.name}
            </span>
            {girl.style && (
              <p style={{ fontSize: "0.45rem", fontWeight: 400, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {girl.style}
              </p>
            )}
          </div>
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px 8px" }}>
        <Link
          href={`${basePath}/chat/${girl.id}`}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            background: "linear-gradient(135deg, #FF4F97, #FF63A2)",
            borderRadius: 999, height: 28, fontSize: "0.5rem", fontWeight: 600,
            color: "#fff", textDecoration: "none", lineHeight: 1, letterSpacing: "-0.01em",
            boxShadow: "0 2px 10px rgba(255,79,151,0.18)",
            transition: "all 250ms ease",
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Chatear
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: "rgba(255,255,255,0.25)", transition: "all 250ms ease" }}
          title="Llamada"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: "rgba(255,255,255,0.25)", transition: "all 250ms ease" }}
          title="Videollamada"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </Link>
      </div>
    </div>
  );
}