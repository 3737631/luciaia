"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] pb-8 pt-8" style={{ background: "#0b0b0f" }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <h4 className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-3">NuviaChat</h4>
            <ul className="space-y-1.5">
              <li><Link href="/girls" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Características</Link></li>
              <li><Link href="/girls" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Chat IA</Link></li>
              <li><Link href="/girls" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Crear imagen</Link></li>
              <li><Link href="/girls" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Crear personaje</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-3">Explorar</h4>
            <ul className="space-y-1.5">
              <li><Link href="/girls" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Chicas</Link></li>
              <li><Link href="/anime" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Anime</Link></li>
              <li><Link href="/chicos" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Chicos</Link></li>
              <li><Link href="/history" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Historial</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-3">Legal</h4>
            <ul className="space-y-1.5">
              <li><Link href="/terms" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Términos</Link></li>
              <li><Link href="/privacy" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="/age-notice" className="text-[0.6rem] text-white/50 hover:text-white transition-colors">Aviso +18</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-3">Pago</h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[0.45rem] font-medium text-white/40 border border-white/[0.06]">Visa</span>
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[0.45rem] font-medium text-white/40 border border-white/[0.06]">MC</span>
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[0.45rem] font-medium text-white/40 border border-white/[0.06]">PayPal</span>
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[0.45rem] font-medium text-white/40 border border-white/[0.06]">Crypto</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF3B86] to-[#FF6B45] h-6 w-6 shadow-[0_0_12px_rgba(255,59,134,0.3)]">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
            <span className="text-xs font-bold tracking-tight">NuviaChat</span>
          </div>
          <p className="text-[0.5rem] text-white/30 text-center">
            NuviaChat usa personajes ficticios generados por IA. Todo el contenido es ficción entre adultos consintientes. Solo para mayores de 18 años.
          </p>
        </div>
      </div>
    </footer>
  );
}