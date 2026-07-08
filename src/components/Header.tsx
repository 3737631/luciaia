"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [userGender, setUserGender] = useState<"hombre" | "mujer">("hombre");
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lunacall_gender");
    if (saved === "hombre" || saved === "mujer") setUserGender(saved);
  }, []);

  function setGender(g: "hombre" | "mujer") {
    setUserGender(g);
    localStorage.setItem("lunacall_gender", g);
    setShowGenderPicker(false);
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-lg sm:h-16">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/girls" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-btn shadow-lg shadow-pink/25 sm:h-8 sm:w-8">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span className="text-sm font-bold tracking-tight sm:text-base">NuviaChat</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted sm:flex">
          <Link href="/girls" className="text-white font-medium transition-colors">
            Chicas
          </Link>
          <Link href="/history" className="hover:text-white transition-colors">
            Historial
          </Link>
          <Link href="/info" className="hover:text-white transition-colors">
            Info
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowGenderPicker(!showGenderPicker)}
              className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-[0.65rem] font-medium text-muted transition hover:bg-white/10 sm:text-xs"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {userGender === "hombre" ? "Hombre" : "Mujer"}
            </button>
            {showGenderPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowGenderPicker(false)} />
                <div className="absolute right-0 top-8 z-50 w-32 rounded-xl border border-white/10 bg-[#14141c] p-1.5 shadow-2xl">
                  <button
                    onClick={() => setGender("hombre")}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${userGender === "hombre" ? "bg-pink/20 text-white" : "text-muted hover:text-white"}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Hombre
                  </button>
                  <button
                    onClick={() => setGender("mujer")}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${userGender === "mujer" ? "bg-pink/20 text-white" : "text-muted hover:text-white"}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Mujer
                  </button>
                </div>
              </>
            )}
          </div>
          <Link
            href="/girls"
            className="flex h-8 items-center justify-center rounded-xl bg-gradient-to-r from-pink to-purple px-4 text-[0.65rem] font-bold text-white shadow-lg shadow-pink/25 transition-all hover:shadow-xl hover:shadow-pink/30 active:scale-[0.97] sm:h-9 sm:text-xs"
          >
            Empezar gratis
          </Link>
          <Link href="/info" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 sm:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
