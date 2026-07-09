"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = [
    { href: "/girls", label: "Chicas" },
    { href: "/anime", label: "Anime" },
    { href: "/chicos", label: "Chicos" },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        height: 44,
        background: scrolled ? "rgba(11,11,15,0.86)" : "rgba(11,11,15,0.95)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/girls" className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF3B7F] to-[#FF5A4F] h-5 w-5">
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span className="text-[0.6rem] font-bold tracking-tight sm:text-xs" style={{ letterSpacing: "-0.04em" }}>NuviaChat</span>
        </Link>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 bg-white/[0.04] rounded-full p-0.5 border border-white/[0.06]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-2 py-0.5 text-[0.45rem] font-semibold rounded-full transition-all"
                style={{
                  background: isActive ? "rgba(255,59,127,0.15)" : "transparent",
                  color: isActive ? "#FF3B7F" : "rgba(255,255,255,0.45)",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <Link href="/girls" className="btn-secondary h-6 px-2 text-[0.45rem] font-medium leading-none tracking-tight">
            Iniciar sesión
          </Link>
          <Link href="/girls" className="btn-primary h-6 px-2.5 text-[0.45rem] font-bold leading-none tracking-tight">
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}