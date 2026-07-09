"use client";

import Link from "next/link";

const experiences = [
  { label: "NUEVA", title: "Chatea y a ver qué surge", href: "/girls", gradient: "linear-gradient(135deg, #FF3B7F, #FF5A4F)" },
  { label: "ROLEPLAY", title: "Historias IA", subtitle: "Vive una historia única", href: "/girls", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
  { label: "SHORTS", title: "Tu nueva vecina", subtitle: "Toc, toc… un favor", href: "/girls", gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)" },
  { label: "CREAR", title: "Crea tu personaje", subtitle: "Tu chica ideal", href: "#crear", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
];

export default function ExperiencesRow({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div>
      <h2 className="text-white font-bold tracking-tight mb-2.5" style={{ fontSize: "clamp(14px, 3vw, 18px)", letterSpacing: "-0.04em" }}>
        Nuevas experiencias
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {experiences.map((exp) => (
          <Link
            key={exp.label}
            href={exp.href}
            onClick={(e) => { if (exp.href === "#crear") { e.preventDefault(); onOpenCreate(); } }}
            className="relative shrink-0 overflow-hidden transition-all active:scale-[0.97]"
            style={{
              flex: "0 0 155px",
              height: 80,
              borderRadius: 12,
              background: exp.gradient,
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,11,15,0.6), rgba(11,11,15,0.05))" }} />
            <span className="absolute left-2.5 top-2 z-10 rounded-full bg-black/30 px-1.5 py-0.5 text-[0.35rem] font-semibold text-white/80 backdrop-blur-sm">
              {exp.label}
            </span>
            <div className="absolute bottom-2 left-2.5 right-2.5 z-10">
              <h3 className="text-white font-bold" style={{ fontSize: "clamp(11px, 2vw, 14px)", letterSpacing: "-0.03em" }}>{exp.title}</h3>
              {exp.subtitle && <p className="text-[0.4rem] text-white/50 mt-px">{exp.subtitle}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}