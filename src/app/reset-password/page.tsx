"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthSession {
  email?: string;
}

export default function ResetPasswordPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setSession({ email: data.session?.user?.email ?? undefined })
    );
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession({ email: s?.user?.email ?? undefined })
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setError(error.message);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 400,
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "20px 22px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  };

  const input: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 15,
    color: "#fff",
    outline: "none",
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    background: "linear-gradient(135deg, #ff5f8f, #ff2b86)",
    border: 0,
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    opacity: busy ? 0.6 : 1,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16, background: "rgba(8,5,11,0.92)" }}>
      <div style={card}>
        <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", marginBottom: 8 }}>Restablecer contraseña</span>
        <p style={{ margin: 0, marginBottom: 14, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
          {done
            ? "Contraseña actualizada correctamente."
            : "Elige una contraseña nueva para tu cuenta."}
        </p>
        {session?.email && !done && (
          <p style={{ margin: 0, marginBottom: 12, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            Cuenta: {session.email}
          </p>
        )}
        {done ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#4ade80", lineHeight: 1.4 }}>
              Tu contraseña se ha guardado. Ya puedes volver a iniciar sesión en NuviaChat.
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              style={primaryBtn}
            >
              Ir a la web
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!session?.email}
              style={input}
            />
            <button type="submit" disabled={busy || !session?.email} style={primaryBtn}>
              {busy ? "Guardando…" : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}