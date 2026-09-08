"use client";

import { useState } from "react";
import { payments } from "@/lib/payments";
import NeonButton from "@/components/NeonButton";
import Link from "next/link";
import { UpgradeOffer, formatEuro } from "@/lib/pricing";

interface Props {
  plan: "premium" | "premium_plus";
  open: boolean;
  onClose: () => void;
  onPaid: (info: { plan: "premium" | "premium_plus"; expiresAt: string }) => void;
  offer?: UpgradeOffer | null;
}

const OPTIONS: Record<"premium" | "premium_plus", { monthly: number; annual: number }> = {
  premium: { monthly: 7.99, annual: 71.88 },
  premium_plus: { monthly: 15.99, annual: 143.88 },
};

const NAMES: Record<"premium" | "premium_plus", string> = {
  premium: "Premium",
  premium_plus: "Premium+",
};

export default function PurchaseDialog({ plan, open, onClose, onPaid, offer }: Props) {
  const [busy, setBusy] = useState<"one_month" | "one_year" | "subscription" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const prices = OPTIONS[plan];
  const monthly = offer ? offer.monthlyCharge : prices.monthly;
  const annual = offer ? offer.annualCharge : prices.annual;

  async function start(kind: "one_month" | "one_year" | "subscription") {
    setBusy(kind);
    setError(null);
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("nuvia_pending_plan", plan);
      }
      if (kind === "subscription") {
        const r = await payments.createSubscription(plan);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("nuvia_pending_sub", r.subscriptionId);
        }
        window.location.href = r.approveUrl;
        return;
      }
      const billing = kind === "one_year" ? "annual" : "monthly";
      const r = await payments.createOrder(plan, billing);
      window.location.href = r.approveUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setBusy(null);
    }
  }

  const overlay = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 960,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "rgba(8,5,11,0.92)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 480,
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "20px 18px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  };

  const optionStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
    textAlign: "left",
    background: "rgba(255,255,255,0.04)",
    border: active ? "1px solid rgba(255,95,143,0.6)" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "12px 14px",
    color: "#fff",
    cursor: "pointer",
    marginBottom: 8,
    transition: "border-color 0.15s ease",
  });

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>{NAMES[plan]}</span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: "none", border: 0, color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Elige cómo quieres pagar con PayPal:</p>

        {offer && (
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#4ade80" }}>
            Oferta por subir de plan: te descontamos {formatEuro(offer.credit)} por los días restantes de tu plan actual.
          </p>
        )}

        <button disabled={busy !== null} style={optionStyle(busy === "one_month")} onClick={() => start("one_month")} className="press">
          <span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>1 mes · pago único</span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {formatEuro(monthly)} {offer ? `(en vez de ${formatEuro(prices.monthly)})` : "· acceso durante 30 días"}
            </span>
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#ff5f8f" }}>{formatEuro(monthly)}</span>
        </button>

        <button disabled={busy !== null} style={optionStyle(busy === "one_year")} onClick={() => start("one_year")} className="press">
          <span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>1 año · pago único</span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {formatEuro(annual)} {offer ? `(en vez de ${formatEuro(prices.annual)})` : "· ahorras un 25%"}
            </span>
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#ff5f8f" }}>{formatEuro(annual)}</span>
        </button>

        <button disabled={busy !== null} style={optionStyle(busy === "subscription")} onClick={() => start("subscription")} className="press">
          <span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>Suscripción mensual automática</span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {offer ? (
                <>Primera cuota {formatEuro(monthly)}, luego {formatEuro(prices.monthly)}/mes</>
              ) : (
                <>{formatEuro(prices.monthly)}/mes · se renueva cada mes, cancela cuando quieras</>
              )}
            </span>
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#ff5f8f" }}>{offer ? formatEuro(monthly) : formatEuro(prices.monthly)}</span>
        </button>

        {error && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#ff5f8f" }}>{error}</p>}

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "14px 0 4px" }} />
        <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.5, color: "rgba(255,255,255,0.45)" }}>
          Pago seguro tramitado por PayPal. Al comprar aceptas los{" "}
          <Link href="/terms" className="text-pink underline">términos</Link>. Como es contenido digital de entrega
          inmediata, el derecho de desistimiento de 14 días se pierde al activar el servicio.
        </p>
      </div>
    </div>
  );
}