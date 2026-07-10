"use client";

import Link from "next/link";

const experiences = [
  {
    label: "En vivo",
    title: "Chatea ahora",
    subtitle: "Conexión instantánea",
    href: "/girls",
    bg: "linear-gradient(135deg, #FF5798, #FF7A6A)",
  },
  {
    label: "Historias",
    title: "Momentos únicos",
    subtitle: "Contenido exclusivo",
    href: "/girls",
    bg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  {
    label: "Nuevas",
    title: "Recién llegadas",
    subtitle: "Descúbrelas",
    href: "/girls",
    bg: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  },
  {
    label: "Populares",
    title: "Las más queridas",
    subtitle: "Top personajes",
    href: "/girls",
    bg: "linear-gradient(135deg, #10b981, #34d399)",
  },
];

export default function ExperiencesSection() {
  return (
    <section style={{ padding: "24px 16px 8px" }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          margin: "0 0 14px",
          color: "#fff",
        }}
      >
        Descubre nuevas experiencias
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {experiences.map((exp) => (
          <Link
            key={exp.label}
            href={exp.href}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              height: 100,
              borderRadius: 16,
              padding: 14,
              textDecoration: "none",
              background: exp.bg,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.05))",
              }}
            />
            <span
              style={{
                position: "relative",
                zIndex: 1,
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.8)",
                background: "rgba(0,0,0,0.25)",
                borderRadius: 999,
                padding: "2px 8px",
                alignSelf: "flex-start",
                marginBottom: 4,
              }}
            >
              {exp.label}
            </span>
            <h3
              style={{
                position: "relative",
                zIndex: 1,
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {exp.title}
            </h3>
            {exp.subtitle && (
              <p
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  margin: "2px 0 0",
                }}
              >
                {exp.subtitle}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
