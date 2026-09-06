"use client";

import { useRouter } from "next/navigation";

export default function PremiumOverlay({
  title = "Función Premium",
  subtitle = "Hazte Premium para desbloquear esta función y mucho más.",
  onClose,
}: {
  title?: string;
  subtitle?: string;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "rgba(8,4,10,0.34)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.18)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 5002,
          color: "#fff",
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        style={{
          width: "min(360px, calc(100vw - 40px))",
          margin: "0 auto",
          background: "rgba(20,14,19,0.92)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 26,
          boxShadow: "0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)",
          padding: "clamp(26px, 7vw, 38px) clamp(20px, 6vw, 32px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        <div
          style={{
            width: "clamp(56px, 16vw, 68px)",
            height: "clamp(56px, 16vw, 68px)",
            borderRadius: "50%",
            background: "rgba(255,87,152,0.14)",
            border: "1px solid rgba(255,87,152,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="clamp(26px, 7vw, 30px)"
            height="clamp(26px, 7vw, 30px)"
            fill="none"
            stroke="#FF5798"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <span
          style={{
            marginTop: "clamp(18px, 5vw, 22px)",
            fontSize: "clamp(19px, 5.4vw, 22px)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </span>

        <span
          style={{
            marginTop: 10,
            fontSize: "clamp(12.5px, 3.6vw, 14px)",
            lineHeight: 1.5,
            color: "rgba(255,255,255,.72)",
            maxWidth: "min(280px, 76vw)",
          }}
        >
          {subtitle}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push("/premium");
          }}
          style={{
            marginTop: "clamp(24px, 7vw, 30px)",
            width: "100%",
            minHeight: 52,
            borderRadius: 16,
            border: 0,
            cursor: "pointer",
            background: "linear-gradient(135deg,#FF5798,#FF6AA5)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "clamp(15px, 4.2vw, 16px)",
            letterSpacing: "-0.01em",
            boxShadow: "0 12px 32px rgba(255,87,152,.4)",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Hazte Premium
        </button>
      </div>
    </div>
  );
}