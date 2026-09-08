"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";
import { setPlan, resetFreeCallSeconds, resetTrial, applyServerPlan } from "@/lib/premium";
import UnlockOverlay from "@/components/UnlockOverlay";
import AccountModal from "@/components/AccountModal";
import PurchaseDialog from "@/components/PurchaseDialog";
import { payments, ServerStatus } from "@/lib/payments";
import { supabase } from "@/lib/supabase";

type Billing = "monthly" | "annual";

const plans = [
  {
    name: "Gratis",
    planId: "free" as const,
    price: "0€",
    period: "para siempre",
    highlight: false,
    features: [
      "Chat por texto con todos los personajes",
      "20 mensajes de texto por día",
      "Llamada de voz (1 min al día)",
      "Historias de todas las chicas",
      "Directos: 5 segundos de vista previa",
      "Videollamada: 2 segundos de vista previa",
      "Crear 1 chica por día",
      "Modo incógnito: conversación privada y segura",
    ],
    cta: "Empezar gratis",
    href: "/girls",
  },
  {
    name: "Premium",
    planId: "premium" as const,
    monthly: "7,99€",
    annual: "5,99€",
    annualHint: "71,88€/año · ahorras un 25%",
    period: "/ mes",
    highlight: true,
    features: [
      "200 mensajes de texto por día",
      "Llamadas de voz sin límite de minutos",
      "Videollamadas cara a cara sin cortes",
      "Directos completos, sin vista previa ni borrones",
      "Enviar fotos y recibir reacciones",
      "Notas de voz para enviar y oírlas",
      "Respuestas más largas y detalladas",
      "Crear 5 chicas por día",
      "Modo incógnito reforzado: máxima seguridad y privacidad",
    ],
    cta: "Hacerme Premium",
    href: "/girls",
  },
  {
    name: "Premium+",
    planId: "premium_plus" as const,
    monthly: "15,99€",
    annual: "11,99€",
    annualHint: "143,88€/año · ahorras un 25%",
    period: "/ mes",
    highlight: false,
    features: [
      "Mensajes de texto sin límite",
      "Videollamadas cara a cara sin cortes",
      "Directos completos, sin vista previa ni borrones",
      "Enviar fotos y recibir reacciones",
      "Notas de voz para enviar y oírlas",
      "Respuestas más largas y detalladas",
      "Crear chicas sin límite al día",
      "Modo incógnito reforzado: máxima seguridad y privacidad",
      "Memoria extendida: recuerda más conversación",
      "Soporte prioritario 24/7",
    ],
    cta: "Ir a Premium+",
    href: "/girls",
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [unlock, setUnlock] = useState<"premium" | "premium_plus" | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [purchasePlan, setPurchasePlan] = useState<"premium" | "premium_plus" | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [server, setServer] = useState<ServerStatus | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const activePlan: "premium" | "premium_plus" | null =
    server?.active && (server.plan === "premium" || server.plan === "premium_plus") ? server.plan : null;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSessionEmail(s?.user?.email ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sessionEmail) { setServer(null); return; }
    let mounted = true;
    payments.status()
      .then((st: ServerStatus) => {
        if (!mounted) return;
        setServer(st);
        applyServerPlan(st);
        if (st.active && st.plan) {
          try {
            if (sessionStorage.getItem("nuvia_unlock_pending") === "1") {
              sessionStorage.removeItem("nuvia_unlock_pending");
              setUnlock(st.plan);
            }
          } catch {
            /* noop */
          }
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [sessionEmail]);

  async function cancelSubscription() {
    if (!server?.subscriptionId) return;
    setCancelling(true);
    try {
      await payments.cancelSubscription(server.subscriptionId);
      await payments.status().then((st: ServerStatus) => setServer(st));
    } catch {
      /* noop */
    } finally {
      setCancelling(false);
    }
  }

  function choosePlan(planId: "free" | "premium" | "premium_plus") {
    if (planId === "free") {
      resetFreeCallSeconds();
      resetTrial();
      setPlan(planId);
      router.push("/girls");
      return;
    }
    if (sessionEmail) {
      setPurchasePlan(planId);
    } else {
      setAccountOpen(true);
      setPurchasePlan(planId);
    }
  }

  return (
    <>
      {unlock && <UnlockOverlay plan={unlock} onDone={() => router.push("/girls")} />}
      <AccountModal
        open={accountOpen}
        onClose={() => { setAccountOpen(false); setPurchasePlan(null); }}
        onDone={() => {
          setAccountOpen(false);
          setPurchasePlan((p) => p);
        }}
      />
      <PurchaseDialog
        plan={purchasePlan ?? "premium"}
        open={purchasePlan !== null && !accountOpen}
        onClose={() => setPurchasePlan(null)}
        onPaid={(info) => {
          applyServerPlan({ plan: info.plan, active: true, expiresAt: info.expiresAt });
          setUnlock(info.plan);
        }}
      />
      <Header />
      <main className="mx-auto max-w-6xl overflow-x-hidden px-4 pb-24 sm:px-5">
        <section className="py-16 text-center sm:py-20">
          <p className="mb-3 text-sm font-semibold tracking-wide uppercase text-pink">Planes y funciones</p>
          <h1 className="mx-auto max-w-2xl text-5xl font-extrabold leading-[1.1] gradient-text sm:text-6xl">
            NuviaChat Premium
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted/80 leading-relaxed">
            Desbloquea llamadas sin límites, fotos privadas, notas de voz y mucho más.
            Un pago, todos los beneficios.
          </p>
          <p className="mt-3 text-xs text-muted/60">+18 &middot; Sin registro &middot; Cancela cuando quieras</p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={
                "rounded-full px-5 py-2 text-sm font-semibold transition " +
                (billing === "monthly" ? "bg-pink text-white shadow" : "text-muted/70 hover:text-muted")
              }
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={
                "rounded-full px-5 py-2 text-sm font-semibold transition " +
                (billing === "annual" ? "bg-pink text-white shadow" : "text-muted/70 hover:text-muted")
              }
            >
              Anual
              <span className="ml-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-[11px] font-bold text-green-300">-25%</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p) => {
            const isPaid = p.monthly !== undefined;
            const rank: Record<string, number> = { free: 0, premium: 1, premium_plus: 2 };
            const isCurrent = isPaid && activePlan === p.planId;
            const isLockedLower =
              activePlan !== null && isPaid && rank[p.planId] < rank[activePlan];
            const isUpgrade = isPaid && !isCurrent && activePlan !== null && rank[p.planId] > rank[activePlan];
            const isFreeLocked = p.planId === "free" && activePlan !== null;
            const isDimmed = isLockedLower || isFreeLocked;
            const price = isPaid ? (billing === "monthly" ? p.monthly : p.annual) : p.price;
            return (
              <div
                key={p.name}
                className={
                  "glass rounded-xl3 p-6 text-center transition-all " +
                  (isCurrent && p.highlight
                    ? "ring-2 ring-green-300 shadow-glow md:-mt-3 md:mb-3"
                    : p.highlight && !isLockedLower
                      ? "ring-2 ring-pink shadow-glow md:-mt-3 md:mb-3"
                      : "glass-hover") +
                  (isDimmed ? " opacity-50" : "")
                }
              >
                {isCurrent && (
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-green-300/40 bg-green-500/10 px-3 py-1 text-[11px] font-bold text-green-300">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    TU PLAN ACTUAL
                  </span>
                )}
                <p className={"mb-3 text-sm font-semibold tracking-wide uppercase " + (p.highlight ? (isCurrent ? "text-green-300" : "text-pink") : "text-muted")}>
                  {p.name}
                </p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold gradient-text">{price}</span>
                  <span className="text-sm text-muted/70">{` ${p.period}`}</span>
                </div>
                {isPaid && billing === "annual" && (
                  <p className="text-[11px] font-semibold text-green-300/90">{p.annualHint}</p>
                )}
                <ul className="my-6 space-y-2 text-left">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted/80">
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-pink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <NeonButton fullWidth disabled>
                    Plan activo
                  </NeonButton>
                ) : isFreeLocked || isLockedLower ? (
                  <NeonButton fullWidth disabled>
                    Ya tienes un plan
                  </NeonButton>
                ) : p.highlight ? (
                  <NeonButton onClick={() => choosePlan(p.planId)} fullWidth>
                    {p.cta}
                  </NeonButton>
                ) : (
                  <button type="button" onClick={() => choosePlan(p.planId)} className="w-full">
                    <span className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:bg-white/5">{p.cta}</span>
                  </button>
                )}
              </div>
            );
          })}
        </section>

        <p className="mx-auto mt-6 max-w-2xl pb-4 text-center text-[11px] leading-relaxed text-muted/50">
          Al hacerte Premium aceptas los <Link href="/terms" className="underline text-muted/70">Términos del Servicio</Link> y la <Link href="/privacy" className="underline text-muted/70">Política de Privacidad</Link>.
          Pago seguro tramitado por PayPal. Derecho de desistimiento de 14 días: en el contenido digital
          de entrega inmediata se pierde al aceptar expresamente el inicio del servicio y reconocer esta pérdida.
        </p>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-lg rounded-xl3 glass p-6 text-center shadow-glow sm:p-10">
            {sessionEmail ? (
              <>
                <p className="mb-2 text-sm text-pink font-semibold tracking-wide uppercase">Mi suscripción</p>
                <p className="mb-1 text-3xl font-extrabold text-white break-all">{sessionEmail}</p>
                {server?.active && server.plan ? (
                  <>
                    <p className="mt-2 text-sm text-green-300 font-semibold">
                      {server.plan === "premium_plus" ? "Premium+ activado" : "Premium activado"}
                    </p>
                    {server.expiresAt && (
                      <p className="mb-4 text-xs text-muted/70">
                        Válido hasta {new Date(server.expiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 mb-4 text-sm text-muted/70">Sin suscripción activa.</p>
                )}
                <div className="flex flex-wrap justify-center gap-3">
                  {server?.recurring && server.subscriptionId ? (
                    <button
                      type="button"
                      onClick={cancelSubscription}
                      disabled={cancelling}
                      className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:bg-white/5 disabled:opacity-50"
                    >
                      {cancelling ? "Cancelando…" : "Cancelar suscripción"}
                    </button>
                  ) : (
                    <NeonButton onClick={() => setPurchasePlan("premium")} fullWidth>
                      Hacerme Premium
                    </NeonButton>
                  )}
                  <button
                    type="button"
                    onClick={async () => { await supabase.auth.signOut(); }}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:bg-white/5"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-pink font-semibold tracking-wide uppercase">Empieza sin compromiso</p>
                <p className="mb-4 text-5xl font-extrabold gradient-text">Prueba gratis</p>
                <p className="mb-8 text-sm text-muted/70 leading-relaxed">
                  Explora el chat y las llamadas sin registro. Crea tu cuenta y paga con PayPal cuando quieras.
                </p>
                <Link href="/girls">
                  <NeonButton>Probar ahora</NeonButton>
                </Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
