"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Girl, minorBlockMessage } from "@/data/girls";
import { getCustomization } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
import { sendChatMessage } from "@/lib/chatClient";
import {
  saveConversationHistory,
  getConversationSummary,
  saveConversationSummary,
  getUserMemory,
  saveUserMemory,
  extractMemoryFromMessages,
  buildSummary,
  clearAllMemory,
  saveToHistory,
  ChatMessage,
} from "@/lib/memory";
import Avatar from "./Avatar";

const MINOR_KEYWORDS = [
  "soy menor", "tengo 17", "tengo 16", "tengo 15", "tengo 14",
  "tengo 13", "menor de edad", "soy niño", "soy niña",
];

export default function ChatWindow({ girl }: { girl: Girl }) {
  const [messages, setMessages] = useState<{ id: string; from: "user" | "girl"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "actions">("actions");
  const [showModePicker, setShowModePicker] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  useEffect(() => {
    setMessages([{ id: "welcome", from: "girl", text: `Hola, soy ${girl.name}. Qué bien que hayas entrado 🙂` }]);
    return () => { mountedRef.current = false; };
  }, [girl.id, girl.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const chatMsgs = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.from === "user" ? "user" as const : "assistant" as const, content: m.text }));
    return () => {
      if (chatMsgs.length > 1) saveToHistory(girl.id, girl.name, chatMsgs);
    };
  }, []);

  const history: ChatMessage[] = messages
    .filter((m) => m.id !== "welcome")
    .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

  const doAI = useCallback(async (text: string) => {
    const custom = getCustomization(girl.id);
    const memory = getUserMemory(girl.id);
    const summary = getConversationSummary(girl.id);

    const payload = {
      message: text,
      girlId: girl.id,
      girlName: girl.name,
      girlStyle: girl.style,
      girlPersonality: custom?.personality ?? girl.personality,
      customization: custom || {},
      history,
      memory,
      summary,
      mode,
    };

    try {
      const reply = await sendChatMessage(payload);
      if (!mountedRef.current) return;

      const newMsgs = [
        ...messages,
        { id: crypto.randomUUID(), from: "user" as const, text },
        { id: crypto.randomUUID(), from: "girl" as const, text: reply },
      ];
      setMessages(newMsgs);

      const chatHistory: ChatMessage[] = newMsgs
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

      saveConversationHistory(girl.id, chatHistory);

      const extracted = extractMemoryFromMessages(chatHistory);
      if (extracted.length > 0) {
        const existing = getUserMemory(girl.id);
        const merged = [...new Map([...existing, ...extracted].map((m) => [m, m])).values()];
        saveUserMemory(girl.id, merged.slice(-30));
      }

      if (chatHistory.length > 20) {
        const sum = buildSummary(chatHistory);
        if (sum) saveConversationSummary(girl.id, sum);
      }

      setError(null);
    } catch (err: any) {
      console.warn("[Chat] AI error:", err);
      if (!mountedRef.current) return;

      const fallback = getFallbackResponse(text);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "user" as const, text },
        { id: crypto.randomUUID(), from: "girl" as const, text: fallback },
      ]);

      const chatHistory: ChatMessage[] = [
        ...history,
        { role: "user", content: text },
        { role: "assistant", content: fallback },
      ];
      saveConversationHistory(girl.id, chatHistory);
      setError(err?.message || "Usando modo offline.");
    }
  }, [girl, history, messages]);

  async function send() {
    if (blocked || typing) return;
    const text = input.trim();
    if (!text) return;
    setError(null);

    if (MINOR_KEYWORDS.some((k) => text.toLowerCase().includes(k))) {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "user", text },
        { id: crypto.randomUUID(), from: "girl", text: minorBlockMessage },
      ]);
      setBlocked(true);
      setInput("");
      return;
    }

    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "user", text }]);
    setInput("");
    setTyping(true);
    await doAI(text);
    setTyping(false);
  }

  function clearMemory() {
    clearAllMemory(girl.id);
    setMessages([{ id: "welcome", from: "girl", text: `Hola, soy ${girl.name}. Qué bien que hayas entrado 🙂` }]);
    setError(null);
    setBlocked(false);
  }

  function renderText(text: string) {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return <span key={i} className="italic text-pink/80">{part.slice(1, -1)}</span>;
      }
      return part;
    });
  }

  if (showModePicker) {
    return (
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-sm flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <Avatar
            name={girl.id}
            accentColor={girl.accentColor}
            accentColorSecondary={girl.accentColorSecondary}
            hair={girl.defaultHair}
            outfit={girl.defaultOutfit}
            background={girl.defaultBackground}
            size={80}
          />
          <h2 className="mt-4 text-xl font-bold">{girl.name}</h2>
          <p className="mt-1 text-sm text-muted">{girl.style} · {girl.personalityLabel}</p>
        </div>
        <p className="text-center text-sm text-muted">Elige cómo quieres chatear:</p>
        <button
          onClick={() => { setMode("text"); setShowModePicker(false); }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-left transition hover:bg-white/10"
        >
          <span className="text-lg font-semibold">Chat 💬</span>
          <p className="mt-1 text-xs text-muted">Solo texto, conversación normal</p>
        </button>
        <button
          onClick={() => { setMode("actions"); setShowModePicker(false); }}
          className="w-full rounded-2xl border border-pink/30 bg-pink/5 px-6 py-4 text-left transition hover:bg-pink/10"
        >
          <span className="text-lg font-semibold">Roleplay 🎭</span>
          <p className="mt-1 text-xs text-muted">Con acciones y gestos, *se acerca y te besa*</p>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl2 card-surface px-4 py-3">
        <Avatar
          name={girl.id}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          hair={girl.defaultHair}
          outfit={girl.defaultOutfit}
          background={girl.defaultBackground}
          size={44}
        />
        <div className="flex-1">
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-green-400">● {mode === "actions" ? "Roleplay" : "Chat"}</p>
        </div>
        <button
          onClick={clearMemory}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-muted hover:bg-white/20"
          title="Borrar memoria de esta chica"
        >
          Borrar memoria
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-xl2 card-surface space-y-3 p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex animate-fadeUp ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.from === "user" ? "bg-gradient-to-r from-pink to-purple-500 text-white shadow-lg shadow-pink/20" : "bg-white/10 text-ink backdrop-blur-sm border border-white/5"}`}>
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-muted">
              {girl.name} está escribiendo
              <span className="ml-1 inline-flex">
                <span className="animate-pulseGlow">.</span>
                <span className="animate-pulseGlow" style={{ animationDelay: "0.2s" }}>.</span>
                <span className="animate-pulseGlow" style={{ animationDelay: "0.4s" }}>.</span>
              </span>
            </div>
          </div>
        )}
        {error && (
          <p className="py-2 text-center text-xs text-muted">{error}</p>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          disabled={blocked || typing}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={blocked ? "Chat bloqueado" : "Escribe un mensaje..."}
          className="min-h-[48px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-pink/50 disabled:opacity-40"
        />
        <button
          onClick={send}
          disabled={blocked || typing}
          className="rounded-xl bg-gradient-to-r from-pink to-purple-500 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
