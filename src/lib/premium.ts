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

export const PREMIUM_FEATURES = ["video", "live", "create"] as const;
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

export type Plan = "free" | "premium" | "premium_plus";

const TRIAL_START_KEY = "nuvia_trial_start_v1";
const PREMIUM_KEY = "nuvia_premium_v1";
const PLAN_KEY = "nuvia_plan_v1";
const CREATE_LAST_KEY = "nuvia_create_last_v1";
const CALL_SECONDS_KEY = "nuvia_call_seconds_v1";
const TRIAL_HOURS = 24;
const TRIAL_MS = TRIAL_HOURS * 60 * 60 * 1000;

/** Segundos de llamada gratis al día (1 minuto en total entre todas las chicas). */
export const FREE_CALL_SECONDS_PER_DAY = 60;

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
    if (value) {
      localStorage.setItem(PREMIUM_KEY, "1");
      localStorage.setItem(PLAN_KEY, "premium");
    } else {
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(PLAN_KEY);
    }
  } catch {
    /* noop */
  }
}

/**
 * Plan suscrito del dispositivo. "premium_plus" y "premium" desbloquean todo;
 * "free" aplica los candados (directos con blur, crear 1/día, etc.).
 * La prueba de 24h se comporta como premium temporal hasta que se conecte el pago.
 */
export function getPlan(): Plan {
  try {
    const p = localStorage.getItem(PLAN_KEY);
    if (p === "premium" || p === "premium_plus") return p;
  } catch {
    /* noop */
  }
  return "free";
}

/**
 * Activa un plan de pago (para cuando se conecte la pasarela).
 * NO depende del trial; persiste el plan y lo considera premium ilimitado.
 */
export function setPlan(plan: Plan): void {
  try {
    if (plan === "free") {
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(PLAN_KEY);
    } else {
      localStorage.setItem(PREMIUM_KEY, "1");
      localStorage.setItem(PLAN_KEY, plan);
    }
  } catch {
    /* noop */
  }
}

/** Desbloquea/revoca el premium por depuración o por la pasarela de pago. */
export function clearPremium(locked: boolean): boolean {
  try {
    if (locked) {
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(PLAN_KEY);
      localStorage.removeItem(TRIAL_START_KEY);
      return true;
    }
  } catch {
    /* noop */
  }
  return false;
}

/** Fecha local "yyyy-mm-dd" del día actual. */
function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Número de chicas creadas hoy (a efectos del límite de 1/día para gratis). */
export function getCreatedToday(): number {
  try {
    const raw = localStorage.getItem(CREATE_LAST_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { day: string; count: number };
    return data && data.day === todayKey() ? data.count : 0;
  } catch {
    return 0;
  }
}

/** Registra una creación de chica (incrementa el contador diario). */
export function recordGirlCreation(): void {
  try {
    localStorage.setItem(CREATE_LAST_KEY, JSON.stringify({ day: todayKey(), count: getCreatedToday() + 1 }));
  } catch {
    /* noop */
  }
}

/** True si el usuario gratis puede crear otra chica hoy (limite 1/día). */
export function canCreateGirl(failReason?: { dayLimit: number }): boolean {
  const created = getCreatedToday();
  return created < 1;
}

/** Segundos de llamada (voz/vídeo) ya consumidos hoy por los usuarios gratis. */
export function getFreeSecondsUsedToday(): number {
  try {
    const raw = localStorage.getItem(CALL_SECONDS_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { day: string; seconds: number };
    return data && data.day === todayKey() ? Math.max(0, Math.floor(data.seconds)) : 0;
  } catch {
    return 0;
  }
}

/** Segundos de llamada gratis que quedan hoy (max FREE_CALL_SECONDS_PER_DAY). */
export function getFreeSecondsLeftToday(): number {
  return Math.max(0, FREE_CALL_SECONDS_PER_DAY - getFreeSecondsUsedToday());
}

/** Registra segundos consumidos de llamada hoy (acumulable entre chicas). */
export function recordCallSeconds(seconds: number): void {
  try {
    const used = getFreeSecondsUsedToday();
    localStorage.setItem(CALL_SECONDS_KEY, JSON.stringify({ day: todayKey(), seconds: used + Math.max(0, seconds) }));
  } catch {
    /* noop */
  }
}

/** True si el usuario gratis ya se ha gastado todos sus segundos de llamada de hoy. */
export function isFreeCallLimitReached(): boolean {
  return getFreeSecondsLeftToday() <= 0;
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

/**
 * True si una función está bloqueada para este dispositivo.
 *
 * El candado depende SOLO del plan de pago real (getPlan). Mientras no se
 * conecte la pasarela de pago, getPlan() devuelve "free" y los candados
 * premium se activan de verdad (directos con blur, crear 1/día, videollamada
 * -> /premium). El trial de 24h NO desbloquea: así las funciones premium
 * siempre son visibles/bloqueadas hasta que exista una suscripción.
 */
export function isFeatureLocked(feature: PremiumFeature): boolean {
  if (!PREMIUM_FEATURES.includes(feature)) return false;
  return getPlan() === "free";
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
