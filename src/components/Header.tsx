"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

const tabs = [
  { label: "Chicas", href: "/girls" },
  { label: "Chicos", href: "/chicos" },
  { label: "Anime", href: "/anime" },
];

export default function Header({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        paddingTop: "var(--safe-top)",
        background: "rgba(5,5,7,0.88)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="container-nuvia flex items-center justify-between"
        style={{ height: "var(--header-h)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 no-underline shrink-0"
        >
          <span
            style={{
              background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
              borderRadius: 6,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            N
          </span>
          <span
            className="font-semibold tracking-tight"
            style={{ fontSize: "0.7rem", color: "var(--text)" }}
          >
            uvia
          </span>
        </Link>

        <nav className="flex items-center gap-0" style={{ margin: "0 auto" }}>
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  position: "relative",
                  transition: "color 180ms ease",
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 16,
                      height: 2,
                      borderRadius: 1,
                      background: "#ff2d75",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={onOpenCreate}
          className="shrink-0"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #ff2d75, #ff5b6e)",
            color: "#fff",
            border: 0,
            cursor: "pointer",
            transition: "opacity 180ms ease",
          }}
        >
          <Sparkles size={13} />
        </button>
      </div>
    </header>
  );
}
