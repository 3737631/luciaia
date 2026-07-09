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
        height: "var(--header-h)",
        background: "rgba(11,11,15,0.86)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-nuvia flex h-full items-center justify-between">
        <Link href="/girls" className="flex items-center gap-2 shrink-0">
          <span
            className="flex items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #FF3B7F, #FF5A4F)", width: 22, height: 22 }}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)", letterSpacing: "-0.04em" }}
          >
            NuviaChat
          </span>
        </Link>

        <nav
          className="flex items-center gap-0.5 p-0.5"
          style={{ background: "rgba(255,255,255,0.06)", borderRadius: 999, border: "0.5px solid rgba(255,255,255,0.06)" }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-2.5 py-1 text-[0.6rem] font-semibold rounded-full transition-all sm:text-xs sm:px-3"
                style={{
                  background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  letterSpacing: "-0.02em",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/girls"
            className="btn-ghost hidden sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/girls"
            className="btn-pill"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}