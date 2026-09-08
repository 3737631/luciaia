export const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  premium: { monthly: 7.99, annual: 71.88 },
  premium_plus: { monthly: 15.99, annual: 143.88 },
};

export const PLAN_RANK: Record<string, number> = { premium: 1, premium_plus: 2 };

const DAY_MS = 86400000;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export function formatEuro(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

export interface UpgradeOffer {
  credit: number;
  monthlyFull: number;
  annualFull: number;
  monthlyCharge: number;
  annualCharge: number;
}

/** Oferta prorrateada al subir de plan. null si no aplica descuento. */
export function computeUpgradeOffer(
  current: {
    plan: "premium" | "premium_plus" | null;
    billing: "monthly" | "annual" | null;
    expiresAt: string | null;
  },
  targetPlan: "premium" | "premium_plus"
): UpgradeOffer | null {
  if (
    !current.plan ||
    !current.billing ||
    !current.expiresAt ||
    !PLAN_PRICES[current.plan] ||
    (PLAN_RANK[current.plan] ?? 0) >= (PLAN_RANK[targetPlan] ?? -1)
  ) {
    return null;
  }
  const now = Date.now();
  const remainingMs = Math.max(0, new Date(current.expiresAt).getTime() - now);
  const periodMs = current.billing === "annual" ? YEAR_MS : MONTH_MS;
  const paid = PLAN_PRICES[current.plan][current.billing];
  const credit = Math.round(paid * (remainingMs / periodMs) * 100) / 100;
  const monthlyFull = PLAN_PRICES[targetPlan].monthly;
  const annualFull = PLAN_PRICES[targetPlan].annual;
  const monthlyCharge = Math.max(0.01, Math.round((monthlyFull - credit) * 100) / 100);
  const annualCharge = Math.max(0.01, Math.round((annualFull - credit) * 100) / 100);
  return { credit, monthlyFull, annualFull, monthlyCharge, annualCharge };
}

export function chargeForBilling(offer: UpgradeOffer | null, billing: "monthly" | "annual", fallback: number) {
  if (!offer) return fallback;
  return billing === "annual" ? offer.annualCharge : offer.monthlyCharge;
}

export function fullForBilling(offer: UpgradeOffer | null, billing: "monthly" | "annual", fallback: number) {
  if (!offer) return fallback;
  return billing === "annual" ? offer.annualFull : offer.monthlyFull;
}