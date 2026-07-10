"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getGirlImage } from "@/lib/images";

const BANNERS = [
  { id: "luna", name: "Luna", tag: "En vivo ahora", href: "/chat/luna" },
  { id: "vera", name: "Vera", tag: "Nueva historia", href: "/chat/vera" },
  { id: "maya", name: "Maya", tag: "Popular", href: "/chat/maya" },
  { id: "sasha", name: "Sasha", tag: "En vivo ahora", href: "/chat/sasha" },
];

export default function HeroShowcaseCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % BANNERS.length);
  }, []);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  const b = BANNERS[current];

  return (
    <section style={{ padding: "0 16px", paddingTop: 16 }}>
      <Link
        href={b.href}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: 210,
          borderRadius: 20,
          overflow: "hidden",
          textDecoration: "none",
        }}
      >
        <img
          src={getGirlImage(b.id)}
          alt={b.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "#FF5798",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {b.tag}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {b.name}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              margin: "2px 0 0",
            }}
          >
            Chatear ahora
          </p>
        </div>
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 12,
        }}
      >
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              borderRadius: 999,
              border: 0,
              background: i === current ? "#FF5798" : "rgba(255,255,255,0.15)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
