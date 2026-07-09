"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronDown, User } from "lucide-react";

const exploreOptions = [
  { label: "Chicas", href: "/girls" },
  { label: "Chicos", href: "/chicos" },
  { label: "Anime", href: "/anime" },
];

const genderOptions = ["Hombre", "Mujer", "No binario", "Prefiero no decirlo"];

export default function Header({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const pathname = usePathname();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [gender, setGender] = useState("Hombre");
  const exploreRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  const currentExplore = exploreOptions.find((o) => pathname.startsWith(o.href)) || exploreOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setExploreOpen(false);
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) setGenderOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        paddingTop: "var(--safe-top)",
        background: "rgba(5,5,7,0.9)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="container-nuvia flex items-center justify-between"
        style={{ height: "var(--header-h)" }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <span style={{ background: "linear-gradient(135deg, #ff2d75, #ff5b6e)", borderRadius: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>N</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em" }}>uvia</span>
        </Link>

        {/* Center: Explore dropdown + Gender dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Explore dropdown */}
          <div ref={exploreRef} style={{ position: "relative" }}>
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 3,
                background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 999, padding: "4px 10px", cursor: "pointer",
                fontSize: "0.5rem", fontWeight: 600, color: "rgba(255,255,255,0.7)",
                lineHeight: 1, transition: "all 180ms ease",
              }}
            >
              Explorar: {currentExplore.label}
              <ChevronDown size={10} style={{ opacity: 0.5 }} />
            </button>
            {exploreOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 60, minWidth: 130, background: "#101014", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
                {exploreOptions.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => setExploreOpen(false)}
                    style={{
                      display: "block", padding: "6px 12px", borderRadius: 8,
                      fontSize: "0.5rem", fontWeight: 600, textDecoration: "none",
                      color: pathname.startsWith(opt.href) ? "#ff5b6e" : "rgba(255,255,255,0.6)",
                      background: pathname.startsWith(opt.href) ? "rgba(255,45,117,0.08)" : "transparent",
                      transition: "all 150ms ease",
                    }}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Gender dropdown */}
          <div ref={genderRef} style={{ position: "relative" }}>
            <button
              onClick={() => setGenderOpen(!genderOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 3,
                background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: 999, padding: "4px 10px", cursor: "pointer",
                fontSize: "0.5rem", fontWeight: 600, color: "rgba(255,255,255,0.7)",
                lineHeight: 1, transition: "all 180ms ease",
              }}
            >
              <User size={10} style={{ opacity: 0.5 }} />
              {gender}
              <ChevronDown size={10} style={{ opacity: 0.5 }} />
            </button>
            {genderOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 60, minWidth: 150, background: "#101014", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: "4px 12px 2px", fontSize: "0.4rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Tu perfil</div>
                {genderOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setGender(opt); setGenderOpen(false); }}
                    style={{
                      display: "block", width: "100%", padding: "6px 12px", borderRadius: 8, border: 0,
                       fontSize: "0.5rem", fontWeight: 600, cursor: "pointer", textAlign: "left",
                       color: gender === opt ? "#ff5b6e" : "rgba(255,255,255,0.6)",
                       background: gender === opt ? "rgba(255,45,117,0.08)" : "transparent",
                      transition: "all 150ms ease",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create button */}
        <button onClick={onOpenCreate} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 180ms ease" }}>
          <Sparkles size={12} />
        </button>
      </div>
    </header>
  );
}
