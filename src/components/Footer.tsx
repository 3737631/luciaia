"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 mt-16">
      <div className="mx-auto max-w-6xl px-5 flex flex-col gap-4 text-sm text-muted">
        <div className="flex flex-wrap gap-4">
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
        <p className="max-w-2xl">
          LunaCall usa personajes ficticios generados por IA. No representa personas
          reales.
        </p>
      </div>
    </footer>
  );
}
