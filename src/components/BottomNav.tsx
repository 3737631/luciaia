"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    label: "Inicio",
    href: "/girls",
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Shorts",
    href: "#",
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: "Crear",
    href: "/customize/luna",
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    label: "Chat",
    href: "/history",
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Premium",
    href: "#",
    premium: true,
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: "calc(88px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "#171717",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        zIndex: 200,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return item.premium ? (
          <div
            key={item.label}
            style={{
              margin: "8px 8px 10px",
              borderRadius: 15,
              background: "linear-gradient(180deg, rgba(138,106,32,0.55), rgba(71,54,14,0.85))",
              color: "rgba(255,255,255,0.78)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              fontSize: 13,
              fontWeight: 650,
              border: 0,
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              fontSize: 13,
              fontWeight: 650,
              color: isActive ? "#ff5f8f" : "#a8a8a8",
              textDecoration: "none",
              border: 0,
              background: "transparent",
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
