"use client";

import { useEffect, useRef, useState } from "react";
import { getAIResponse, ChatMessage } from "@/lib/ai";
import { getCustomization } from "@/lib/storage";
import { Girl } from "@/data/girls";
import Avatar from "./Avatar";

const backgroundGradients: Record<string, string> = {
  "neon-room": "from-pink/25 via-purple/20 to-bg",
  "beach-night": "from-blue/25 via-purple/15 to-bg",
  studio: "from-purple/25 via-white/5 to-bg",
  "car-night": "from-purple/30 via-pink/10 to-bg",
};

export default function CallScreen({ girl }: { girl: Girl }) {
  const custom = getCustomization(girl.id);
  const background = custom?.background ?? girl.defaultBackground;

  const [micOn, setMicOn] = useState(true);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [talking, setTalking] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTextPanel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextPanel]);

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

  async function sendText() {
    const text = textInput.trim();
    if (!text || thinking) return;
    setTextInput("");
    setMessages((m) => [...m, { from: "user", text }]);
    setThinking(true);
    try {
      const config = {
        name: girl.name,
        personality: girl.personality,
        style: girl.style,
        customization: custom || undefined,
      };
      const history: ChatMessage[] = [
        ...messages.map((m) => ({
          role: m.from === "user" ? "user" as const : "assistant" as const,
          text: m.text,
        })),
        { role: "user", text },
      ];
      const reply = await getAIResponse(text, config, history);
      setMessages((m) => [...m, { from: "model", text: reply }]);
      speak(reply);
    } catch {
      const fallback = "Lo siento, no pude procesar eso ahora. Intenta de nuevo.";
      setMessages((m) => [...m, { from: "model", text: fallback }]);
      speak(fallback);
    } finally {
      setThinking(false);
    }
  }

  function hangUp() {
    window.location.href = "/girls";
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b ${backgroundGradients[background]} px-5 py-8`}
    >
      <div className="w-full flex items-center justify-between text-sm">
        <div>
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-muted">llamada en curso</p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <Avatar
          name={girl.id}
          image={girl.image}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          hair={custom?.hair ?? girl.defaultHair}
          size={220}
          animated
          talking={talking}
        />
        {lastReply && (
          <p className="mt-6 max-w-sm text-center text-sm text-muted animate-fadeUp">
            &ldquo;{lastReply}&rdquo;
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
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              disabled={thinking}
              placeholder="Escribe algo..."
              className="min-h-[48px] flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none focus:border-pink/50 disabled:opacity-40"
            />
            <button
              onClick={sendText}
              disabled={thinking || !textInput.trim()}
              className="min-h-[48px] rounded-2xl bg-gradient-to-r from-pink to-purple px-5 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-40"
            >
              {thinking ? "..." : "Enviar"}
            </button>
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
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          {micOn ? "Micrófono activado" : "Micrófono silenciado"}
        </p>
      </div>
    </div>
  );
}
