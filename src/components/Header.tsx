"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg/60 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full gradient-btn text-sm font-bold">
            LC
          </span>
          <span className="text-lg font-semibold">LunaCall</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <Link href="/girls" className="hover:text-ink transition-colors">
            Chicas IA
          </Link>
        </nav>
      </div>
    </header>
  );
}
