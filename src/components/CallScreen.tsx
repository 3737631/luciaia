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
  saveToHistory,
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

const SILENCE_TIMEOUT_MS = 1500;

export default function CallScreen({ girl }: { girl: Girl }) {
  const custom = getCustomization(girl.id);
  const background = custom?.background ?? girl.defaultBackground;

  const [talking, setTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [statusText, setStatusText] = useState("Conectando...");
  const [interimText, setInterimText] = useState("");
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const doAIRef = useRef<((text: string) => Promise<string | undefined>) | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SpeechRecognition =
    (typeof window !== "undefined") &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const welcome = `Hola, soy ${girl.name}. ¿Cómo estás?`;
    const welcomeMsg: ChatMessage = { role: "assistant", content: welcome };
    setMessages([welcomeMsg]);
    setTimeout(() => speak(welcome), 800);
  }, [girl.id, girl.name]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showTextPanel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextPanel]);

  function speak(text: string) {
    setLastReply(text);
    setStatusText("Hablando...");
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const spanish = voices.find((v) => v.lang?.toLowerCase().startsWith("es"));
    if (spanish) utterance.voice = spanish;
    utterance.rate = 1.1;
    setTalking(true);
    utterance.onend = () => {
      setTalking(false);
      setStatusText("Escuchando...");
    };
    window.speechSynthesis.speak(utterance);
  }

  function resetSilenceTimer() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      const text = finalTranscriptRef.current.trim();
      if (text && !isProcessingRef.current && mountedRef.current) {
        isProcessingRef.current = true;
        finalTranscriptRef.current = "";
        setInterimText("");
        setThinking(true);
        setStatusText("Pensando...");
        doAIRef.current?.(text).finally(() => {
          isProcessingRef.current = false;
          setThinking(false);
        });
      }
    }, SILENCE_TIMEOUT_MS);
  }

  async function requestMicPermission(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return !!SpeechRecognition;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      setStatusText("Permiso de micrófono denegado");
      return false;
    }
  }

  async function startListening() {
    if (!SpeechRecognition || recognitionRef.current) return;
    setStatusText("Solicitando micrófono...");
    const granted = await requestMicPermission();
    if (!granted) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (isProcessingRef.current || talking) return;
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimText(interim);
      if (interim || finalTranscriptRef.current.trim()) {
        resetSilenceTimer();
      }
    };

    recognition.onerror = (err: SpeechRecognitionErrorEvent) => {
      setListening(false);
      if (err.error === "not-allowed") {
        setStatusText("Bloquea el micrófono en el navegador");
      } else {
        setStatusText("Micrófono no disponible");
      }
    };

    recognition.onstart = () => {
      setListening(true);
      setStatusText("Escuchando...");
    };

    recognition.onend = () => {
      setListening(false);
      if (mountedRef.current && !isProcessingRef.current) {
        recognition.start();
      }
    };

    recognition.start();
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setListening(false);
    setInterimText("");
  }

  const doAI = useCallback(async (text: string) => {
    const currentHistory = getConversationHistory(girl.id);
    const memory = getUserMemory(girl.id);
    const summary = getConversationSummary(girl.id);

    const payload = {
      message: text,
      girlId: girl.id,
      girlName: girl.name,
      girlStyle: girl.style,
      girlPersonality: custom?.personality ?? girl.personality,
      customization: custom || {},
      history: currentHistory,
      memory,
      summary,
      mode: "text" as const,
    };

    try {
      const reply = await sendChatMessage(payload);
      if (!mountedRef.current) return;
      const replyMessage: ChatMessage = { role: "assistant", content: reply };
      const updatedMsgs = [...currentHistory, { role: "user" as const, content: text }, replyMessage];
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
      if (!mountedRef.current) return;
      const fallback = getFallbackResponse(text);
      const replyMessage: ChatMessage = { role: "assistant", content: fallback };
      const updatedMsgs = [...currentHistory, { role: "user" as const, content: text }, replyMessage];
      setMessages(updatedMsgs);
      speak(fallback);
      saveConversationHistory(girl.id, updatedMsgs);
      return fallback;
    }
  }, [girl, custom]);

  doAIRef.current = doAI;

  useEffect(() => {
    const timer = setTimeout(() => {
      startListening();
      setStatusText("Escuchando...");
    }, 2000);
    return () => {
      clearTimeout(timer);
      stopListening();
    };
  }, []);

  async function sendText() {
    const text = textInput.trim();
    if (!text || thinking) return;
    setTextInput("");
    setThinking(true);
    setStatusText("Pensando...");
    await doAI(text);
    setThinking(false);
  }

  function hangUp() {
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    saveToHistory(girl.id, girl.name, messages);
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    window.location.href = `${base}/girls`;
  }

  function clearMemory() {
    clearAllMemory(girl.id);
    setMessages([]);
    setLastReply(null);
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b ${backgroundGradients[background]} px-5 py-8`}>
      <div className="w-full flex items-center justify-between text-sm">
        <div>
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-muted">{formatDuration(callDuration)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs ${talking ? "text-green-400" : listening ? "text-pink" : "text-muted"}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${talking ? "bg-green-400 animate-pulse" : listening ? "bg-pink animate-pulse" : "bg-muted"}`} />
            {statusText}
          </span>
          <button
            onClick={clearMemory}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-muted hover:bg-white/20"
            title="Borrar memoria de esta chica"
          >
            Borrar memoria
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <Avatar
          name={girl.id}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          hair={custom?.hair ?? girl.defaultHair}
          outfit={custom?.outfit ?? girl.defaultOutfit}
          background={custom?.background ?? girl.defaultBackground}
          size={220}
          animated
          talking={talking}
        />
        {interimText && listening && (
          <p className="mt-6 max-w-sm text-center text-sm text-ink/60 animate-fadeUp italic">
            {interimText}
          </p>
        )}
        {lastReply && !interimText && (
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
        <p className="mt-3 text-center text-xs text-muted">
          {thinking ? "La IA está pensando..." : talking ? `${girl.name} está hablando...` : listening ? "Habla con naturalidad, ella te escucha" : "Llamada en curso"}
        </p>
      </div>
    </div>
  );
}
