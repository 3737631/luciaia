"use client";

import NeonButton from "@/components/NeonButton";
import { setAgeAccepted } from "@/lib/storage";

export default function AgePage() {
  function goHome() {
    var base = window.location.pathname.replace(/\/age\/?$/, "").replace(/\/+$/, "");
    window.location.href = base + "/girls";
  }

  function confirm() {
    setAgeAccepted();
    goHome();
  }

  function exit() {
    window.location.href = "https://www.google.com";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-xl2 card-surface p-8 text-center shadow-glow animate-fadeUp">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-btn text-xl font-bold shadow-glowSm">
          18+
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full gradient-btn text-sm font-bold mx-auto mb-4">
          LC
        </span>
        <h1 className="text-2xl font-bold mb-3">
          Contenido solo para mayores de 18
        </h1>
        <p className="text-muted mb-2">
          LunaCall es una experiencia de compañía virtual con personajes ficticios
          generados por IA.
        </p>
        <p className="text-muted mb-8 text-sm">No representa a personas reales.</p>
        <div className="flex flex-col gap-3">
          <NeonButton onClick={confirm} fullWidth>
            Confirmo que tengo 18 años o más
          </NeonButton>
          <NeonButton onClick={exit} variant="ghost" fullWidth>
            Salir
          </NeonButton>
        </div>
      </div>
    </main>
  );
}
