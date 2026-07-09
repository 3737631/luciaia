"use client";

import Link from "next/link";

export default function Footer() {
  const linkStyle = { color: "rgba(255,255,255,0.35)", fontSize: "0.5rem", letterSpacing: "-0.01em", transition: "color 200ms ease", textDecoration: "none" };

  return (
    <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, transparent 0%, rgba(16,16,20,0.5) 100%)", marginTop: 18 }}>
      <div className="container-nuvia" style={{ paddingTop: 24, paddingBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, fontSize: "0.5rem" }}>
          <div>
            <h4 style={{ fontSize: "0.4rem", fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 8px", color: "rgba(255,255,255,0.2)" }}>NUVIA</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {["Características", "Chat IA", "Crear imagen", "Crear personaje"].map((t) => (
                <li key={t}><Link href="/girls" style={linkStyle}>{t}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.4rem", fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 8px", color: "rgba(255,255,255,0.2)" }}>EXPLORAR</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <li><Link href="/girls" style={linkStyle}>Chicas</Link></li>
              <li><Link href="/anime" style={linkStyle}>Anime</Link></li>
              <li><Link href="/chicos" style={linkStyle}>Chicos</Link></li>
              <li><Link href="/history" style={linkStyle}>Historial</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.4rem", fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 8px", color: "rgba(255,255,255,0.2)" }}>LEGAL</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <li><Link href="/terms" style={linkStyle}>Términos</Link></li>
              <li><Link href="/privacy" style={linkStyle}>Privacidad</Link></li>
              <li><Link href="/age-notice" style={linkStyle}>Aviso +18</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.4rem", fontWeight: 600, letterSpacing: "0.08em", margin: "0 0 8px", color: "rgba(255,255,255,0.2)" }}>PAGO</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Visa", "MC", "PayPal", "Crypto"].map((t) => (
                <span key={t} style={{ fontSize: "0.4rem", fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "0.5px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--pink), var(--coral))" }}>
              <svg viewBox="0 0 24 24" style={{ width: 8, height: 8, fill: "#fff" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </div>
            <span style={{ fontSize: "0.5rem", fontWeight: 600, letterSpacing: "-0.03em" }}>NuviaChat</span>
          </div>
          <p style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.2)", textAlign: "center", margin: 0 }}>
            Personajes ficticios generados por IA. Contenido para adultos +18.
          </p>
        </div>
      </div>
    </footer>
  );
}