"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hasUnreadReplies, onUnreadChange } from "@/lib/memory";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Explorar", href: "/girls" },
  { label: "Mensajes", href: "/messages" },
  { label: "Crear", href: "/customize" },
  { label: "Chat", href: "/chat/luna?picker=1" },
  { label: "Premium", href: "/premium" },
];

const categoryLinks = [
  { label: "Chica", href: "/girls" },
  { label: "Chico", href: "/chicos" },
  { label: "Anime", href: "/anime" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setHasUnread(hasUnreadReplies());
    return onUnreadChange(() => setHasUnread(hasUnreadReplies()));
  }, []);

  const currentCat = categoryLinks.find((c) => pathname.startsWith(c.href)) ?? categoryLinks[0];

  return (
    <>
      <div style={{ height: "calc(88px + env(safe-area-inset-top, 0px))", flexShrink: 0 }} />
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "calc(88px + env(safe-area-inset-top, 0px))",
          paddingTop: "env(safe-area-inset-top, 0px)",
          boxSizing: "border-box",
          background: "#171717",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          padding: "0 16px",
          gap: 10,
        }}
      >
        {/* Hamburger */}
        <div style={{ position: "relative", flexShrink: 0 }} className="header-hamburger">
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
          {hasUnread && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#ff2f78",
                border: "2px solid #171717",
              }}
            />
          )}
        </div>

        {/* Logo */}
        <Link
          href="/"
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

        {/* Navegación de escritorio/tablet (oculta en móvil) */}
        <div className="header-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 18 }}>
          {navItems.map((item) => {
            const isPremium = item.label === "Premium";
            const isActive = !isPremium && pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="press"
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 600,
                  color: isPremium ? "#ff5f8f" : isActive ? "#ff5f8f" : "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  background: isActive ? "rgba(255,95,143,0.1)" : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
                {item.label === "Mensajes" && hasUnread && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff2f78", display: "inline-block", marginLeft: 6, verticalAlign: "middle" }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Category dropdown: Chica / Chico / Anime */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setCatOpen(!catOpen)}
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
            {currentCat.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {catOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setCatOpen(false)} />
              <div
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: "#222", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden",
                  zIndex: 100, minWidth: 100,
                }}
              >
                {categoryLinks.map((c) => {
                  const isActive = pathname.startsWith(c.href);
                  return (
                    <Link
                      key={c.label}
                      href={c.href}
                      onClick={() => setCatOpen(false)}
                      className="press"
                      style={{
                        display: "block", width: "100%", padding: "10px 16px",
                        background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                        border: 0, color: isActive ? "#ff5f8f" : "#fff",
                        fontSize: 13, cursor: "pointer", textAlign: "left",
                        textDecoration: "none",
                      }}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Únete ahora */}
        <button
          style={{
            background: "linear-gradient(135deg, #ff5f8f, #ff2b86)",
            border: 0, borderRadius: 20,
            padding: "7px 16px", color: "#fff",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Únete ahora
        </button>
      </div>

      {/* Side menu overlay - full navigation */}
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
              padding: "calc(88px + env(safe-area-inset-top)) 20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {navItems.map((item) => {
              if (item.label === "Premium") {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="press"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#ff5f8f",
                      textDecoration: "none",
                      letterSpacing: "-0.01em",
                      background: "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.label}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginTop: 1 }}>
                      <path d="M12 2l2.4 7.2L22 9.6l-5.6 4.8 1.6 7.6L12 18l-6 4 1.6-7.6L2 9.6l7.6-.4z"/>
                    </svg>
                  </Link>
                );
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="press"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
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
                  {item.label}
                  {item.label === "Mensajes" && hasUnread && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#ff2f78",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      </header>
    </>
  );
}
