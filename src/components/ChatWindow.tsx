"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Girl, minorBlockMessage } from "@/data/girls";
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
  saveToHistory,
  ChatMessage,
} from "@/lib/memory";

const MINOR_KEYWORDS = [
  "soy menor", "tengo 17", "tengo 16", "tengo 15", "tengo 14",
  "tengo 13", "menor de edad", "soy niño", "soy niña",
];

const bp = () => process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ChatWindow({ girl }: { girl: Girl }) {
  const [messages, setMessages] = useState<{ id: string; from: "user" | "girl"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "actions">("actions");
  const [showModePicker, setShowModePicker] = useState(true);
  const [customScenario, setCustomScenario] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const raw = localStorage.getItem("custom_scenario");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const parts = [];
        if (parsed.girl) parts.push("Chica: " + parsed.girl);
        if (parsed.roleplay) parts.push("Roleplay: " + parsed.roleplay);
        setCustomScenario(parts.join("\n"));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const welcomes = [
      `Hola, soy ${girl.name}. Qué bien que hayas entrado`,
      `¡Hey! Soy ${girl.name}, me alegra verte por aquí`,
      `${girl.name} al habla... justo estaba pensando en ti`,
      `Hola, ¿recuerdas a ${girl.name}? Pasa, siéntete como en casa`,
      `Soy ${girl.name}. Estaba esperando a que entrases...`,
    ];
    setMessages([{ id: "welcome", from: "girl", text: welcomes[Math.floor(Math.random() * welcomes.length)] }]);
    return () => { mountedRef.current = false; };
  }, [girl.id, girl.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      const chatMsgs = messagesRef.current
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.from === "user" ? "user" as const : "assistant" as const, content: m.text }));
      if (chatMsgs.length > 1) saveToHistory(girl.id, girl.name, chatMsgs);
    };
  }, [girl.id, girl.name]);

  async function startRoleplay() {
    setMode("actions");
    setShowModePicker(false);
    setCustomScenario(girl.story);
    const pick = girl.roleplayGreetings[Math.floor(Math.random() * girl.roleplayGreetings.length)];
    setMessages([{ id: "welcome", from: "girl", text: pick }]);
  }

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
      userGender: (typeof window !== "undefined" ? (localStorage.getItem("lunacall_gender") || "hombre") : "hombre") as "hombre" | "mujer",
      customScenario: customScenario || undefined,
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
  }, [girl, history, messages, customScenario]);

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

  function requestImage() {
    if (blocked || typing) return;
    const text = "Pídeme una foto";
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "user" as const, text }]);
    setTyping(true);
    doAI(text).finally(() => setTyping(false));
  }

  function clearMemory() {
    clearAllMemory(girl.id);
    setMessages([{ id: "welcome", from: "girl", text: `Hola, soy ${girl.name}. Qué bien que hayas entrado` }]);
    setError(null);
    setBlocked(false);
  }

  function renderText(text: string) {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return <span key={i} className="italic text-pink/80 break-words">{part.slice(1, -1)}</span>;
      }
      return <span key={i} className="break-words">{part}</span>;
    });
  }

  if (showModePicker) {
    const p = bp();
    return (
      <div className="ce-container">
        <div className="ce-topBar">
          <button className="ce-topBtn" onClick={() => { window.location.href = `${p}/girls`; }} aria-label="Volver atrás">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <button className="ce-topBtn" aria-label="Menú">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        <div className="ce-heroCard" style={{ position: "relative" }}>
          <img src={girl.cloudinaryImage} alt={girl.name} className="ce-heroImg" />
          <div className="ce-heroGrad" />
          <div className="ce-heroInfo">
            <div className="ce-heroNameRow">
              <span className="ce-heroName">{girl.name}</span>
              <span className="ce-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
            </div>
            <div className="ce-statusRow">
              <span className="ce-onlineDot" />
              <span className="ce-statusText">En línea</span>
            </div>
          </div>
          <a className="ce-histRow" href={`${p}/history/`}>
            <svg className="ce-histIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="ce-histText">Historial con {girl.name}</span>
            <svg className="ce-histChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <p className="ce-question">¿Qué quieres hacer?</p>
        <button className="ce-optionCard" onClick={() => { setMode("text"); setShowModePicker(false); if (scrollRef.current) setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100); }}>
          <div className="ce-optionIconWrap ce-optionIconPink">
            <svg className="ce-optionIcon ce-iconDark" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="ce-optionContent">
            <div className="ce-optionTitle">Enviar un mensaje</div>
            <div className="ce-optionDesc">Habla libremente con {girl.name}</div>
          </div>
          <svg className="ce-optionChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button className="ce-optionCard" onClick={startRoleplay}>
          <div className="ce-iconPurpleWrap">
            <svg className="ce-iconPurple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 9.6l-5.6 4.8 1.6 7.6L12 18l-6 4 1.6-7.6L2 9.6l7.6-.4z"/></svg>
          </div>
          <div className="ce-optionContent">
            <div className="ce-optionTitleRow">
              <span className="ce-optionTitle">Vivir una historia</span>
              <span className="ce-optionBadge">NUEVO</span>
            </div>
            <div className="ce-optionDesc">Tú eliges el camino,<br/>cada decisión cambia la historia</div>
          </div>
          <svg className="ce-optionChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button className="ce-optionCard" onClick={() => { window.location.href = `${p}/call/${girl.id}`; }}>
          <div className="ce-iconGreenWrap">
            <svg className="ce-iconGreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div className="ce-optionContent">
            <div className="ce-optionTitleRow">
              <span className="ce-optionTitle">Videollamada</span>
              <span className="ce-optionBadge ce-badgePremium">PREMIUM</span>
            </div>
            <div className="ce-optionDesc">Habla cara a cara con {girl.name}</div>
          </div>
          <svg className="ce-lockIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
        <p className="ce-premiumTitle">Funciones Premium</p>
        <div className="ce-premiumGrid">
          {[
            { icon: "image", label: "Fotos privadas", svg: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
            { icon: "mic", label: "Notas de voz", svg: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></> },
            { icon: "camera", label: "Selfies", svg: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></> },
            { icon: "file-text", label: "Respuestas largas", svg: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
          ].map((item) => (
            <div key={item.label} className="ce-premiumCard" aria-label={item.label}>
              <div className="ce-premiumLock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <svg className="ce-premiumIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{item.svg}</svg>
              <span className="ce-premiumCardText">{item.label}</span>
            </div>
          ))}
        </div>
        <button className="ce-premiumCta">
          <span className="ce-premiumCtaTitle">Desbloquea todo el contenido Premium</span>
          <span className="ce-premiumCtaDesc">Acceso ilimitado a todas las funciones exclusivas</span>
          <svg className="ce-premiumCtaChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    );
  }

  const p = bp();
  return (
    <div className="ce-chatRoot">
      <div className="ce-chatBg" style={{ backgroundImage: `url(${p}/chat-hot-pattern.svg)` }} />
      <div className="ce-chatOverlay" />
      <div className="ce-chatHeader">
        <div className="ce-chatHeaderInner">
          <button className="ce-chatBackBtn" onClick={() => { window.location.href = `${p}/girls`; }} aria-label="Volver">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          {girl.cloudinaryImage ? (
            <img src={girl.cloudinaryImage} alt={girl.name} className="ce-chatAvatar" />
          ) : (
            <div className="ce-chatAvatar" style={{ background: "linear-gradient(135deg,#ff4c98,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#f7f7f8" }}>{girl.name[0]}</div>
          )}
          <div className="ce-chatNameBlock">
            <div className="ce-chatName">{girl.name}</div>
            <div className="ce-chatStatus">
              <span className="ce-chatStatusDot" />
              <span className="ce-chatStatusText">En línea</span>
            </div>
          </div>
          <button className="ce-chatHeaderIcon" title="Videollamada" onClick={() => { window.location.href = `${p}/call/${girl.id}`; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </button>
          <button className="ce-chatHeaderIcon" title="Menú" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="ce-msgArea">
        {messages.map((m) => (
          <div key={m.id} className={`ce-msgRow ${m.from === "user" ? "ce-msgRight" : "ce-msgLeft"}`}>
            <div className={`ce-bubble ${m.from === "user" ? "ce-bubbleRight" : "ce-bubbleLeft"}`}>
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {typing && (
          <div className="ce-msgRow ce-msgLeft">
            <div className="ce-bubble ce-bubbleLeft" style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "hsla(240,7%,97%,.4)", animation: "ce-typingBounce 1.3s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        {error && <p style={{ textAlign: "center", fontSize: 12, color: "hsla(240,7%,97%,.3)", padding: 8 }}>{error}</p>}
      </div>
      <div className="ce-composer">
        <div className="ce-composerRow">
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, background: "hsla(0,0%,100%,.06)", borderRadius: 22, padding: "4px 4px 4px 16px", border: "1px solid hsla(0,0%,100%,.06)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe un mensaje..."
              disabled={blocked}
              style={{ flex: 1, minHeight: 34, maxHeight: 120, background: "none", border: 0, padding: 0, fontSize: 16, fontWeight: 400, color: "#f7f7f8", outline: "none", resize: "none", lineHeight: 1.3, fontFamily: "inherit" }}
            />
          </div>
          <button className="ce-cameraBtn" onClick={requestImage} disabled={blocked || typing} title="Pídeme una foto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button className="ce-sendBtn" onClick={send} disabled={blocked || typing || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
