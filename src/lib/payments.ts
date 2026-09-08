"use client";

import { SUPABASE_FUNCTION_URL, supabase } from "@/lib/supabase";

export interface ServerStatus {
  plan: "premium" | "premium_plus" | null;
  active: boolean;
  expiresAt: string | null;
  billing: "monthly" | "annual" | null;
  recurring: boolean;
  subscriptionId: string | null;
  hasPending: boolean;
}

export interface AccountInfo {
  email: string;
  createdAt: string;
}

async function call(action: string, body?: Record<string, unknown>): Promise<any> {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Sesión no iniciada");

  const res = await fetch(`${SUPABASE_FUNCTION_URL}/payments?action=${action}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.error || "Error del servidor de pagos");
  return payload;
}

export const payments = {
  createOrder: (plan: "premium" | "premium_plus", billing: "monthly" | "annual") =>
    call("create-order", { plan, billing }),
  captureOrder: (orderId: string) => call("capture-order", { orderId }),
  createSubscription: (plan: "premium" | "premium_plus") =>
    call("create-subscription", { plan }),
  cancelSubscription: (subscriptionId: string) =>
    call("cancel-subscription", { subscriptionId }),
  status: () => call("status"),
  account: () => call("account"),
  adminStats: () => call("admin-stats"),
};

export interface AdminStats {
  dev: string;
  generatedAt: string;
  totalUsers: number;
  usersActiveToday: number;
  usersActiveLast7d: number;
  activePremiumUsers: number;
  activePremiumRows: number;
  sessions: { email: string; lastSignInAt: string; createdAt: string }[];
  purchases: {
    email: string;
    plan: string;
    billing: string;
    kind: string;
    status: string;
    expiresAt: string | null;
    createdAt: string;
  }[];
}