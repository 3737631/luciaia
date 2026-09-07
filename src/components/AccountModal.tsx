"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

export default function AccountModal({ open, onClose, onDone }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession({ email: data.session?.user?.email }));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession({ email: s?.user?.email ?? undefined })
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Introduce un email válido.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return setError(error.message);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(error.message);
      }
      setEmail("");
      setPassword("");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    onClose();
  }

  const overlay = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 950,
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
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>Tu cuenta</span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: "none", border: 0, color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {session?.email ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Conectado como</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", wordBreak: "break-all" }}>{session.email}</p>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />
            <button
              onClick={signOut}
              style={{ ...primaryBtn, background: "none", border: "1px solid rgba(255,95,143,0.5)", color: "#ff5f8f" }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  style={{
                    flex: 1,
                    background: mode === m ? "rgba(255,95,143,0.18)" : "transparent",
                    border: 0,
                    borderRadius: 9,
                    padding: "8px 0",
                    color: mode === m ? "#ff5f8f" : "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {m === "login" ? "Entrar" : "Crear cuenta"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={input}
              />
              <input
                type="password"
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={input}
              />
              {error && <p style={{ margin: 0, fontSize: 13, color: "#ff5f8f" }}>{error}</p>}
              <button type="submit" disabled={busy} style={primaryBtn}>
                {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
              </button>
              <p style={{ margin: 0, fontSize: 11, textAlign: "center", color: "rgba(255,255,255,0.45)" }}>
                Tus datos se guardan en NuviaChat para gestionar tu suscripción y activar Premium después del pago.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}