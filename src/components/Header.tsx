"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const tabs = [
    { href: "/girls", label: "Chicas" },
    { href: "/anime", label: "Anime" },
    { href: "/chicos", label: "Chicos" },
  ];

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(30px) saturate(1.2)",
        WebkitBackdropFilter: "blur(30px) saturate(1.2)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="mx-auto flex h-[3.25rem] max-w-screen-md items-center justify-between px-5"
      >
        <Link href="/girls" className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #FF2D7A, #FF5A4F)" }}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            NuviaChat
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 p-0.5" style={{ background: "rgba(255,255,255,0.06)", borderRadius: 999, border: "0.5px solid rgba(255,255,255,0.06)" }}>
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-3 py-1 text-xs font-medium rounded-full transition-all"
                style={{
                  background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  letterSpacing: "-0.02em",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <button
            className="flex h-7 items-center rounded-full px-3 text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #FF2D7A, #FF5A4F)", letterSpacing: "-0.02em" }}
          >
            Crear
          </button>
        </div>
      </div>
    </header>
  );
}