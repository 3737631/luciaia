"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [genderOpen, setGenderOpen] = useState(false);
  const [gender, setGender] = useState("Hombre");

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

        {/* Spacer - push right items */}
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
              <div
                style={{ position: "fixed", inset: 0, zIndex: 90 }}
                onClick={() => setGenderOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 4,
                  background: "#222",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  overflow: "hidden",
                  zIndex: 100,
                  minWidth: 100,
                }}
              >
                {["Hombre", "Mujer", "Otro"].map((o) => (
                  <button
                    key={o}
                    onClick={() => {
                      setGender(o);
                      setGenderOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 16px",
                      background: gender === o ? "rgba(255,255,255,0.08)" : "transparent",
                      border: 0,
                      color: gender === o ? "#ff5f8f" : "#fff",
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Únete gratis */}
        <Link
          href="#"
          style={{
            background: "linear-gradient(135deg, #ff5f8f, #ff2b86)",
            border: 0,
            borderRadius: 20,
            padding: "7px 16px",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Únete gratis
        </Link>

        {/* Iniciar sesión */}
        <Link
          href="#"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "6px 14px",
            color: "#ccc",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
}
