"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";
import { setPlan, resetFreeCallSeconds, resetTrial } from "@/lib/premium";
import UnlockOverlay from "@/components/UnlockOverlay";

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

  function choosePlan(planId: "free" | "premium" | "premium_plus") {
    if (planId === "free") {
      resetFreeCallSeconds();
      resetTrial();
      setPlan(planId);
      router.push("/girls");
      return;
    }
    setPlan(planId);
    setUnlock(planId);
  }

  return (
    <>
      {unlock && <UnlockOverlay plan={unlock} onDone={() => router.push("/girls")} />}
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
            const price = isPaid ? (billing === "monthly" ? p.monthly : p.annual) : p.price;
            return (
              <div
                key={p.name}
                className={
                  "glass rounded-xl3 p-6 text-center " +
                  (p.highlight ? "ring-2 ring-pink shadow-glow md:-mt-3 md:mb-3" : "glass-hover")
                }
              >
                <p className={"mb-3 text-sm font-semibold tracking-wide uppercase " + (p.highlight ? "text-pink" : "text-muted")}>
                  {p.name}
                </p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold gradient-text">{price}</span>
                  <span className="text-sm text-muted/70"> {p.period}</span>
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
                <button type="button" onClick={() => choosePlan(p.planId)} className="w-full">
                  {p.highlight ? <NeonButton>{p.cta}</NeonButton> : <span className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted transition hover:bg-white/5">{p.cta}</span>}
                </button>
              </div>
            );
          })}
        </section>

        <p className="mx-auto mt-6 max-w-2xl pb-4 text-center text-[11px] leading-relaxed text-muted/50">
          Al hacerte Premium aceptas los{" "}
          <Link href="/terms" className="underline text-muted/70">Términos del Servicio</Link> y la{" "}
          <Link href="/privacy" className="underline text-muted/70">Política de Privacidad</Link>.
          El pago se activará próximamente mediante pasarela segura; hasta entonces el plan se activa
          sin coste. Derecho de desistimiento de 14 días: en el contenido digital de entrega inmediata
          se pierde al aceptar expresamente el inicio del servicio y reconocer esta pérdida.
        </p>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-lg rounded-xl3 glass p-6 text-center shadow-glow sm:p-10">
            <p className="mb-2 text-sm text-pink font-semibold tracking-wide uppercase">Empieza sin compromiso</p>
            <p className="mb-4 text-5xl font-extrabold gradient-text">Prueba gratis</p>
            <p className="mb-8 text-sm text-muted/70 leading-relaxed">
              Explora el chat y las llamadas sin registro. Actualiza a Premium cuando quieras.
            </p>
            <Link href="/girls">
              <NeonButton>Probar ahora</NeonButton>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
