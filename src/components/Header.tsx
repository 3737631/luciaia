"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const menuLinks = [
  { label: "Inicio", href: "/girls" },
  { label: "Chicas", href: "/girls" },
  { label: "Chicos", href: "/chicos" },
  { label: "Anime", href: "/anime" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [gender, setGender] = useState("Hombre");
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: "calc(88px + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
        background: "#171717",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          padding: "0 16px",
          gap: 12,
        }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: 0,
            color: "#fff",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Menú"
        >
          <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
          <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
          <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        </button>

        {/* Logo */}
        <Link
          href="/girls"
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            textDecoration: "none",
            letterSpacing: "-0.03em",
            flexShrink: 0,
          }}
        >
          nuvia<span style={{ color: "#ff5f8f" }}>.ai</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Gender selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setGenderOpen(!genderOpen)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: 0,
              borderRadius: 20,
              padding: "6px 12px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {gender}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {genderOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setGenderOpen(false)} />
              <div
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: "#222", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden",
                  zIndex: 100, minWidth: 100,
                }}
              >
                {["Hombre", "Mujer", "Otro"].map((o) => (
                  <button
                    key={o}
                    onClick={() => { setGender(o); setGenderOpen(false); }}
                    style={{
                      display: "block", width: "100%", padding: "10px 16px",
                      background: gender === o ? "rgba(255,255,255,0.08)" : "transparent",
                      border: 0, color: gender === o ? "#ff5f8f" : "#fff",
                      fontSize: 13, cursor: "pointer", textAlign: "left",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Únete gratis / profile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              background: "linear-gradient(135deg, #ff5f8f, #ff2b86)",
              border: 0, borderRadius: 20,
              padding: "7px 16px", color: "#fff",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}
          >
            Únete ahora
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {profileOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setProfileOpen(false)} />
              <div
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: "#222", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden",
                  zIndex: 100, minWidth: 140,
                }}
              >
                <button
                  onClick={() => { setProfileOpen(false); }}
                  style={{
                    display: "block", width: "100%", padding: "10px 16px",
                    background: "transparent", border: 0,
                    color: "#fff", fontSize: 13, cursor: "pointer", textAlign: "left",
                  }}
                >
                  Crear cuenta
                </button>
                <button
                  onClick={() => { setProfileOpen(false); }}
                  style={{
                    display: "block", width: "100%", padding: "10px 16px",
                    background: "transparent", border: 0,
                    color: "#fff", fontSize: 13, cursor: "pointer", textAlign: "left",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  Iniciar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side menu overlay */}
      {menuOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200 }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.5)",
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 260,
              background: "#1a1a1a",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              padding: "calc(108px + env(safe-area-inset-top)) 20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {menuLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/girls" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#ff5f8f" : "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    background: isActive ? "rgba(255,95,143,0.1)" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}