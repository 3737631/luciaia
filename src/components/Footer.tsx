"use client";

import Link from "next/link";

export default function Footer() {
  const linkClass = "text-[0.55rem] transition-colors md:text-[0.6rem]";
  const linkStyle = { color: "rgba(255,255,255,0.4)", letterSpacing: "-0.01em" };

  return (
    <footer className="mt-8" style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, #0B0B0F 0%, #151016 100%)" }}>
      <div className="container-nuvia pt-8 pb-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>NUVIA</h4>
            <ul className="space-y-1.5">
              {["Características", "Chat IA", "Crear imagen", "Crear personaje"].map((t) => (
                <li key={t}><Link href="/girls" className={linkClass} style={linkStyle}>{t}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>EXPLORAR</h4>
            <ul className="space-y-1.5">
              <li><Link href="/girls" className={linkClass} style={linkStyle}>Chicas</Link></li>
              <li><Link href="/anime" className={linkClass} style={linkStyle}>Anime</Link></li>
              <li><Link href="/chicos" className={linkClass} style={linkStyle}>Chicos</Link></li>
              <li><Link href="/history" className={linkClass} style={linkStyle}>Historial</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.4rem] font-semibold tracking-[0.08em] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>LEGAL</h4>
            <ul className="space-y-1.5">
              <li><Link href="/terms" className={linkClass} style={linkStyle}>Términos</Link></li>
              <li><Link href="/privacy" className={linkClass} style={linkStyle}>Privacidad</Link></li>
              <li><Link href="/age-notice" className={linkClass} style={linkStyle}>Aviso +18</Link></li>
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
            <div className="flex items-center justify-center rounded-full" style={{ width: 16, height: 16, background: "linear-gradient(135deg, #FF3B7F, #FF5A4F)" }}>
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