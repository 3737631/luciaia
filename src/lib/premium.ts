"use client";

import { getDeviceId } from "@/lib/deviceId";

/**
 * premium.ts — estado del trial Premium sin registro.
 *
 * Modelo: sin login, sin IP, sin wifi. Se vincula al identificador de hardware
 * (deviceId) generado en deviceId.ts. La prueba se cuenta una vez por
 * dispositivo aunque se use en modo incógnito.
 *
 * Gating "conectable": hoy no hay pasarela de pago real, pero isFeatureLocked()
 * deja preparado el candado para funciones como la videollamada. Si en el futuro
 * existe un endpoint remoto de trial, consumeTrial() lo consulta y, si no está
 * configurado, cae con elegancia al trial local.
 */

export const PREMIUM_FEATURES = ["video"] as const;
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

const TRIAL_START_KEY = "nuvia_trial_start_v1";
const PREMIUM_KEY = "nuvia_premium_v1";
const TRIAL_HOURS = 24;
const TRIAL_MS = TRIAL_HOURS * 60 * 60 * 1000;

// Endpoint opcional de respaldo del servidor. Si no está definido, se usa solo local.
const TRIAL_ENDPOINT =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_TRIAL_ENDPOINT
    ? process.env.NEXT_PUBLIC_TRIAL_ENDPOINT
    : null;

export interface TrialStatus {
  premium: boolean;
  trialActive: boolean;
  hoursLeft: number;
  totalHours: number;
}

export function getLocalPremium(): boolean {
  try {
    return localStorage.getItem(PREMIUM_KEY) === "1";
  } catch {
    return false;
  }
}

export function setLocalPremium(value: boolean): void {
  try {
    if (value) localStorage.setItem(PREMIUM_KEY, "1");
    else localStorage.removeItem(PREMIUM_KEY);
  } catch {
    /* noop */
  }
}

export function getTrialStart(): number | null {
  try {
    const raw = localStorage.getItem(TRIAL_START_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function getTrialStatus(): TrialStatus {
  if (getLocalPremium()) {
    return { premium: true, trialActive: false, hoursLeft: TRIAL_HOURS, totalHours: TRIAL_HOURS };
  }
  const start = getTrialStart();
  if (start === null) {
    return { premium: false, trialActive: false, hoursLeft: TRIAL_HOURS, totalHours: TRIAL_HOURS };
  }
  const el = Date.now() - start;
  const leftMs = Math.max(0, TRIAL_MS - el);
  const hoursLeft = Math.max(0, Math.floor(leftMs / (60 * 60 * 1000)));
  return {
    premium: false,
    trialActive: leftMs > 0,
    hoursLeft,
    totalHours: TRIAL_HOURS,
  };
}

/** True si una función está bloqueada para este dispositivo. */
export function isFeatureLocked(feature: PremiumFeature): boolean {
  if (!PREMIUM_FEATURES.includes(feature)) return false;
  const s = getTrialStatus();
  return !s.premium && !s.trialActive;
}

/**
 * Activa/renueva el trial una sola vez por dispositivo. Consulta primero el
 * respaldo remoto si existe y cae con elegancia al local si no.
 */
export async function consumeTrial(): Promise<{ ok: boolean; trialActive: boolean }> {
  if (getLocalPremium()) return { ok: true, trialActive: false };

  if (TRIAL_ENDPOINT) {
    try {
      const deviceId = await getDeviceId();
      const res = await fetch(TRIAL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceIdHash: deviceId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { premium?: boolean; trialActive?: boolean };
        if (data.premium) {
          setLocalPremium(true);
          return { ok: true, trialActive: false };
        }
        if (data.trialActive) {
          // El servidor confirma que este dispositivo tiene trial.
          if (getTrialStart() === null) {
            try {
              localStorage.setItem(TRIAL_START_KEY, String(Date.now()));
            } catch {
              /* noop */
            }
          }
          return { ok: true, trialActive: true };
        }
        return { ok: false, trialActive: false };
      }
    } catch {
      // fall through al local
    }
  }

  // Modo local: empieza el trial ahora mismo si no ha empezado.
  if (getTrialStart() === null) {
    try {
      localStorage.setItem(TRIAL_START_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
  }
  return { ok: true, trialActive: true };
}

/** Fuerza el trial a terminar (recomienda verificar dispositivo). Solo para depuración. */
export function resetTrial(): void {
  try {
    localStorage.removeItem(TRIAL_START_KEY);
  } catch {
    /* noop */
  }
}
