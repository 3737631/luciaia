"use client";

import Link from "next/link";

const experiences = [
  { label: "NUEVA", title: "Chatea y a ver qué surge", href: "/girls", bg: "linear-gradient(135deg, #FF3B86, #FF6B45)" },
  { label: "ROLEPLAY", title: "Historias IA", subtitle: "Vive una historia única", href: "/girls", bg: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
  { label: "SHORTS", title: "Tu nueva vecina", subtitle: "Toc, toc… ¿puedo pedirte un favor?", href: "/girls", bg: "linear-gradient(135deg, #0ea5e9, #38bdf8)" },
  { label: "CREAR", title: "Crea tu personaje", subtitle: "Tu chica ideal", href: "#crear", bg: "linear-gradient(135deg, #10b981, #34d399)" },
];

export default function ExperiencesRow({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div>
      <h2 className="text-white font-bold tracking-tight mb-2" style={{ fontSize: "clamp(16px, 3.5vw, 22px)" }}>
        Nuevas experiencias
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {experiences.map((exp) => (
          <Link
            key={exp.label}
            href={exp.href}
            onClick={(e) => { if (exp.href === "#crear") { e.preventDefault(); onOpenCreate(); } }}
            className="relative shrink-0 overflow-hidden rounded-xl transition-all active:scale-[0.97]"
            style={{
              flex: "0 0 160px",
              height: 90,
              background: exp.bg,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,11,15,0.7), rgba(11,11,15,0.1))" }} />
            <span className="absolute left-2.5 top-2 z-10 rounded-full bg-black/40 px-1.5 py-0.5 text-[0.4rem] font-bold text-white/90 backdrop-blur-sm">
              {exp.label}
            </span>
            <div className="absolute bottom-2 left-2.5 right-2.5 z-10">
              <h3 className="text-white font-bold" style={{ fontSize: "clamp(12px, 2.5vw, 15px)" }}>{exp.title}</h3>
              {exp.subtitle && <p className="text-[0.45rem] text-white/60 mt-0.5">{exp.subtitle}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}