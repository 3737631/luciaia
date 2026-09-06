"use client";

import Link from "next/link";

const links = [
  { label: "Explorar", href: "/girls" },
  { label: "Chicas", href: "/girls" },
  { label: "Chicos", href: "/chicos" },
  { label: "Anime", href: "/anime" },
];

const legal = [
  { label: "Aviso Legal", href: "/legal" },
  { label: "Términos", href: "/terms" },
  { label: "Privacidad", href: "/privacy" },
  { label: "Aviso +18", href: "/age-notice" },
];

export default function Footer() {
  const colTitle = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    margin: "0 0 14px",
    color: "rgba(255,255,255,0.30)",
    textTransform: "uppercase" as const,
  };
  const linkStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    letterSpacing: "-0.01em",
    textDecoration: "none",
    lineHeight: 1,
    margin: "7px 0",
    display: "inline-block",
  };

  const Col = ({ title, items }: { title: string; items: { label: string; href: string }[] }) => (
    <div>
      <h4 style={colTitle}>{title}</h4>
      {items.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="footer-link"
          style={linkStyle}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#171717", marginTop: 24 }}>
      <div className="container-nuvia" style={{ paddingTop: 36, paddingBottom: 28 }}>
        {/* Cuadrícula que rellena todo el ancho */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
            gap: 24,
          }}
          className="footer-grid"
        >
          {/* Marca */}
          <div style={{ paddingRight: 12 }}>
            <Link href="/" style={{ textDecoration: "none", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>
              nuvia<span style={{ color: "#ff5f8f" }}>.ai</span>
            </Link>
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "rgba(255,255,255,0.42)", margin: "10px 0 0", maxWidth: 220 }}>
              Compañía virtual +18. Todos los personajes y conversaciones están generados por inteligencia artificial.
            </p>
          </div>

          <Col title="Explora" items={links} />
          <Col title="Legal" items={legal} />

          {/* Contacto */}
          <div>
            <h4 style={colTitle}>Contacto</h4>
            <a href="mailto:fortpay107@gmail.com" className="footer-link" style={{ ...linkStyle, display: "block" }}>
              fortpay107@gmail.com
            </a>
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,87,152,0.10)",
                border: "1px solid rgba(255,87,152,0.20)",
                fontSize: 11,
                fontWeight: 600,
                color: "#ff5f8f",
                whiteSpace: "nowrap",
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: "currentColor" }}><path d="M12 2l2.4 7.2L22 9.6l-5.6 4.8 1.6 7.6L12 18l-6 4 1.6-7.6L2 9.6l7.6-.4z" /></svg>
              Generado por IA
            </div>
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "8px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #FF5798, #ff2b86)" }}>
              <svg viewBox="0 0 24 24" style={{ width: 9, height: 9, fill: "#fff" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.6)" }}>NuviaChat</span>
          </div>
          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.30)" }}>© {new Date().getFullYear()}</span>
          <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.30)" }}>Contenido para adultos +18.</span>
        </div>
      </div>
    </footer>
  );
}