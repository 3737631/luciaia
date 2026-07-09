"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, MessageCircle, User, Search } from "lucide-react";

const tabs = [
  { label: "Chicas", href: "/girls" },
  { label: "Chicos", href: "/chicos" },
  { label: "Anime", href: "/anime" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50"
      style={{ paddingTop: "var(--safe-top)", background: "rgba(5,5,7,0.88)", backdropFilter: "blur(28px) saturate(180%)", WebkitBackdropFilter: "blur(28px) saturate(180%)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
    >
      <div className="container-nuvia flex items-center justify-between" style={{ height: "var(--header-h)" }}>
        <Link href="/" className="flex items-center gap-1.5 no-underline shrink-0">
          <span style={{ background: "linear-gradient(135deg, #ff2d75, #ff5b6e)", borderRadius: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>N</span>
          <span className="font-semibold tracking-tight" style={{ fontSize: "0.7rem", color: "var(--text)" }}>uvia</span>
        </Link>

        <nav className="flex-1 flex justify-center px-3">
          <div className="segmented-control">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link key={tab.href} href={tab.href} className={isActive ? "active" : ""}>
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button className="btn-pill flex items-center gap-1" style={{ fontSize: "0.55rem", height: 24, padding: "0 10px" }}>
            <Sparkles size={10} />
            <span className="hidden sm:inline">Crear</span>
          </button>
        </div>
      </div>
    </header>
  );
}