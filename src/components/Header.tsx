"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[rgba(7,3,12,0.72)] border-b border-white/[0.07]">
      <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link href="/girls" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-btn text-[0.6rem] font-bold shadow-lg shadow-pink-500/25 sm:h-9 sm:w-9 sm:text-sm">
            LC
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">LunaCall</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted sm:gap-5">
          <Link href="/girls" className="hidden sm:block text-ink font-medium transition-colors">
            Chicas IA
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
