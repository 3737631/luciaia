"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Girl, minorBlockMessage } from "@/data/girls";
import { getCustomization } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const saved = getConversationHistory(girl.id);
    if (saved.length > 0) {
      const msgs = saved.map((m, i) => ({
        id: "saved-" + i,
        from: m.role === "user" ? ("user" as const) : ("girl" as const),
        text: m.content,
      }));
      setMessages(msgs);
    } else {
      setMessages([{ id: "welcome", from: "girl", text: `Hola, soy ${girl.name}. Qué bien que hayas entrado 🙂` }]);
    }
    return () => { mountedRef.current = false; };
  }, [girl.id, girl.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const history: ChatMessage[] = messages
    .filter((m) => m.id !== "welcome")
    .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

  const sendToAPI = useCallback(async (text: string) => {
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
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `API error ${res.status}`);
    }

    const data = await res.json();
    return data.reply as string;
  }, [girl.id, girl.name, girl.style, girl.personality, history]);

  async function doAI(text: string) {
    const custom = getCustomization(girl.id);
    const allMsgs: ChatMessage[] = [
      ...history,
      { role: "user", content: text },
    ];

    try {
      const reply = await sendToAPI(text);
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
      console.warn("[Chat] API error, using fallback:", err);
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
      setError("Usando modo offline. El servicio de IA no está disponible.");
    }
  }

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

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl2 card-surface px-4 py-3">
        <Avatar
          name={girl.id}
          image={girl.image}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          size={44}
        />
        <div className="flex-1">
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-green-400">● online</p>
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
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "user" ? "gradient-btn text-white" : "bg-white/10 text-ink"}`}>
              {m.text}
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
