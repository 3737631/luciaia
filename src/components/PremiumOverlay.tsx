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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "0 32px",
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
          zIndex: 5001,
          color: "#fff",
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <svg
        viewBox="0 0 24 24"
        width="54"
        height="54"
        fill="none"
        stroke="#FF5798"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.95 }}
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>

      <span
        style={{
          fontSize: 21,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.01em",
          textShadow: "0 2px 10px rgba(0,0,0,.5)",
        }}
      >
        {title}
      </span>

      <span
        style={{
          fontSize: 13,
          lineHeight: 1.45,
          color: "rgba(255,255,255,.78)",
          textShadow: "0 1px 6px rgba(0,0,0,.5)",
          maxWidth: 280,
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
          marginTop: 6,
          padding: "13px 30px",
          borderRadius: 999,
          border: 0,
          cursor: "pointer",
          background: "linear-gradient(135deg,#FF5798,#FF6AA5)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          boxShadow: "0 8px 28px rgba(255,87,152,.45)",
          fontFamily: "inherit",
        }}
      >
        Hazte Premium
      </button>
    </div>
  );
}
