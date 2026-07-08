"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [userGender, setUserGender] = useState<"hombre" | "mujer">("hombre");
  const [showGender, setShowGender] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lunacall_gender");
    if (saved === "hombre" || saved === "mujer") setUserGender(saved);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function setGender(g: "hombre" | "mujer") {
    setUserGender(g);
    localStorage.setItem("lunacall_gender", g);
    setShowGender(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/[0.06] transition-all duration-300 ${
        scrolled
          ? "h-12 bg-[#0b0b0f]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] sm:h-14"
          : "h-14 bg-[#0b0b0f] sm:h-16"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3 sm:px-6">
        <Link href="/girls" className={`flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${scrolled ? "scale-90" : "scale-100"}`}>
          <span className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#ff3b7f] to-[#ff7a3d] transition-all duration-300 ${scrolled ? "h-6 w-6 sm:h-6 sm:w-6" : "h-7 w-7 sm:h-8 sm:w-8"}`}>
            <svg viewBox="0 0 24 24" className={`transition-all duration-300 ${scrolled ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}`} fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span className={`font-bold tracking-tight transition-all duration-300 ${scrolled ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>NuviaChat</span>
        </Link>

        <nav className="hidden sm:flex sm:items-center sm:gap-6">
          <Link href="/girls" className={`relative text-sm font-medium transition ${pathname === "/girls" ? "text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#ff3b7f]" : "text-white/50 hover:text-white/80"}`}>
            Chicas
          </Link>
          <Link href="/anime" className={`relative text-sm font-medium transition ${pathname === "/anime" ? "text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#ff3b7f]" : "text-white/50 hover:text-white/80"}`}>
            Anime
          </Link>
          <Link href="/chicos" className={`relative text-sm font-medium transition ${pathname === "/chicos" ? "text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#ff3b7f]" : "text-white/50 hover:text-white/80"}`}>
            Chicos
          </Link>
        </nav>

        <div className="relative sm:hidden">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="flex items-center gap-1 text-sm font-medium text-white"
          >
            Chicas
            <svg className={`h-3 w-3 transition ${showMobileNav ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {showMobileNav && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMobileNav(false)} />
              <div className="absolute left-1/2 top-8 z-50 w-28 -translate-x-1/2 rounded-xl border border-white/[0.10] bg-[#16161d] p-1 shadow-premium">
                <Link href="/girls" onClick={() => setShowMobileNav(false)} className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition ${pathname === "/girls" ? "bg-pink/10 text-pink" : "text-white hover:bg-white/[0.06]"}`}>Chicas</Link>
                <Link href="/anime" onClick={() => setShowMobileNav(false)} className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition ${pathname === "/anime" ? "bg-pink/10 text-pink" : "text-white/50 hover:bg-white/[0.06] hover:text-white"}`}>Anime</Link>
                <Link href="/chicos" onClick={() => setShowMobileNav(false)} className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs transition ${pathname === "/chicos" ? "bg-pink/10 text-pink" : "text-white/50 hover:bg-white/[0.06] hover:text-white"}`}>Chicos</Link>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/history"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white/80 sm:h-8 sm:w-8"
            title="Historial"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowGender(!showGender)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/50 transition hover:bg-white/[0.08] hover:text-white/80 sm:h-8 sm:w-8"
              title={userGender === "hombre" ? "Hombre" : "Mujer"}
            >
              <span className="text-xs font-bold">{userGender === "hombre" ? "♂" : "♀"}</span>
            </button>
            {showGender && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowGender(false)} />
                <div className="absolute right-0 top-9 z-50 w-36 rounded-xl border border-white/[0.10] bg-[#16161d] p-1 shadow-premium">
                  <div className="px-3 py-2 text-[0.6rem] font-medium text-white/40">¿Qué género eres?</div>
                  <button onClick={() => setGender("hombre")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${userGender === "hombre" ? "bg-blue-500/20 text-blue-400" : "text-white/50 hover:text-white"}`}>
                    <span className={`text-sm ${userGender === "hombre" ? "text-blue-400" : ""}`}>♂</span>
                    Hombre
                  </button>
                  <button onClick={() => setGender("mujer")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${userGender === "mujer" ? "bg-pink-500/20 text-pink-400" : "text-white/50 hover:text-white"}`}>
                    <span className={`text-sm ${userGender === "mujer" ? "text-pink-400" : ""}`}>♀</span>
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
            className={`flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff3b7f] to-[#ff7a3d] font-bold text-white shadow-[0_0_20px_rgba(255,59,127,0.35)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,59,127,0.5)] active:scale-95 ${
              scrolled
                ? "h-9 px-4 text-xs sm:px-5 sm:text-sm shadow-[0_0_30px_rgba(255,59,127,0.5)]"
                : "h-8 px-2 text-[0.5rem] sm:px-4 sm:text-xs"
            }`}
            title="Crear cuenta gratuita"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            <span className="hidden sm:inline">Crear cuenta gratuita</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
