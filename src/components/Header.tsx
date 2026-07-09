"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = [
    { href: "/girls", label: "Chicas" },
    { href: "/anime", label: "Anime" },
    { href: "/chicos", label: "Chicos" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#0b0b0f]/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          : "bg-[#0b0b0f]"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link href="/girls" className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF3B86] to-[#FF6B45] h-6 w-6 shadow-[0_0_12px_rgba(255,59,134,0.3)]">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span className="text-xs font-bold tracking-tight sm:text-sm">NuviaChat</span>
        </Link>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-white/[0.04] rounded-full p-0.5 border border-white/[0.06]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-2.5 py-1 text-[0.6rem] font-semibold rounded-full transition-all sm:px-3 sm:text-[0.65rem] ${
                  isActive
                  ? "bg-[#FF3B86]/15 text-[#FF3B86] shadow-[0_0_12px_rgba(255,59,134,0.15)]"
                  : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/girls"
            className="hidden sm:flex h-7 items-center rounded-full border border-white/[0.12] px-3 text-[0.5rem] font-semibold text-white/70 hover:text-white transition-all active:scale-95"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/girls"
            className="flex h-7 items-center rounded-full bg-gradient-to-r from-[#FF3B86] to-[#FF6B45] px-3 text-[0.5rem] font-bold text-white shadow-[0_0_16px_rgba(255,59,134,0.3)] transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(255,59,134,0.4)]"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            <span className="hidden sm:inline">Crear cuenta</span>
          </Link>
        </div>
      </div>
    </header>
  );
}