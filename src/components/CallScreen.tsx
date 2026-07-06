"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getCustomization } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
import { sendChatMessage } from "@/lib/chatClient";
import {
  getConversationHistory,
  saveConversationHistory,
  getConversationSummary,
  saveConversationSummary,
  getUserMemory,
  saveUserMemory,
  extractMemoryFromMessages,
  buildSummary,
  clearAllMemory,
  ChatMessage,
} from "@/lib/memory";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getConversationHistory(girl.id);
    setMessages(saved);
    if (saved.length > 0) {
      const last = [...saved].reverse().find((m) => m.role === "assistant");
      if (last) setLastReply(last.content);
    }
  }, [girl.id]);

  useEffect(() => {
    if (showTextPanel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextPanel]);

  function speak(text: string) {
    setLastReply(text);
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const spanish = voices.find((v) => v.lang?.toLowerCase().startsWith("es"));
    if (spanish) utterance.voice = spanish;
    setTalking(true);
    utterance.onend = () => setTalking(false);
    window.speechSynthesis.speak(utterance);
  }

  const doAI = useCallback(async (text: string) => {
    const memory = getUserMemory(girl.id);
    const summary = getConversationSummary(girl.id);

    const payload = {
      message: text,
      girlId: girl.id,
      girlName: girl.name,
      girlStyle: girl.style,
      girlPersonality: custom?.personality ?? girl.personality,
      customization: custom || {},
      history: messages,
      memory,
      summary,
    };

    try {
      const reply = await sendChatMessage(payload);
      const replyMessage: ChatMessage = { role: "assistant", content: reply };
      const updatedMsgs = [...messages, { role: "user" as const, content: text }, replyMessage];
      setMessages(updatedMsgs);
      speak(reply);

      saveConversationHistory(girl.id, updatedMsgs);

      const extracted = extractMemoryFromMessages(updatedMsgs);
      if (extracted.length > 0) {
        const existing = getUserMemory(girl.id);
        const merged = [...new Map([...existing, ...extracted].map((m) => [m, m])).values()];
        saveUserMemory(girl.id, merged.slice(-30));
      }

      if (updatedMsgs.length > 20) {
        const sum = buildSummary(updatedMsgs);
        if (sum) saveConversationSummary(girl.id, sum);
      }

      return reply;
    } catch (err: any) {
      console.warn("[Call] AI error:", err);
      const fallback = getFallbackResponse(text);
      const replyMessage: ChatMessage = { role: "assistant", content: fallback };
      const updatedMsgs = [...messages, { role: "user" as const, content: text }, replyMessage];
      setMessages(updatedMsgs);
      speak(fallback);
      saveConversationHistory(girl.id, updatedMsgs);
      return fallback;
    }
  }, [girl, custom, messages]);

  async function sendText() {
    const text = textInput.trim();
    if (!text || thinking) return;
    setTextInput("");
    setThinking(true);
    await doAI(text);
    setThinking(false);
  }

  function hangUp() {
    window.location.href = "/girls";
  }

  function clearMemory() {
    clearAllMemory(girl.id);
    setMessages([]);
    setLastReply(null);
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b ${backgroundGradients[background]} px-5 py-8`}>
      <div className="w-full flex items-center justify-between text-sm">
        <div>
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-muted">llamada en curso</p>
        </div>
        <button
          onClick={clearMemory}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-muted hover:bg-white/20"
          title="Borrar memoria de esta chica"
        >
          Borrar memoria
        </button>
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
