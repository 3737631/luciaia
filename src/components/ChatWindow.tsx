"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Girl, personalityResponses, minorBlockMessage } from "@/data/girls";
import {
  getChatUsage,
  incrementChatUsage,
  isPremium,
  getCustomization,
} from "@/lib/storage";
import NeonButton from "./NeonButton";
import Avatar from "./Avatar";
import PremiumModal from "./PremiumModal";

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
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const [premium, setPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const personality = getCustomization(girl.id)?.personality ?? girl.personality;

  useEffect(() => {
    setUsage(getChatUsage(girl.id));
    setPremium(isPremium());
  }, [girl.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function pickResponse(): string {
    const pool =
      personalityResponses[personality as keyof typeof personalityResponses] ??
      personalityResponses.carinosa;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function send() {
    if (blocked) return;
    const text = input.trim();
    if (!text) return;

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

    if (!premium && usage.used >= usage.limit) {
      setShowPremiumModal(true);
      return;
    }

    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "user", text }]);
    setInput("");

    if (!premium) {
      const updated = incrementChatUsage(girl.id);
      setUsage(updated);
    }

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), from: "girl", text: pickResponse() },
      ]);
      if (!premium) {
        const current = getChatUsage(girl.id);
        if (current.used >= current.limit) {
          setTimeout(() => setShowPremiumModal(true), 500);
        }
      }
    }, 900);
  }

  const remaining = Math.max(usage.limit - usage.used, 0);

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col px-4 py-4">
      <div className="flex items-center gap-3 rounded-xl2 card-surface px-4 py-3 mb-3">
        <Avatar
          name={girl.id}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          size={44}
        />
        <div className="flex-1">
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-green-400">● online</p>
        </div>
        <span className="text-xs text-muted">
          {premium ? "Premium activo" : `Mensajes gratis restantes: ${remaining}/${usage.limit}`}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl2 card-surface p-4 space-y-3"
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
              <span className="inline-flex ml-1">
                <span className="animate-pulseGlow">.</span>
                <span className="animate-pulseGlow" style={{ animationDelay: "0.2s" }}>.</span>
                <span className="animate-pulseGlow" style={{ animationDelay: "0.4s" }}>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          disabled={blocked || (!premium && remaining <= 0)}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={blocked ? "Chat bloqueado" : "Escribe un mensaje..."}
          className="min-h-[48px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-pink/50 disabled:opacity-40"
        />
        <NeonButton onClick={send} disabled={blocked || (!premium && remaining <= 0)}>
          Enviar
        </NeonButton>
      </div>

      {!premium && remaining <= 0 && (
        <p className="mt-2 text-center text-xs text-muted">
          Tu prueba gratis de chat ha terminado.{" "}
          <Link href="/premium" className="text-pink underline">
            Ver Premium
          </Link>
        </p>
      )}

      {showPremiumModal && (
        <PremiumModal
          title="Tu prueba gratis de chat ha terminado"
          subtitle="Desbloquea mensajes ilimitados por 6€/mes"
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
}
