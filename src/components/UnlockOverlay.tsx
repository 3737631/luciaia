"use client";

import { useEffect, useState } from "react";

/**
 * Overlay de desbloqueo premium: un candado que se abre y se desvanece.
 * Aparece al comprar un plan y confirma que el premium ya está activo.
 */
export default function UnlockOverlay({ plan, onDone }: { plan: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true), 350);
    const t2 = setTimeout(() => setLeaving(true), 1500);
    const t3 = setTimeout(onDone, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const label = plan === "premium_plus" ? "Premium+ activado" : "Premium activado";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
        background: "rgba(8,5,11,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}
    >
      <div style={{ position: "relative", width: 96, height: 96 }}>
        {/* Shackle (grapa) */}
        <svg
          viewBox="0 0 24 24"
          width="96" height="96"
          fill="none" stroke="#FF5798" strokeWidth="1.4" strokeLinecap="round"
          style={{ position: "absolute", inset: 0, transition: "transform 0.6s ease", transform: open ? "translateY(-3px)" : "none" }}
        >
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {/* Cuerpo del candado (se abre hacia abajo) */}
        <svg
          viewBox="0 0 24 24"
          width="96" height="96"
          fill="none" stroke="#FF5798" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
          style={{
            position: "absolute", inset: 0,
            transformOrigin: "50% 100%",
            transition: "transform 0.6s ease",
            transform: open ? "scaleY(0)" : "scaleY(1)",
          }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        </svg>
      </div>

      <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", opacity: open ? 1 : 0.3, transition: "opacity 0.5s ease" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", opacity: open ? 1 : 0.4, transition: "opacity 0.5s ease 0.15s" }}>
        Todo desbloqueado
      </span>
    </div>
  );
}
