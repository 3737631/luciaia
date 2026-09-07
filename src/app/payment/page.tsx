"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";
import AccountModal from "@/components/AccountModal";
import { payments } from "@/lib/payments";
import { applyServerPlan } from "@/lib/premium";
import { supabase } from "@/lib/supabase";

type State = "loading" | "ok" | "cancel" | "error" | "need_account";

const POLL_TIMEOUT_MS = 45000;

function PaymentInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string>("Confirmando tu pago…");
  const [accountOpen, setAccountOpen] = useState(false);
  const ran = useRef<string | null>(null);

  async function confirm() {
    const token = params.get("token");
    const result = params.get("result");
    const subSession = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("nuvia_pending_sub") : null;

    const { data } = await supabase.auth.getSession();
    const hasSession = Boolean(data.session);

    await waitForSession(hasSession);

    if (!hasSession && (token || subSession)) {
      setAccountOpen(true);
      setState("need_account");
      return;
    }

    try {
      if (token) {
        const r = await payments.captureOrder(token);
        applyServerPlan({ plan: r.plan, active: true, expiresAt: r.expiresAt });
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("nuvia_unlock_pending", "1");
        }
        setState("ok");
        return;
      }
      if (result === "cancel") {
        setState("cancel");
        return;
      }
      if (subSession) {
        setMessage("Activando tu suscripción…");
        const t0 = Date.now();
        while (Date.now() - t0 < POLL_TIMEOUT_MS) {
          const st = await payments.status();
          if (st.active && st.plan) {
            applyServerPlan({ plan: st.plan, active: true, expiresAt: st.expiresAt });
            sessionStorage.removeItem("nuvia_pending_sub");
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem("nuvia_unlock_pending", "1");
            }
            setState("ok");
            return;
          }
          await new Promise((r) => setTimeout(r, 2500));
        }
        setState("error");
        setMessage("Tu suscripción aún no está activa. Puede tardar unos minutos, vuelve a comprobar el estado.");
        return;
      }
      const st = await payments.status();
      if (st.active && st.plan) {
        applyServerPlan({ plan: st.plan, active: true, expiresAt: st.expiresAt });
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("nuvia_unlock_pending", "1");
        }
        setState("ok");
      } else {
        setState("cancel");
      }
    } catch (err) {
      try {
        const st = await payments.status();
        if (st.active && st.plan) {
          applyServerPlan({ plan: st.plan, active: true, expiresAt: st.expiresAt });
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("nuvia_unlock_pending", "1");
          }
          setState("ok");
          return;
        }
      } catch {
        /* el fallback de estado no está disponible */
      }
      setState("error");
      setMessage(err instanceof Error ? err.message : "No se pudo confirmar el pago");
    }
  }

  async function waitForSession(hasSession: boolean) {
    if (hasSession) return;
    const t0 = Date.now();
    while (Date.now() - t0 < 8000) {
      const { data } = await supabase.auth.getSession();
      if (data.session) return;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  useEffect(() => {
    const key = params.toString();
    if (ran.current === key) return;
    ran.current = key;
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading" || state === "need_account") return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
        <div
          className="glass"
          style={{
            maxWidth: 420,
            width: "100%",
            borderRadius: 20,
            padding: "28px 24px",
            textAlign: "center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}
        >
          {state === "ok" && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: "0 auto 14px",
                  borderRadius: "50%",
                  background: "rgba(52,211,153,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h1 className="gradient-text text-3xl font-extrabold">¡Pago confirmado!</h1>
              <p style={{ margin: "10px 0 20px", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                Tu plan está activo. Ya puedes disfrutar de todas las funciones Premium.
              </p>
              <NeonButton onClick={() => router.push("/girls")}>Empezar a chatear</NeonButton>
            </>
          )}

          {state === "cancel" && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: "0 auto 14px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white">Pago no completado</h1>
              <p style={{ margin: "10px 0 20px", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                Cancelaste el pago o no llegó a confirmarse. Puedes volver a intentarlo cuando quieras.
              </p>
              <Link href="/premium" className="block w-full">
                <NeonButton fullWidth>Elegir otro plan</NeonButton>
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: "0 auto 14px",
                  borderRadius: "50%",
                  background: "rgba(255,95,143,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff5f8f" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white">Esto tardó más de lo esperado</h1>
              <p style={{ margin: "10px 0 20px", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{message}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <NeonButton variant="secondary" onClick={confirm} className="flex-1">Reintentar</NeonButton>
                <Link href="/premium" className="flex-1">
                  <NeonButton fullWidth>Volver a planes</NeonButton>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} onDone={() => { setAccountOpen(false); setTimeout(confirm, 300); }} />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentInner />
    </Suspense>
  );
}