"use client";

import Link from "next/link";

const experiences = [
  {
    label: "EN VIVO",
    title: "Chat privado",
    href: "/girls",
    // REPLACE placeholder color with real image later
    bg: "linear-gradient(135deg, #1a1a24, #0b0b0f)",
  },
  {
    label: "NUEVO",
    title: "Historias IA",
    href: "/girls",
    bg: "linear-gradient(135deg, #241a1a, #0b0b0f)",
  },
  {
    label: "TOP",
    title: "Roleplay",
    href: "/girls",
    bg: "linear-gradient(135deg, #1a1a2e, #0b0b0f)",
  },
  {
    label: "PRO",
    title: "Personalización",
    href: "/girls",
    bg: "linear-gradient(135deg, #1a241a, #0b0b0f)",
  },
];

export default function ExperiencesRow() {
  return (
    <div className="px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1180, margin: "20px auto 0" }}>
      <h2
        className="text-white"
        style={{ fontSize: "clamp(28px, 4vw, 38px)", letterSpacing: "-0.05em", margin: "0 0 16px" }}
      >
        Nuevas experiencias
      </h2>
      {/* Desktop grid */}
      <div className="hidden gap-[18px] sm:grid sm:grid-cols-4">
        {experiences.map((exp) => (
          <Link
            key={exp.label}
            href={exp.href}
            className="group relative h-[160px] overflow-hidden rounded-2xl transition-all duration-250"
            style={{
              background: exp.bg,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "rgba(255,59,127,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-350 group-hover:opacity-100"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15))",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15))",
              }}
            />
            <span
              className="absolute left-4 top-3 z-10 rounded-full px-2.5 py-1.5 text-[0.6rem] font-black text-white sm:text-xs"
              style={{ background: "#ff0f70" }}
            >
              {exp.label}
            </span>
            <h3
              className="absolute bottom-3 left-4 z-10 m-0 text-white"
              style={{ fontSize: 23, letterSpacing: "-0.04em" }}
            >
              {exp.title}
            </h3>
          </Link>
        ))}
      </div>
      {/* Mobile horizontal scroll */}
      <div
        className="flex gap-3 overflow-x-auto pb-3 sm:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {experiences.map((exp) => (
          <Link
            key={exp.label}
            href={exp.href}
            className="relative shrink-0 overflow-hidden rounded-2xl"
            style={{
              flex: "0 0 235px",
              height: 140,
              background: exp.bg,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15))",
              }}
            />
            <span
              className="absolute left-4 top-3 z-10 rounded-full px-2.5 py-1.5 text-[0.6rem] font-black text-white"
              style={{ background: "#ff0f70" }}
            >
              {exp.label}
            </span>
            <h3
              className="absolute bottom-3 left-4 z-10 m-0 text-white"
              style={{ fontSize: 23, letterSpacing: "-0.04em" }}
            >
              {exp.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
