"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Girl, personalityResponses } from "@/data/girls";
import { getCallUsage, incrementCallUsage, isPremium, getCustomization } from "@/lib/storage";
import Avatar from "./Avatar";
import NeonButton from "./NeonButton";
import PremiumModal from "./PremiumModal";

const backgroundGradients: Record<string, string> = {
  "neon-room": "from-pink/25 via-purple/20 to-bg",
  "beach-night": "from-blue/25 via-purple/15 to-bg",
  studio: "from-purple/25 via-white/5 to-bg",
  "car-night": "from-purple/30 via-pink/10 to-bg",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function CallScreen({ girl }: { girl: Girl }) {
  const router = useRouter();
  const premium = useRef(isPremium());
  const custom = getCustomization(girl.id);
  const personality = custom?.personality ?? girl.personality;
  const background = custom?.background ?? girl.defaultBackground;

  const [remaining, setRemaining] = useState<number>(() => {
    const usage = getCallUsage(girl.id);
    return Math.max(usage.limit - usage.used, 0);
  });
  const [ended, setEnded] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [talking, setTalking] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);

  useEffect(() => {
    if (premium.current || ended) return;
    if (remaining <= 0) {
      setEnded(true);
      setShowPremiumModal(true);
      return;
    }
    const interval = setInterval(() => {
      incrementCallUsage(girl.id, 1);
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setEnded(true);
          setShowPremiumModal(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [girl.id, ended]);

  function pickResponse(): string {
    const pool =
      personalityResponses[personality as keyof typeof personalityResponses] ??
      personalityResponses.carinosa;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function speak(text: string) {
    setLastReply(text);
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const spanish = voices.find((v) => v.lang?.toLowerCase().startsWith("es"));
    if (spanish) utterance.voice = spanish;
    setTalking(true);
    utterance.onend = () => setTalking(false);
    window.speechSynthesis.speak(utterance);
  }

  function sendText() {
    const text = textInput.trim();
    if (!text || ended) return;
    setTextInput("");
    setTimeout(() => speak(pickResponse()), 400);
  }

  function hangUp() {
    router.push("/girls");
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b ${backgroundGradients[background]} px-5 py-8`}
    >
      <div className="w-full flex items-center justify-between text-sm">
        <div>
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-muted">
            {ended ? "llamada finalizada" : "llamada en curso"}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
          {premium.current ? "Premium activo" : `Tiempo gratis: ${formatTime(remaining)}`}
        </span>
      </div>

      <div className={`flex flex-col items-center ${ended ? "opacity-40 blur-sm" : ""}`}>
        <Avatar
          name={girl.id}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          hair={custom?.hair ?? girl.defaultHair}
          size={220}
          animated
          talking={talking}
        />
        {lastReply && (
          <p className="mt-6 max-w-sm text-center text-sm text-muted animate-fadeUp">
            "{lastReply}"
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          Personaje ficticio generado por IA
        </p>
      </div>

      <div className="w-full max-w-sm">
        {showTextPanel && (
          <div className="mb-3 flex gap-2 animate-fadeUp">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              disabled={ended}
              placeholder="Escribe algo..."
              className="min-h-[48px] flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none focus:border-pink/50 disabled:opacity-40"
            />
            <NeonButton onClick={sendText} disabled={ended}>
              Enviar
            </NeonButton>
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMicOn((v) => !v)}
            className="flex h-14 w-14 items-center justify-center rounded-full card-surface hover:scale-105 active:scale-95 transition-all duration-200"
            title={micOn ? "Micrófono activado" : "Micrófono silenciado"}
          >
            {micOn ? "🎙️" : "🔇"}
          </button>
          <button
            onClick={() => setShowTextPanel((v) => !v)}
            className="flex h-14 w-14 items-center justify-center rounded-full card-surface hover:scale-105 active:scale-95 transition-all duration-200"
            title="Escribir"
          >
            ⌨️
          </button>
          <button
            onClick={hangUp}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Colgar"
          >
            📞
          </button>
          <button
            onClick={() => router.push("/premium")}
            className="flex h-14 w-14 items-center justify-center rounded-full gradient-btn hover:scale-105 active:scale-95 transition-all duration-200"
            title="Premium"
          >
            ✨
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          {micOn ? "Micrófono activado" : "Micrófono silenciado"}
        </p>
      </div>

      {showPremiumModal && (
        <PremiumModal
          title="Tu videollamada gratis ha terminado"
          subtitle="Desbloquea llamadas más largas por 6€/mes"
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}
