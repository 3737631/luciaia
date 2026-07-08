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
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[rgba(7,3,12,0.72)] border-b border-white/[0.07]">
      <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href="/girls" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-btn shadow-lg shadow-pink/25 sm:h-9 sm:w-9">
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">NuviaChat</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted sm:gap-5">
          {/* Gender selector */}
          <div className="relative">
            <button
              onClick={() => setShowGenderPicker(!showGenderPicker)}
              className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-1.5 text-xs transition hover:bg-white/10"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {userGender === "hombre" ? "Hombre" : "Mujer"}
            </button>
            {showGenderPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowGenderPicker(false)} />
                <div className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-white/10 bg-[#0f0518] p-1.5 shadow-2xl">
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
          <Link href="/girls" className="hidden sm:block text-ink font-medium transition-colors">
            Chicas
          </Link>
          <Link href="/history" className="hidden sm:block hover:text-ink transition-colors">
            Historial
          </Link>
          <Link href="/info" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all sm:hidden">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </Link>
          <Link href="/info" className="hidden sm:block hover:text-ink transition-colors">
            Info
          </Link>
        </nav>
      </div>
    </header>
  );
}
