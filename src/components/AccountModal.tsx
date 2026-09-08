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
  const [resetSent, setResetSent] = useState(false);
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
      setResetSent(false);
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

  async function googleSignIn() {
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
      if (error) setError(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Google");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError(null);
    if (!email.includes("@")) return setError("Introduce tu email para recuperar la contraseña.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/luciaia/reset-password`,
      });
      if (error) return setError(error.message);
      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setBusy(false);
    }
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

            <button
              type="button"
              onClick={googleSignIn}
              disabled={busy}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: "#fff",
                color: "#1a1a1a",
                border: 0,
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                opacity: busy ? 0.6 : 1,
                marginBottom: 12,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Iniciar sesión con Google
            </button>

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
              {mode === "login" && !resetSent && (
                <button
                  type="button"
                  onClick={resetPassword}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    color: "rgba(255,95,143,0.9)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              {resetSent && (
                <p style={{ margin: 0, fontSize: 13, color: "#4ade80", lineHeight: 1.4 }}>
                  Te hemos enviado un enlace de recuperación a tu email. Revísalo y sigue las instrucciones.
                </p>
              )}
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