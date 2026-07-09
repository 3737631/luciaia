"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(180deg, #0B0B0F 0%, #151016 100%)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto max-w-[1180px] px-4 pt-8 pb-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <h4 className="text-[0.45rem] font-bold tracking-widest mb-3" style={{ color: "#71717A", letterSpacing: "0.08em" }}>NuviaChat</h4>
            <ul className="space-y-1.5">
              <li><Link href="/girls" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Características</Link></li>
              <li><Link href="/girls" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Chat IA</Link></li>
              <li><Link href="/girls" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Crear imagen</Link></li>
              <li><Link href="/girls" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Crear personaje</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.45rem] font-bold tracking-wider mb-3" style={{ color: "#71717A", letterSpacing: "0.08em" }}>Explorar</h4>
            <ul className="space-y-1.5">
              <li><Link href="/girls" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Chicas</Link></li>
              <li><Link href="/anime" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Anime</Link></li>
              <li><Link href="/chicos" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Chicos</Link></li>
              <li><Link href="/history" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Historial</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.45rem] font-bold tracking-wider mb-3" style={{ color: "#71717A", letterSpacing: "0.08em" }}>Legal</h4>
            <ul className="space-y-1.5">
              <li><Link href="/terms" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Términos</Link></li>
              <li><Link href="/privacy" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Privacidad</Link></li>
              <li><Link href="/age-notice" className="text-[0.55rem] transition-colors" style={{ color: "#A1A1AA" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FF3B7F"} onMouseLeave={(e) => e.currentTarget.style.color = "#A1A1AA"}>Aviso +18</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.45rem] font-bold tracking-wider mb-3" style={{ color: "#71717A", letterSpacing: "0.08em" }}>Pago</h4>
            <div className="flex flex-wrap gap-1">
              <span className="rounded-md px-1.5 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.04)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Visa</span>
              <span className="rounded-md px-1.5 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.04)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>MC</span>
              <span className="rounded-md px-1.5 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.04)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>PayPal</span>
              <span className="rounded-md px-1.5 py-0.5 text-[0.4rem] font-medium border" style={{ background: "rgba(255,255,255,0.04)", color: "#71717A", borderColor: "rgba(255,255,255,0.06)" }}>Crypto</span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF3B7F] to-[#FF5A4F] h-4 w-4">
              <svg viewBox="0 0 24 24" className="h-2 w-2" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
            <span className="text-[0.55rem] font-bold tracking-tight" style={{ letterSpacing: "-0.04em" }}>NuviaChat</span>
          </div>
          <p className="text-[0.45rem] text-center" style={{ color: "#71717A" }}>
            NuviaChat usa personajes ficticios generados por IA. Todo el contenido es ficción entre adultos consintientes. Solo para mayores de 18 años.
          </p>
        </div>
      </div>
    </footer>
  );
}