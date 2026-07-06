"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] py-12 mt-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-btn text-[0.6rem] font-bold">
              LC
            </span>
            <span className="text-sm font-semibold tracking-tight">LunaCall</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/terms" className="hover:text-ink transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacidad
            </Link>
            <Link href="/age-notice" className="hover:text-ink transition-colors">
              Aviso +18
            </Link>
          </div>
        </div>
        <p className="mt-6 max-w-xl text-xs text-muted leading-relaxed">
          LunaCall usa personajes ficticios generados por IA. No representa personas reales.
          Todo el contenido es ficción entre adultos consintientes. Solo para mayores de 18 años.
        </p>
      </div>
    </footer>
  );
}
