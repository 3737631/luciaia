"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[rgba(7,3,12,0.72)] border-b border-white/[0.07]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/girls" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full gradient-btn text-sm font-bold shadow-lg shadow-pink-500/25">
            LC
          </span>
          <span className="text-lg font-semibold tracking-tight">LunaCall</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/girls" className="text-ink font-medium transition-colors">
            Chicas IA
          </Link>
          <Link href="/info" className="hover:text-ink transition-colors">
            Info
          </Link>
        </nav>
      </div>
    </header>
  );
}
