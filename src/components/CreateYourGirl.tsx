"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCustomGirl } from "@/lib/storage";

function generateId(): string {
  return "custom_" + Math.random().toString(36).slice(2, 8);
}

function generateName(desc: string): string {
  const names = ["Luna", "Nia", "Vera", "Alma", "Kira", "Maya", "Sasha", "Yuki", "Eva", "Iris", "Nova", "Aria", "Zara", "Lia", "Roxy"];
  const words = desc.toLowerCase();
  if (words.includes("enfermera")) return "Candy";
  if (words.includes("profesora") || words.includes("maestra")) return "Diana";
  if (words.includes("vecina")) return "Vera";
  if (words.includes("gamer")) return "Nia";
  if (words.includes("rubia")) return "Maya";
  if (words.includes("morena")) return "Luna";
  if (words.includes("pelirroja")) return "Vera";
  return names[Math.floor(Math.random() * names.length)];
}

function generateAge(): number {
  return 18 + Math.floor(Math.random() * 7);
}

function pickBaseGirl(desc: string): string {
  const words = desc.toLowerCase();
  if (words.includes("morena") || words.includes("moreno")) return "luna";
  if (words.includes("rubia") || words.includes("rubio")) return "maya";
  if (words.includes("pelirroja") || words.includes("pelirrojo")) return "vera";
  if (words.includes("rosa")) return "kira";
  if (words.includes("enfermera") || words.includes("doctora")) return "alma";
  if (words.includes("gamer") || words.includes("videojuego")) return "nia";
  if (words.includes("punk") || words.includes("rock")) return "kira";
  return ["luna", "nia", "vera", "alma", "kira", "maya", "sasha", "yuki"][Math.floor(Math.random() * 8)];
}

function pickHair(desc: string): string {
  const words = desc.toLowerCase();
  if (words.includes("morena") || words.includes("moreno") || words.includes("negra") || words.includes("negro") || words.includes("castaña") || words.includes("castaño")) return "moreno";
  if (words.includes("rubia") || words.includes("rubio") || words.includes("dorada") || words.includes("dorado")) return "rubio";
  if (words.includes("pelirroja") || words.includes("pelirrojo") || words.includes("roja") || words.includes("rojo")) return "pelirrojo";
  if (words.includes("rosa") || words.includes("neón") || words.includes("neon")) return "rosa";
  return "moreno";
}

function pickBackground(desc: string): string {
  const words = desc.toLowerCase();
  if (words.includes("playa") || words.includes("mar") || words.includes("noche")) return "beach-night";
  if (words.includes("coche") || words.includes("carro") || words.includes("carr") || words.includes("nocturno")) return "car-night";
  if (words.includes("estudio") || words.includes("foto") || words.includes("fondo")) return "studio";
  return "neon-room";
}

function pickPose(desc: string): string {
  const words = desc.toLowerCase();
  if (words.includes("bata") || words.includes("abierta") || words.includes("salida")) return "bata";
  if (words.includes("tanga") || words.includes("nalgas") || words.includes("cul") || words.includes("cuerda")) return "tanga";
  if (words.includes("estrella") || words.includes("pegatina")) return "estrellas";
  return "toalla";
}

export default function CreateYourGirl() {
  const router = useRouter();
  const [girlDesc, setGirlDesc] = useState("");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [done, setDone] = useState(false);

  function handleCreate() {
    if (!girlDesc.trim() && !roleplayDesc.trim()) return;
    const id = generateId();
    const name = generateName(girlDesc || roleplayDesc);
    const baseId = pickBaseGirl(girlDesc || roleplayDesc);
    const hair = pickHair(girlDesc || roleplayDesc);
    const background = pickBackground(girlDesc || roleplayDesc);
    const pose = pickPose(girlDesc || roleplayDesc);
    const story = roleplayDesc.trim() || `Tu nueva creación, ${name}, te espera para pasar una noche inolvidable.`;
    saveCustomGirl({
      id,
      name,
      age: generateAge(),
      story,
      description: girlDesc.trim() || name,
      girlDesc: girlDesc.trim(),
      roleplayDesc: roleplayDesc.trim(),
      hair,
      background,
      pose,
      personality: "atrevida",
      baseId,
    });
    setDone(true);
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
          <p className="text-lg font-bold text-white">¡Chica creada!</p>
          <p className="mt-1 text-sm text-white/60">
            Tu personaje aparecerá en la cuadrícula con su imagen personalizada.
          </p>
          <button
            onClick={() => router.push("/girls")}
            className="btn-primary mt-4 h-11 px-8 text-sm font-bold"
          >
            Ver en la cuadrícula
          </button>
          <button
            onClick={() => {
              setDone(false);
              setGirlDesc("");
              setRoleplayDesc("");
            }}
            className="mt-3 block w-full text-center text-xs text-pink/60 hover:text-pink transition-colors"
          >
            Crear otra chica
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
        Describe a tu chica ideal y el roleplay que imaginas. Se generará una tarjeta personalizada con imagen.
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
          Crear chica personalizada
        </button>
      </div>
    </div>
  );
}
