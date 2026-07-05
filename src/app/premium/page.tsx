"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";
import { activatePremium, isPremium } from "@/lib/storage";

const benefits = [
  "Chat ilimitado",
  "Llamadas más largas",
  "Más personalización",
  "Memoria de conversación",
  "Nuevas chicas IA",
  "Sin anuncios",
];

const TELEGRAM_USERNAME = "TU_USUARIO";
const PAYPAL_USERNAME = "TU_USUARIO";

export default function PremiumPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [premium, setPremium] = useState(false);

  function tryActivate() {
    const ok = activatePremium(code);
    setStatus(ok ? "ok" : "error");
    if (ok) setPremium(true);
  }

  const telegramHref = `https://t.me/${TELEGRAM_USERNAME}?text=Hola,%20quiero%20activar%20LunaCall%20Premium%20por%206€/mes`;
  const paypalHref = `https://paypal.me/${PAYPAL_USERNAME}/6`;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <div className="rounded-xl2 card-surface p-8 text-center shadow-glow animate-fadeUp">
          <h1 className="mb-2 text-3xl font-extrabold gradient-text">
            Desbloquea LunaCall Premium
          </h1>
          <p className="mb-1 text-4xl font-extrabold">6€/mes</p>
          <p className="mb-8 text-muted text-sm">
            Más tiempo, más mensajes y una experiencia más personal.
          </p>

          <ul className="mb-8 grid grid-cols-1 gap-2 text-left text-sm text-muted sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="rounded-xl card-surface px-3 py-2">
                ✨ {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mb-10">
            <a href={telegramHref} target="_blank" rel="noopener noreferrer">
              <NeonButton fullWidth>Activar por Telegram</NeonButton>
            </a>
            <a href={paypalHref} target="_blank" rel="noopener noreferrer">
              <NeonButton variant="secondary" fullWidth>
                Activar por PayPal
              </NeonButton>
            </a>
            <p className="text-xs text-muted">
              Pago manual. Tras pagar, recibirás tu código premium.
            </p>
          </div>

          <div className="rounded-xl2 border border-white/10 p-5 text-left">
            <p className="mb-3 font-semibold">¿Ya tienes código?</p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Introduce tu código"
                className="min-h-[48px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-pink/50"
              />
              <NeonButton onClick={tryActivate}>Activar</NeonButton>
            </div>
            {status === "ok" && (
              <p className="mt-3 text-sm text-green-400">Premium activado ✅</p>
            )}
            {status === "error" && (
              <p className="mt-3 text-sm text-pink">Código no válido.</p>
            )}
            {premium && (
              <p className="mt-2 text-xs text-muted">
                Ya tienes Premium activo en este dispositivo.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
