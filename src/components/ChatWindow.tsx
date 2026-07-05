"use client";

import { useEffect, useRef, useState } from "react";
import { Girl, minorBlockMessage } from "@/data/girls";
import { getCustomization } from "@/lib/storage";
import { getAIResponse, ChatMessage } from "@/lib/ai";
import Avatar from "./Avatar";

interface Message {
  id: string;
  from: "user" | "girl";
  text: string;
}

const MINOR_KEYWORDS = [
  "soy menor",
  "tengo 17",
  "tengo 16",
  "tengo 15",
  "tengo 14",
  "tengo 13",
  "menor de edad",
  "soy niño",
  "soy niña",
];

export default function ChatWindow({ girl }: { girl: Girl }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "girl",
      text: `Hola, soy ${girl.name}. Qué bien que hayas entrado 🙂`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const lastTextRef = useRef("");

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function buildHistory(msgs: Message[]): ChatMessage[] {
    return msgs
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.from === "user" ? "user" : "model",
        text: m.text,
      }));
  }

  async function doAI(text: string) {
    const custom = getCustomization(girl.id);
    const config = {
      name: girl.name,
      personality: custom?.personality ?? girl.personality,
      style: girl.style,
      customization: custom ?? undefined,
    };
    const history = buildHistory(messages);

    try {
      const reply = await getAIResponse(text, config, history);
      if (mountedRef.current) {
        setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: reply }]);
        setError(null);
      }
    } catch {
      if (mountedRef.current) {
        setError("No se pudo obtener respuesta. Intenta de nuevo.");
      }
    } finally {
      if (mountedRef.current) {
        setTyping(false);
      }
    }
  }

  async function send() {
    if (blocked || typing) return;
    const text = input.trim();
    if (!text) return;

    setError(null);
    lastTextRef.current = text;

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
  }

  function retry() {
    if (typing || blocked) return;
    const text = lastTextRef.current;
    if (!text) return;
    setError(null);
    setTyping(true);
    doAI(text);
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
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl2 card-surface space-y-3 p-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex animate-fadeUp ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                m.from === "user"
                  ? "gradient-btn text-white"
                  : "bg-white/10 text-ink"
              }`}
            >
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
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={retry}
              className="rounded-xl bg-gradient-to-r from-pink to-purple-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
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
