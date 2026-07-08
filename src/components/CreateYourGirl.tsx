"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateYourGirl() {
  const router = useRouter();
  const [girlDesc, setGirlDesc] = useState("");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [done, setDone] = useState(false);

  function handleCreate() {
    if (!girlDesc.trim() && !roleplayDesc.trim()) return;
    localStorage.setItem(
      "custom_scenario",
      JSON.stringify({ girl: girlDesc.trim(), roleplay: roleplayDesc.trim() }),
    );
    setDone(true);
  }

  function handleStart() {
    router.push("/chat/luna");
  }

  if (done) {
    return (
      <div
        className="px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 1180, margin: "20px auto 0" }}
      >
        <div
          className="rounded-2xl p-6 sm:p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink/20 to-purple/20">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-pink" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p className="text-lg font-bold text-white">Escenario guardado</p>
          <p className="mt-1 text-sm text-white/60">
            Tu chica y roleplay están listos. Elige una chica para empezar:
          </p>
          <button
            onClick={handleStart}
            className="btn-primary mt-4 h-11 px-8 text-sm font-bold"
          >
            Ir al chat
          </button>
          <button
            onClick={() => {
              setDone(false);
              setGirlDesc("");
              setRoleplayDesc("");
            }}
            className="mt-3 block w-full text-center text-xs text-pink/60 hover:text-pink transition-colors"
          >
            Crear otro escenario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-4 sm:px-6 lg:px-8"
      style={{ maxWidth: 1180, margin: "20px auto 0" }}
    >
      <h2
        className="font-black tracking-tighter text-white"
        style={{
          fontSize: "clamp(28px, 4vw, 38px)",
          letterSpacing: "-0.05em",
          margin: "0 0 8px",
        }}
      >
        Crea tu propia chica
      </h2>
      <p className="mb-4 text-sm text-white/50" style={{ marginTop: 0 }}>
        Describe a tu chica ideal y el roleplay que imaginas. Todo se aplicará en el chat.
      </p>
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <label className="mb-1.5 block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Describe a tu chica
        </label>
        <textarea
          value={girlDesc}
          onChange={(e) => setGirlDesc(e.target.value)}
          placeholder="Ej: Una enfermera de noche, pelo negro, mirada intensa, voz ronca, uniforme blanco ajustado..."
          rows={3}
          className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
        />
        <label className="mb-1.5 mt-4 block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Describe el roleplay
        </label>
        <textarea
          value={roleplayDesc}
          onChange={(e) => setRoleplayDesc(e.target.value)}
          placeholder="Ej: Me tiene atado a la cama del hospital, se sienta sobre mí y me susurra que nadie va a interrumpirnos..."
          rows={3}
          className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
        />
        <button
          onClick={handleCreate}
          disabled={!girlDesc.trim() && !roleplayDesc.trim()}
          className="btn-primary mt-4 h-11 px-6 text-sm font-bold disabled:opacity-40"
        >
          Guardar escenario
        </button>
      </div>
    </div>
  );
}
