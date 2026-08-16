"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Girl, minorBlockMessage } from "@/data/girls";
import { detectGender } from "@/lib/gender";
import { getCustomization } from "@/lib/storage";
import { getCustomGirls, CustomGirlData } from "@/lib/storage";
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
import styles from "./ChatExperience.module.css";

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
  const [mode, setMode] = useState<"text" | "actions">("text");
  const [showModePicker, setShowModePicker] = useState(true);
  const router = useRouter();
  const [customScenario, setCustomScenario] = useState("");
  const [activeCustom, setActiveCustom] = useState<CustomGirlData | null>(null);
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
    // La custom girl se identifica por la URL (?custom=id): solo se aplica a su chat.
    const customId = new URLSearchParams(window.location.search).get("custom");
    if (customId) {
      const g = getCustomGirls().find((x) => x.id === customId);
      if (g) {
        setActiveCustom(g);
        setShowModePicker(false);
        // Si definiÃ³ roleplay, entra directamente en modo historia.
        if (g.roleplayDesc?.trim()) {
          setMode("actions");
          const scenario = `Chica: ${g.girlDesc}\nRoleplay: ${g.roleplayDesc}`;
          setCustomScenario(scenario);
          setMessages([{ id: "welcome", from: "girl", text: g.roleplayDesc }]);
        } else {
          setMode("text");
        }
      }
    }
  }, []);

  useEffect(() => {
    // Si la custom girl aÃºn no tiene avatar (IA generÃ¡ndolo), lo recogemos cuando se guarde.
    const customId = new URLSearchParams(window.location.search).get("custom");
    if (!customId) return;
    const timer = window.setInterval(() => {
      const g = getCustomGirls().find((x) => x.id === customId);
      if (g) setActiveCustom(g);
    }, 3000);
    return () => window.clearInterval(timer);
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
      characterGender: detectGender(girl.name),
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
    const heroImg = activeCustom?.imageUrl || girl.cloudinaryImage;
    const heroName = activeCustom?.name || girl.name;
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button className={styles.topBarBtn} onClick={() => { window.location.href = `${p}/girls`; }} aria-label="Volver atrás">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <button className={`${styles.topBarBtn} ${styles.dotsBtn}`} aria-label="Menú">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
        <div className={styles.heroCard}>
          <div style={{ position: "relative" }}>
            <img src={heroImg} alt={heroName} className={styles.heroImage} />
            <div className={styles.heroGradient} />
            <div className={styles.heroInfo}>
              <div className={styles.heroNameRow}>
                <span className={styles.heroName}>{heroName}</span>
                <span className={styles.verifiedBadge}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.onlineDot} />
                <span className={styles.statusText}>En línea</span>
              </div>
            </div>
          </div>
          <a className={styles.personalityRow} href={`${p}/history/`}>
            <svg className={styles.personalityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className={styles.personalityText}>Historial con {girl.name}</span>
            <svg className={styles.personalityChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <p className={styles.question}>¿Qué quieres hacer?</p>
        <button className={styles.optionCard} onClick={() => { setMode("text"); setShowModePicker(false); if (scrollRef.current) setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100); }}>
          <div className={`${styles.optionIconWrap} ${styles.optionIconWrapPink}`}>
            <svg className={`${styles.optionIcon} ${styles.iconWhite}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>Enviar un mensaje</div>
            <div className={styles.optionDesc}>Habla libremente con {girl.name}</div>
          </div>
          <svg className={styles.optionChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button className={styles.optionCard} onClick={startRoleplay}>
          <div className={styles.iconPurpleWrap}>
            <svg className={styles.iconPurple} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 9.6l-5.6 4.8 1.6 7.6L12 18l-6 4 1.6-7.6L2 9.6l7.6-.4z"/></svg>
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitleRow}>
              <span className={styles.optionTitle}>Vivir una historia</span>
              <span className={styles.optionBadge}>NUEVO</span>
            </div>
            <div className={styles.optionDescMulti}>Tú eliges el camino,<br/>cada decisión cambia la historia</div>
          </div>
          <svg className={styles.optionChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button className={styles.optionCard} onClick={() => { router.push(`/call/${girl.id}?mode=voice`); }}>
          <div className={styles.iconBlueWrap}>
            <svg className={styles.iconBlue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>Llamada</div>
            <div className={styles.optionDesc}>Habla por voz con {girl.name}</div>
          </div>
          <svg className={styles.optionChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button className={styles.optionCard} onClick={() => { router.push(`/call/${girl.id}?mode=video`); }}>
          <div className={styles.iconGreenWrap}>
            <svg className={styles.iconGreen} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitleRow}>
              <span className={styles.optionTitle}>Videollamada</span>
              <span className={`${styles.optionBadge} ${styles.badgePremium}`}>PREMIUM</span>
            </div>
            <div className={styles.optionDesc}>Habla cara a cara con {girl.name}</div>
          </div>
          <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
        <p className={styles.premiumSectionTitle}>Funciones Premium</p>
        <div className={styles.premiumGrid}>
          {[
            { icon: "image", label: "Fotos privadas", svg: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
            { icon: "mic", label: "Notas de voz", svg: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></> },
            { icon: "camera", label: "Selfies personalizadas", svg: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></> },
            { icon: "file-text", label: "Respuestas más largas", svg: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> },
          ].map((item) => (
            <div key={item.label} className={styles.premiumCard} aria-label={item.label}>
              <div className={styles.premiumLock}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <svg className={styles.premiumIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{item.svg}</svg>
              <span className={styles.premiumCardText}>{item.label}</span>
            </div>
          ))}
        </div>
        <button className={styles.premiumCta}>
          <span className={styles.premiumCtaTitle}>Desbloquea todo el contenido Premium</span>
          <span className={styles.premiumCtaDesc}>Acceso ilimitado a todas las funciones exclusivas</span>
          <svg className={styles.premiumCtaChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    );
  }

  const p = bp();
  const avatarSrc = activeCustom?.imageUrl || girl.cloudinaryImage;
  const displayName = activeCustom?.name || girl.name;
  return (
    <div className={styles.chatRoot}>
      <div className={styles.chatBgPattern} />
      <div className={styles.chatBgOverlay} />
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInner}>
          <button className={styles.chatBackBtn} onClick={() => { window.location.href = `${p}/girls`; }} aria-label="Volver">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className={styles.chatAvatar} />
          ) : (
            <div className={styles.chatAvatarFallback}>{displayName[0]}</div>
          )}
          <div className={styles.chatNameBlock}>
            <div className={styles.chatName}>{displayName}</div>
            <div className={styles.chatStatus}>
              <span className={styles.chatStatusDot} />
              <span className={styles.chatStatusText}>En línea</span>
            </div>
          </div>
          <button className={`${styles.chatHeaderIcon} ${styles.video}`} title="Videollamada" onClick={() => { router.push(`/call/${girl.id}?mode=video`); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </button>
          <button className={`${styles.chatHeaderIcon} ${styles.menu}`} title="Menú" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className={styles.messagesArea}>
        {messages.map((m) => (
          <div key={m.id} className={`${styles.messageRow} ${m.from === "user" ? styles.messageRowRight : styles.messageRowLeft}`}>
            <div className={`${styles.bubble} ${m.from === "user" ? styles.bubbleRight : styles.bubbleLeft}`}>
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {typing && (
          <div className={`${styles.messageRow} ${styles.messageRowLeft}`}>
            <div className={`${styles.typingBubble}`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={styles.typingDot} />
              ))}
            </div>
          </div>
        )}
        {error && <p style={{ textAlign: "center", fontSize: 12, color: "hsla(240,7%,97%,.3)", padding: 8 }}>{error}</p>}
      </div>
      <div className={styles.composer}>
        <div className={styles.composerRow}>
          <div className={styles.composerInputWrap}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe un mensaje..."
              disabled={blocked}
              className={styles.composerInput}
            />
          </div>
          <button className={styles.cameraBtn} onClick={requestImage} disabled={blocked || typing} title="Pídeme una foto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button className={styles.sendBtn} onClick={send} disabled={blocked || typing || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
