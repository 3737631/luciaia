"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

export default function GirlCard({ girl, href }: { girl: Girl; href?: string }) {
  const link = href || `/customize/${girl.id}`;

  return (
    <Link
      href={link}
      style={{
        textDecoration: "none",
        display: "block",
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--surface)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        transition: "all 250ms ease",
        position: "relative",
        aspectRatio: "3/4",
      }}
      className="girl-card"
    >
      <img
        src={getGirlImage(girl.id)}
        alt={girl.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          inset: 0,
          transition: "transform 350ms ease",
        }}
        loading="lazy"
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 45%, rgba(5,5,7,0.9) 82%, rgba(5,5,7,0.97) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Age badge */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: "0.4rem",
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          color: "rgba(255,255,255,0.8)",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {girl.age}
      </div>

      {/* Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 10px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              margin: 0,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {girl.name}
          </p>
          {girl.style && (
            <p
              style={{
                fontSize: "0.45rem",
                color: "rgba(255,255,255,0.45)",
                margin: "1px 0 0",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
              }}
            >
              {girl.style}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            borderRadius: 999,
            height: 26,
            fontSize: "0.5rem",
            fontWeight: 600,
            color: "#fff",
            background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
            marginTop: 2,
          }}
        >
          <MessageCircle size={10} />
          Chatear
        </div>
      </div>

      <style>{`
        .girl-card:hover img {
          transform: scale(1.03);
        }
        .girl-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          border-color: rgba(255,255,255,0.1);
        }
      `}</style>
    </Link>
  );
}
