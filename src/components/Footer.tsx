"use client";

import Link from "next/link";

export default function Footer() {
  const links = [
    { href: "/girls", label: "Características" },
    { href: "/girls", label: "Chat IA" },
    { href: "/girls", label: "Crear imagen" },
    { href: "/girls", label: "Crear personaje" },
  ];
  const explore = [
    { href: "/girls", label: "Chicas" },
    { href: "/anime", label: "Anime" },
    { href: "/chicos", label: "Chicos" },
    { href: "/history", label: "Historial" },
  ];

  return (
    <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }} className="mt-8">
      <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>NUVIA</h4>
            <ul className="space-y-1.5">
              {links.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[0.55rem] transition-colors" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>EXPLORAR</h4>
            <ul className="space-y-1.5">
              {explore.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[0.55rem] transition-colors" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>LEGAL</h4>
            <ul className="space-y-1.5">
              <li><Link href="/terms" className="text-[0.55rem] transition-colors" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>Términos</Link></li>
              <li><Link href="/privacy" className="text-[0.55rem] transition-colors" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>Privacidad</Link></li>
              <li><Link href="/age-notice" className="text-[0.55rem] transition-colors" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" }}>Aviso +18</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>PAGO</h4>
            <div className="flex flex-wrap gap-1.5">
              {["Visa", "MC", "PayPal", "Crypto"].map((t) => (
                <span key={t} className="rounded-md px-1.5 py-0.5 text-[0.4rem] font-medium" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-1.5">
            <div className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #FF2D7F, #FF5A4F)" }}>
              <svg viewBox="0 0 24 24" className="h-2 w-2 fill-white" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </div>
            <span className="text-[0.5rem] font-semibold tracking-tight" style={{ letterSpacing: "-0.03em" }}>NuviaChat</span>
          </div>
          <p className="text-[0.4rem] text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
            Personajes ficticios generados por IA. Contenido para adultos +18.
          </p>
        </div>
      </div>
    </footer>
  );
}