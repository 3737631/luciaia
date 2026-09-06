"use client";

import Link from "next/link";

export default function Footer() {
  const colTitle = { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 14px", color: "rgba(255,255,255,0.28)" };
  const linkStyle = { color: "rgba(255,255,255,0.62)", fontSize: 13, letterSpacing: "-0.01em", textDecoration: "none", transition: "color 200ms ease" };

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#171717", marginTop: 24 }}>
      <div className="container-nuvia" style={{ paddingTop: 40, paddingBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28, marginBottom: 28 }}>
          {/* Marca */}
          <div style={{ maxWidth: 260 }}>
            <Link href="/" style={{ textDecoration: "none", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>
              nuvia<span style={{ color: "#ff5f8f" }}>.ai</span>
            </Link>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.42)", margin: "10px 0 0" }}>
              Compañía virtual +18. Todos los personajes y conversaciones están generados por inteligencia artificial.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h4 style={colTitle}>NUVIA</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Explorar", "/girls"], ["Chicas", "/girls"], ["Chicos", "/chicos"], ["Anime", "/anime"]].map(([t, href]) => (
                <li key={t}><Link href={href} style={linkStyle} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ff5f8f"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)"}>{t}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={colTitle}>LEGAL</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li><Link href="/legal" style={linkStyle} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ff5f8f"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)"}>Aviso Legal</Link></li>
              <li><Link href="/terms" style={linkStyle} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ff5f8f"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)"}>Términos</Link></li>
              <li><Link href="/privacy" style={linkStyle} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ff5f8f"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)"}>Privacidad</Link></li>
              <li><Link href="/age-notice" style={linkStyle} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ff5f8f"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)"}>Aviso +18</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={colTitle}>CONTACTO</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li><a href="mailto:fortpay107@gmail.com" style={linkStyle} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ff5f8f"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.62)"}>fortpay107@gmail.com</a></li>
              <li><span style={{ color: "rgba(255,255,255,0.42)", fontSize: 12.5 }}>Contenido generado por IA</span></li>
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #FF5798, #ff2b86)" }}>
              <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, fill: "#fff" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.6)" }}>NuviaChat</span>
          </div>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", textAlign: "center", margin: 0 }}>
            © {new Date().getFullYear()} NuviaChat · Contenido para adultos +18.
          </p>
        </div>
      </div>
    </footer>
  );
}