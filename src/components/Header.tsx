"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [userGender, setUserGender] = useState<"hombre" | "mujer">("hombre");
  const [showGender, setShowGender] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lunacall_gender");
    if (saved === "hombre" || saved === "mujer") setUserGender(saved);
  }, []);

  function setGender(g: "hombre" | "mujer") {
    setUserGender(g);
    localStorage.setItem("lunacall_gender", g);
    setShowGender(false);
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-white/[0.06] bg-[#0b0b0f] sm:h-16">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3 sm:px-6">
        <Link href="/girls" className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3b7f] to-[#ff7a3d] sm:h-8 sm:w-8">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span className="text-sm font-bold tracking-tight sm:text-base">NuviaChat</span>
        </Link>

        <nav className="hidden sm:flex sm:items-center sm:gap-6">
          <Link href="/girls" className="relative text-sm font-medium text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#ff3b7f]">
            Chicas
          </Link>
          <Link href="/girls" className="text-sm text-white/50 transition hover:text-white/80">
            Anime
          </Link>
          <Link href="/girls" className="text-sm text-white/50 transition hover:text-white/80">
            Chicos
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Gender - discreet icon */}
          <div className="relative">
            <button
              onClick={() => setShowGender(!showGender)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white/80 sm:h-8 sm:w-8"
              title={userGender === "hombre" ? "Hombre" : "Mujer"}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            {showGender && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowGender(false)} />
                <div className="absolute right-0 top-9 z-50 w-28 rounded-xl border border-white/[0.10] bg-[#16161d] p-1 shadow-premium">
                  <button onClick={() => setGender("hombre")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${userGender === "hombre" ? "bg-[#ff3b7f]/20 text-white" : "text-white/50 hover:text-white"}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Hombre
                  </button>
                  <button onClick={() => setGender("mujer")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${userGender === "mujer" ? "bg-[#ff3b7f]/20 text-white" : "text-white/50 hover:text-white"}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Mujer
                  </button>
                </div>
              </>
            )}
          </div>

          <Link
            href="/girls"
            className="hidden h-8 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-[0.6rem] font-medium text-white/70 transition hover:bg-white/[0.08] sm:inline-flex sm:px-3.5 sm:text-xs"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/girls"
            className="flex h-8 items-center justify-center rounded-full bg-gradient-to-r from-[#ff3b7f] to-[#ff7a3d] px-2 text-[0.5rem] font-bold text-white shadow-[0_0_20px_rgba(255,59,127,0.35)] transition hover:shadow-[0_0_28px_rgba(255,59,127,0.5)] sm:px-4 sm:text-xs"
            title="Crear cuenta gratuita"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            <span className="hidden sm:inline">Crear cuenta gratuita</span>
          </Link>
          <Link href="/info" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] sm:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
