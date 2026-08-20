"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Girl, minorBlockMessage } from "@/data/girls";
import { detectGender } from "@/lib/gender";
import { getCustomization } from "@/lib/storage";
import { getCustomGirls, CustomGirlData } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
import { sendChatMessage } from "@/lib/chatClient";
import { sttAudio, ttsText, getGirlVoice, getCustomGirlVoice } from "@/lib/voiceClient";
import {
  saveConversationHistory,
  getConversationHistory,
  getConversationSummary,
  saveConversationSummary,
  getSavedMode,
  getUserMemory,
  saveUserMemory,
  extractMemoryFromMessages,
  buildSummary,
  clearAllMemory,
  clearGirlData,
  saveToHistory,
  saveMode,
  clearUnreadReply,
  ChatMessage,
} from "@/lib/memory";
import styles from "./ChatExperience.module.css";

const MINOR_KEYWORDS = [
  "soy menor", "tengo 17", "tengo 16", "tengo 15", "tengo 14",
  "tengo 13", "menor de edad", "soy niño", "soy niña",
];

const bp = () => process.env.NEXT_PUBLIC_BASE_PATH || "";

function looksLikeVisionRefusal(text: string): boolean {
  return /(no\s+(puedo|puede|puedes)\s+(ver|analizar|acceder|accedo)|no\s+tengo\s+(acceso|capacidad|permiso|forma)|cannot\s+(see|view|access|analyse|analyze)|can'?t\s+(see|view|access|analyse|analyze)|no\s+puedo\s+verla|no\s+puedo\s+verlas|no\s+soy\s+capaz)/i.test(text);
}

function photoFallbackReaction(): string {
  return "*me quedo mirando la foto un buen rato*\nUf, vaya foto… se me ha puesto la piel de gallina. Cuando quieras te enseño lo bien que se me da corresponderte 😏";
}

function barsFrom(seed: string): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let x = h || 1;
  const bars: number[] = [];
  for (let i = 0; i < 26; i++) {
    x = (x * 1103515245 + 12345) >>> 0;
    bars.push((x % 70) + 15);
  }
  return bars;
}

type ChatMsg = { id: string; from: "user" | "girl"; text: string; audio?: string; image?: string; note?: string };

export default function ChatWindow({ girl }: { girl: Girl }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "actions">("text");
  const [showModePicker, setShowModePicker] = useState(true);
  const router = useRouter();
  const [customScenario, setCustomScenario] = useState("");
  const [activeCustom, setActiveCustom] = useState<CustomGirlData | null>(null);
  const [recording, setRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [chatMenu, setChatMenu] = useState(false);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const welcomeNameRef = useRef("");
  const skipWelcomeRef = useRef(false);
  const forcePickerRef = useRef(false);
  const forceStoryRef = useRef(false);
  const storyReplyRef = useRef("");
  const storySentRef = useRef("");
  const skipSaveRef = useRef(false);
  const storyChatRef = useRef(false);
  const interactedRef = useRef(false);
  const activeCustomJsonRef = useRef("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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
    // ?picker=1 fuerza mostrar el selector (roleplay / vivir una historia) al llegar.
    // ?reply= trae la respuesta de la chica desde una historia.
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("picker") === "1") forcePickerRef.current = true;
    // ?story=1 entra directamente a "Vivir una historia" (rolplay) sin selector.
    if (qs.get("story") === "1") forceStoryRef.current = true;
    const replyParam = qs.get("reply");
    if (replyParam) {
      storyReplyRef.current = replyParam;
      // Venir de una historia = chat directo, nunca el selector.
      setShowModePicker(false);
    }
    const sentParam = qs.get("sent");
    if (sentParam) storySentRef.current = sentParam;
    const customId = qs.get("custom");
    if (customId) {
      const g = getCustomGirls().find((x) => x.id === customId);
      if (g) {
        welcomeNameRef.current = g.name;
        setActiveCustom(g);
        skipWelcomeRef.current = true;
        clearUnreadReply(g.id);
        const saved = getConversationHistory(g.id);
        if (forceStoryRef.current) {
          // Chatear = entrar directo a "Vivir una historia".
          setShowModePicker(false);
          setMode("actions");
          const scenario = `Chica: ${g.girlDesc}\nRoleplay: ${g.roleplayDesc}`;
          setCustomScenario(scenario);
          setMessages([{ id: "welcome", from: "girl", text: g.roleplayDesc || `Hola, soy ${g.name}. Qué bien que hayas entrado` }]);
        } else if (forcePickerRef.current) {
          // Chatear desde el historial: siempre mostrar el selector (mensaje / vivir una historia).
          setShowModePicker(true);
          setMessages([{ id: "welcome", from: "girl", text: g.roleplayDesc || `Hola, soy ${g.name}. Qué bien que hayas entrado` }]);
        } else if (saved.length > 0) {
          // Reanudar la conversación exactamente donde se dejó.
          setShowModePicker(false);
          setMode(getSavedMode(g.id) ?? "text");
          setMessages(saved.map((m, i) => ({ id: `resume-${i}`, from: m.role === "user" ? "user" : "girl", text: m.content })));
        } else if (g.roleplayDesc?.trim()) {
          setShowModePicker(false);
          setMode("actions");
          const scenario = `Chica: ${g.girlDesc}\nRoleplay: ${g.roleplayDesc}`;
          setCustomScenario(scenario);
          setMessages([{ id: "welcome", from: "girl", text: g.roleplayDesc }]);
        } else {
          setShowModePicker(false);
          setMode("text");
          setMessages([{ id: "welcome", from: "girl", text: `Hola, soy ${g.name}. Qué bien que hayas entrado` }]);
        }
      }
    }
    clearUnreadReply(girl.id);
    // Limpiar de la URL los parámetros temporales (reply/picker/sent).
    // ?story=1 NO se limpia: hacerlo remonta el chat y pierde "Vivir una historia".
    if (replyParam || qs.get("picker") === "1" || sentParam) {
      qs.delete("reply");
      qs.delete("picker");
      qs.delete("sent");
      const clean = qs.toString();
      router.replace(`/chat/${girl.id}${clean ? "?" + clean : ""}`, { scroll: false });
    }
  }, [router, girl.id]);

  useEffect(() => {
    // Si la custom girl aún no tiene avatar (IA generándolo), lo recogemos cuando se guarde.
    const customId = new URLSearchParams(window.location.search).get("custom");
    if (!customId) return;
    const timer = window.setInterval(() => {
      const g = getCustomGirls().find((x) => x.id === customId);
      if (g) {
        const gj = JSON.stringify(g);
        if (gj !== activeCustomJsonRef.current) {
          activeCustomJsonRef.current = gj;
          setActiveCustom(g);
        }
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (messagesRef.current.length > 0 || skipWelcomeRef.current) return;
    // Chatear = entrar directo a "Vivir una historia".
    if (forceStoryRef.current) {
      setShowModePicker(false);
      setMode("actions");
      setCustomScenario(girl.story);
      const pick = girl.roleplayGreetings[Math.floor(Math.random() * girl.roleplayGreetings.length)];
      setMessages([{ id: "welcome", from: "girl", text: pick }]);
      return () => { mountedRef.current = false; };
    }
    // Venir de una historia: la chica te contesta y se muestra "Respondiste a su historia".
    if (storyReplyRef.current) {
      const reply = storyReplyRef.current;
      storyReplyRef.current = "";
      skipWelcomeRef.current = true;
      storyChatRef.current = true;
      const sent = storySentRef.current;
      storySentRef.current = "";
      // Reacciones y mensajes con la misma chica van acumulándose en un solo chat:
      // se carga lo ya guardado y se añade la nueva reacción sin duplicar.
      const storageId = activeCustom?.id ?? girl.id;
      const saved = getConversationHistory(storageId);
      const alreadySaved = sent
        ? saved.some((m) => m.role === "user" && m.content === sent)
        : saved.some((m) => m.role === "assistant" && m.content === reply);
      setMessages([
        ...saved.map((m, i) => ({ id: `resume-${i}`, from: m.role === "user" ? "user" as const : "girl" as const, text: m.content })),
        ...(alreadySaved
          ? []
          : sent
            ? [
                { id: "story-ctx-user", from: "user", note: "Respondiste a su historia", text: sent } as ChatMsg,
                { id: "story-ctx", from: "girl", text: reply } as ChatMsg,
              ]
            : [{ id: "story-ctx", from: "girl", note: "Respondiste a su historia", text: reply } as ChatMsg]),
      ]);
      if (!alreadySaved) interactedRef.current = true;
      setMode("text");
      setShowModePicker(false);
      return;
    }
    // Reanudar la conversación exactamente donde se dejó.
    const saved = getConversationHistory(girl.id);
    if (saved.length > 0 && !forcePickerRef.current) {
      setMessages(saved.map((m, i) => ({ id: `resume-${i}`, from: m.role === "user" ? "user" : "girl", text: m.content })));
      setMode(getSavedMode(girl.id) ?? "text");
      setShowModePicker(false);
      return () => { mountedRef.current = false; };
    }
    // Sin historial: cada entrada es un chat nuevo con saludo.
    const name = welcomeNameRef.current || girl.name;
    const welcomes = [
      `Hola, soy ${name}. Qué bien que hayas entrado`,
      `¡Hey! Soy ${name}, me alegra verte por aquí`,
      `${name} al habla... justo estaba pensando en ti`,
      `Hola, ¿recuerdas a ${name}? Pasa, siéntete como en casa`,
      `Soy ${name}. Estaba esperando a que entrases...`,
    ];
    setMessages([{ id: "welcome", from: "girl", text: welcomes[Math.floor(Math.random() * welcomes.length)] }]);
    if (!forcePickerRef.current) {
      setMode("text");
      setShowModePicker(false);
    }
    return () => { mountedRef.current = false; };
  }, [girl.id, girl.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (skipSaveRef.current) return;
      const chatMsgs = messagesRef.current
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.from === "user" ? "user" as const : "assistant" as const, content: m.text }));
      if (chatMsgs.length > 1) {
        const storageId = activeCustom?.id ?? girl.id;
        const girlName = activeCustom?.name ?? girl.name;
        // La pantalla ya contiene la conversación acumulada, así que se guarda tal cual.
        saveConversationHistory(storageId, chatMsgs);
        // Solo se crea una nueva entrada del historial si hubo interacción nueva.
        if (interactedRef.current) {
          saveToHistory(storageId, girlName, chatMsgs);
        }
      }
    };
  }, [girl.id, girl.name, activeCustom]);

  async function startRoleplay() {
    setMode("actions");
    setShowModePicker(false);
    if (activeCustom) {
      const scenario = `Chica: ${activeCustom.girlDesc}\nRoleplay: ${activeCustom.roleplayDesc}`;
      setCustomScenario(scenario);
      setMessages([{ id: "welcome", from: "girl", text: activeCustom.roleplayDesc }]);
    } else {
      setCustomScenario(girl.story);
      const pick = girl.roleplayGreetings[Math.floor(Math.random() * girl.roleplayGreetings.length)];
      setMessages([{ id: "welcome", from: "girl", text: pick }]);
    }
  }

  // Recuerda el modo (texto o historia) de cada conversación.
  useEffect(() => {
    if (mode === "text" || mode === "actions") {
      saveMode(activeCustom?.id ?? girl.id, mode);
    }
  }, [mode, girl.id, activeCustom]);

  const history: ChatMessage[] = messages
    .filter((m) => m.id !== "welcome")
    .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

  const buildPayload = useCallback((text: string, image?: string) => {
    const storageId = activeCustom?.id ?? girl.id;
    const custom = getCustomization(girl.id);
    const memory = getUserMemory(storageId);
    const summary = getConversationSummary(storageId);

    return {
      message: text,
      girlId: activeCustom?.id ?? girl.id,
      girlName: activeCustom?.name ?? girl.name,
      girlStyle: activeCustom?.girlDesc ?? girl.style,
      girlPersonality: activeCustom?.personality ?? custom?.personality ?? girl.personality,
      customization: custom || {},
      history,
      memory,
      summary,
      mode,
      userGender: (typeof window !== "undefined" ? (localStorage.getItem("lunacall_gender") || "hombre") : "hombre") as "hombre" | "mujer",
      characterGender: detectGender(activeCustom?.name ?? girl.name),
      customScenario: customScenario || undefined,
      image,
    };
  }, [girl, history, mode, customScenario, activeCustom]);

  const askAI = useCallback(async (text: string, opts?: { image?: string }): Promise<string> => {
    const payload = buildPayload(text, opts?.image);
    const reply = await sendChatMessage(payload);
    if (!mountedRef.current) throw new Error("unmounted");
    return reply;
  }, [buildPayload]);

  const persistPair = useCallback((userText: string, replyText: string) => {
    const storageId = activeCustom?.id ?? girl.id;
    const chatHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: userText },
      { role: "assistant", content: replyText },
    ];
    saveConversationHistory(storageId, chatHistory);
    const extracted = extractMemoryFromMessages(chatHistory);
    if (extracted.length > 0) {
      const existing = getUserMemory(storageId);
      const merged = [...new Map([...existing, ...extracted].map((m) => [m, m])).values()];
      saveUserMemory(storageId, merged.slice(-30));
    }
    if (chatHistory.length > 20) {
      const sum = buildSummary(chatHistory);
      if (sum) saveConversationSummary(storageId, sum);
    }
  }, [history, activeCustom]);

  async function runReply(text: string, opts?: { image?: string; fallbackText?: string; silent?: boolean }) {
    const userText = opts?.fallbackText ?? text;
    interactedRef.current = true;
    try {
      const reply = await askAI(text, { image: opts?.image });
      if (mountedRef.current) {
        if (!opts?.silent) setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: reply }]);
        persistPair(userText, reply);
        setError(null);
      }
      return reply;
    } catch (err: any) {
      console.warn("[Chat] AI error:", err);
      const fallback = getFallbackResponse(userText);
      if (mountedRef.current) {
        if (!opts?.silent) setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: fallback }]);
        persistPair(userText, fallback);
        setError(err?.message || "Usando modo offline.");
      }
      return fallback;
    }
  }

  async function send() {
    if (blocked || typing) return;
    const text = input.trim();
    if (!text) return;
    setError(null);

    if (MINOR_KEYWORDS.some((k) => text.toLowerCase().includes(k))) {
      interactedRef.current = true;
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
    try {
      await runReply(text);
    } finally {
      setTyping(false);
    }
  }

  function clearMemory() {
    clearAllMemory(girl.id);
    setMessages([{ id: "welcome", from: "girl", text: `Hola, soy ${girl.name}. Qué bien que hayas entrado` }]);
    setError(null);
    setBlocked(false);
  }

  function deleteChatForever() {
    const storageId = activeCustom?.id ?? girl.id;
    clearGirlData(storageId);
    setMessages([{ id: crypto.randomUUID(), from: "girl", text: `Hola, soy ${displayName}. Qué bien que hayas entrado` }]);
    setError(null);
    setBlocked(false);
    setConfirmDeleteChat(false);
    setChatMenu(false);
  }

  function pickAudioMime() {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
    }
    return "audio/webm";
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  function togglePlay(id: string, src: string) {
    const player = audioPlayerRef.current || new Audio();
    audioPlayerRef.current = player;
    if (playingId === id) {
      player.pause();
      setPlayingId(null);
      return;
    }
    player.src = src;
    player.onended = () => setPlayingId(null);
    player.play().catch(() => setPlayingId(null));
    setPlayingId(id);
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (blocked || typing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickAudioMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        setRecording(false);
        await sendAudio(blob);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      setError("No se pudo acceder al micrófono");
    }
  }

  async function sendAudio(blob: Blob) {
    if (blocked || typing) return;
    setError(null);
    setTyping(true);
    try {
      const transcript = await sttAudio(blob);
      if (!transcript.trim()) {
        setTyping(false);
        setError("No te he entendido, repítelo");
        return;
      }
      const audioUrl = await blobToDataUrl(blob);
      const userMsg: ChatMsg = { id: crypto.randomUUID(), from: "user", text: transcript, audio: audioUrl };
      setMessages((m) => [...m, userMsg]);

      const reply = await runReply(transcript, { silent: true });
      let replyAudio = "";
      try {
        const tts = await ttsText(reply.replace(/\*/g, "").trim(), activeCustom ? getCustomGirlVoice(activeCustom.id) : getGirlVoice(girl.id));
        if (tts?.audio) replyAudio = `data:${tts.contentType};base64,${tts.audio}`;
      } catch {
        replyAudio = "";
      }
      if (mountedRef.current) {
        if (replyAudio) {
          setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: reply, audio: replyAudio }]);
        } else {
          setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: reply }]);
        }
      }
    } catch (err: any) {
      console.warn("[Chat] audio error:", err);
      if (mountedRef.current) setError(err?.message || "Error al procesar la nota de voz");
    } finally {
      setTyping(false);
    }
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        sendPhoto(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function sendPhoto(dataUrl: string) {
    if (blocked || typing) return;
    const text = "Te mando una foto 📷";
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "user", text, image: dataUrl }]);
    setError(null);
    setTyping(true);
    try {
      let reply = await askAI(text, { image: dataUrl });
      if (looksLikeVisionRefusal(reply)) {
        reply = await askAI("Mira bien la foto que te acabo de mandar, dime exactamente qué ves en ella y reacciona.", { image: dataUrl });
      }
      if (looksLikeVisionRefusal(reply)) {
        reply = photoFallbackReaction();
      }
      if (mountedRef.current) {
        setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: reply }]);
        persistPair(text, reply);
      }
    } catch (err: any) {
      console.warn("[Chat] photo error:", err);
      const fallback = getFallbackResponse(text);
      if (mountedRef.current) {
        setMessages((m) => [...m, { id: crypto.randomUUID(), from: "girl", text: fallback }]);
        persistPair(text, fallback);
        setError(err?.message || "Usando modo offline.");
      }
    } finally {
      setTyping(false);
    }
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
          <button className={styles.topBarBtn} onClick={() => { if (window.history.length > 1) router.back(); else router.push("/girls"); }} aria-label="Volver atrás">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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
          <a className={styles.personalityRow} href={`${p}/history/${activeCustom ? `?custom=${activeCustom.id}` : `?girl=${girl.id}`}`}>
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
        <button className={styles.optionCard} onClick={() => { router.push(`/call/${girl.id}?mode=voice${activeCustom ? `&custom=${activeCustom.id}` : ""}`); }}>
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

  const avatarSrc = activeCustom?.imageUrl || girl.cloudinaryImage;
  const displayName = activeCustom?.name || girl.name;
  return (
    <div className={styles.chatRoot}>
      <div className={styles.chatBgPattern} />
      <div className={styles.chatBgOverlay} />
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInner}>
          <button className={styles.chatBackBtn} onClick={() => { if (window.history.length > 1) router.back(); else router.push("/girls"); }} aria-label="Volver">
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
          <button className={`${styles.chatHeaderIcon} ${styles.video}`} title="Videollamada" onClick={() => { router.push(`/call/${girl.id}?mode=video${activeCustom ? `&custom=${activeCustom.id}` : ""}`); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </button>
          <button className={`${styles.chatHeaderIcon} ${styles.video}`} title="Llamada de voz" onClick={() => { router.push(`/call/${girl.id}?mode=voice${activeCustom ? `&custom=${activeCustom.id}` : ""}`); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </button>
          <button className={`${styles.chatHeaderIcon} ${styles.menu}`} title="Menú" onClick={() => setChatMenu((v) => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className={styles.messagesArea}>
        {messages.map((m) => (
          <div key={m.id} className={`${styles.messageRow} ${m.from === "user" ? styles.messageRowRight : styles.messageRowLeft}`}>
            {m.note && (
              <div style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "hsla(240,7%,97%,.38)", margin: "0 0 6px" }}>{m.note}</div>
            )}
            <div className={`${styles.bubble} ${m.from === "user" ? styles.bubbleRight : styles.bubbleLeft}`}>
              {m.image ? (
                <div className={styles.photoWrap}>
                  <img
                    src={m.image}
                    alt="Foto"
                    className={styles.photoImg}
                    onClick={() => window.open(m.image as string, "_blank")}
                  />
                </div>
              ) : m.audio ? (
                <AudioBubble
                  id={m.id}
                  src={m.audio as string}
                  transcript={m.text}
                  isPlaying={playingId === m.id}
                  onPlay={() => togglePlay(m.id, m.audio as string)}
                />
              ) : (
                renderText(m.text)
              )}
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
          <button
            className={`${styles.actionBtn} ${recording ? styles.recordingBtn : ""}`}
            onClick={toggleRecording}
            disabled={blocked || (typing && !recording)}
            title={recording ? "Detener grabación" : "Nota de voz"}
          >
            {recording ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            )}
          </button>
          <div className={styles.composerInputWrap}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={recording ? "Grabando..." : "Escribe un mensaje..."}
              disabled={blocked || recording}
              className={styles.composerInput}
            />
            {recording && (
              <span className={styles.recordingHint}>
                <span className={styles.recordingDot} />
              </span>
            )}
          </div>
          <button className={styles.actionBtn} onClick={() => fileRef.current?.click()} disabled={blocked || typing} title="Enviar una foto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPhoto} />
          <button className={styles.sendBtn} onClick={send} disabled={blocked || typing || !input.trim() || recording}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
      {chatMenu && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setChatMenu(false)}>
          <div className="mb-5 w-full max-w-[360px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#15151a]/95 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                setChatMenu(false);
                router.push(`/history?${activeCustom ? `custom=${activeCustom.id}` : `girl=${girl.id}`}`);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </span>
              <span className="text-sm font-semibold text-white">Historial con {displayName}</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteChat(true)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-white/[0.06] active:scale-[0.99]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </span>
              <span className="text-sm font-semibold text-[#ff5f8f]">Borrar chat para siempre</span>
            </button>
          </div>
        </div>
      )}
      {confirmDeleteChat && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-black/80 px-6 backdrop-blur-md" onClick={() => setConfirmDeleteChat(false)}>
          <div className="my-auto w-full max-w-[340px] rounded-3xl border border-white/[0.08] bg-[#15151a]/95 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff2f78]/15 text-[#ff5f8f]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-white">Borrar chat para siempre</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Se borrará <span className="font-semibold text-white/80">para siempre</span> la conversación con {displayName} y nunca volverá a aparecer. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-2.5">
              <button onClick={() => setConfirmDeleteChat(false)} className="h-12 flex-1 rounded-2xl bg-white/[0.06] text-sm font-bold text-white/80 transition hover:bg-white/[0.1] active:scale-[0.98]">
                Cancelar
              </button>
              <button onClick={deleteChatForever} className="h-12 flex-1 rounded-2xl bg-[#ff2f78] text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]">
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AudioBubble({
  id,
  src,
  transcript,
  isPlaying,
  onPlay,
}: {
  id: string;
  src: string;
  transcript: string;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const [dur, setDur] = useState("0:00");
  const [showTrans, setShowTrans] = useState(false);

  useEffect(() => {
    const a = new Audio(src);
    a.onloadedmetadata = () => {
      const s = Math.round(a.duration);
      if (Number.isFinite(s)) setDur(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    };
    return () => { a.src = ""; };
  }, [src]);

  const bars = useMemo(() => barsFrom(id + src), [id, src]);

  return (
    <>
      <div className={`${styles.audioWrap} ${isPlaying ? styles.audioPlaying : ""}`}>
        <button className={styles.audioPlayBtn} onClick={onPlay} title={isPlaying ? "Pausar" : "Reproducir"}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div className={styles.audioWave}>
          {bars.map((h, i) => (
            <span
              key={i}
              className={styles.waveBar}
              style={{ height: `${h}%`, animationDelay: `${(i % 8) * 0.09}s` }}
            />
          ))}
        </div>
        <span className={styles.audioTime}>{dur}</span>
      </div>
      <div className={styles.audioTransRow}>
        {showTrans ? (
          <span className={styles.audioTransText}>{transcript}</span>
        ) : (
          <button type="button" className={styles.transcribeBtn} onClick={() => setShowTrans(true)}>
            transcribir
          </button>
        )}
      </div>
    </>
  );
}
