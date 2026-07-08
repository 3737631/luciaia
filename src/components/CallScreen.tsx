"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getCustomization } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
import { sendChatMessage } from "@/lib/chatClient";
import { sttAudio } from "@/lib/voiceClient";
import {
  getConversationHistory,
  saveConversationHistory,
  getConversationSummary,
  getUserMemory,
  saveUserMemory,
  extractMemoryFromMessages,
  buildSummary,
  saveConversationSummary,
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

const voiceProfiles: Record<string, { pitch: number; rate: number }> = {
  luna:  { pitch: 1.15, rate: 0.92 },
  nia:   { pitch: 1.05, rate: 1.05 },
  vera:  { pitch: 0.88, rate: 0.85 },
  alma:  { pitch: 1.1,  rate: 0.9 },
  kira:  { pitch: 0.95, rate: 1.0 },
  maya:  { pitch: 1.2,  rate: 1.08 },
  sasha: { pitch: 0.82, rate: 0.88 },
  yuki:  { pitch: 1.3,  rate: 0.82 },
};

type Mode = "idle" | "listening" | "processing" | "speaking";
const CHUNK_MS = 2000;
const DEBOUNCE_MS = 1200;

export default function CallScreen({ girl }: { girl: Girl }) {
  const custom = getCustomization(girl.id);
  const background = custom?.background ?? girl.defaultBackground;

  const [callState, setCallState] = useState<"ringing" | "connecting" | "connected">("ringing");
  const [mode, setMode] = useState<Mode>("idle");
  const [thinking, setThinking] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const doAIRef = useRef<((text: string) => Promise<string | undefined>) | null>(null);

  const shouldListenRef = useRef(false);
  const modeRef = useRef<Mode>("idle");
  const speechBufferRef = useRef("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringbackRef = useRef<{ ctx: AudioContext; osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  function startRingback() {
    if (ringbackRef.current) return;
    try {
      const ctx = new AudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.value = 440;
      osc2.type = "sine";
      osc2.frequency.value = 480;
      gain.gain.value = 0;
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      ringbackRef.current = { ctx, osc1, osc2, gain };
      const now = ctx.currentTime;
      const cycle = (t: number) => {
        if (!ringbackRef.current) return;
        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.setValueAtTime(0, now + t + 2);
      };
      for (let i = 0; i < 30; i++) cycle(i * 6);
    } catch {}
  }

  function stopRingback() {
    if (ringbackRef.current) {
      try {
        ringbackRef.current.osc1.stop();
        ringbackRef.current.osc2.stop();
        ringbackRef.current.ctx.close();
      } catch {}
      ringbackRef.current = null;
    }
  }

  function ph(m: Mode) {
    modeRef.current = m;
    setMode(m);
  }

  useEffect(() => {
    if (callState === "ringing") {
      startRingback();
      const autoTimer = setTimeout(() => {
        if (mountedRef.current) answerCall();
      }, 3000);
      return () => { clearTimeout(autoTimer); stopRingback(); };
    } else {
      stopRingback();
    }
  }, [callState]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesRef.current = v;
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    setTimeout(load, 200);
  }, []);

  useEffect(() => {
    if (showTextPanel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextPanel]);

  function findBestVoice(): SpeechSynthesisVoice | null {
    const voices = voicesRef.current;
    if (!voices.length) return null;
    const es = voices.filter((v) => v.lang.startsWith("es"));
    const neural = es.find((v) =>
      ["neural", "natural", "premium", "good", "enhanced", "multilingual", "sabina", "helena", "teresa", "elvira", "maria", "dalia"]
        .some((k) => v.name.toLowerCase().includes(k))
    );
    if (neural) return neural;
    const msft = es.find((v) => v.name.toLowerCase().includes("microsoft"));
    if (msft) return msft;
    const google = es.find((v) => v.name.toLowerCase().includes("google"));
    if (google) return google;
    if (es.length > 0) return es[es.length - 1];
    return voices[voices.length - 1];
  }

  async function acquireMic(): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      if (e.name === "NotAllowedError") setMicError("Permiso denegado. Toca para activar");
      else if (e.name === "NotFoundError") setMicError("No hay micrófono");
      else setMicError("Error al abrir micrófono");
      return null;
    }
  }

  function releaseMic() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function speakBrowser(text: string, done: () => void) {
    if (!window.speechSynthesis) { done(); return; }
    if (voicesRef.current.length === 0) {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findBestVoice();
    const profile = voiceProfiles[girl.id] || voiceProfiles.luna;
    if (voice) utterance.voice = voice;
    utterance.pitch = profile.pitch + (Math.random() * 0.1 - 0.05);
    utterance.rate = profile.rate;
    utterance.volume = 1;
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    speakTimerRef.current = setTimeout(done, text.length * 60 + 2000);
  }

  function speak(text: string, onDone?: () => void) {
    if (typeof window === "undefined") return;
    shouldListenRef.current = false;
    stopRecorder();
    stopSpeechRecognition();
    releaseMic();
    ph("speaking");
    setStatusText("Hablando...");
    setLastReply(text);
    window.speechSynthesis.cancel();
    const done = onDone || (() => {
      if (mountedRef.current) acquireMicAndListen();
    });
    import("@/lib/voiceClient").then(({ ttsText }) => {
      ttsText(text).then((result) => {
        if (!mountedRef.current) return;
        const audioSrc = `data:${result.contentType};base64,${result.audio}`;
        const el = new Audio(audioSrc);
        el.onended = done;
        el.onerror = () => { if (mountedRef.current) speakBrowser(text, done); };
        el.play().catch(() => { if (mountedRef.current) speakBrowser(text, done); });
      }).catch(() => {
        if (mountedRef.current) speakBrowser(text, done);
      });
    }).catch(() => {
      if (mountedRef.current) speakBrowser(text, done);
    });
  }

  async function acquireMicAndListen() {
    if (!mountedRef.current) return;
    const stream = await acquireMic();
    if (stream && mountedRef.current) {
      streamRef.current = stream;
      startListening();
    } else if (mountedRef.current) {
      ph("idle");
    }
  }

  function startListening() {
    if (!streamRef.current || !mountedRef.current) return;
    if (shouldListenRef.current) return;
    shouldListenRef.current = true;
    ph("listening");
    setStatusText("Te escucho");
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      startSR(new SR());
    } else {
      startMR();
    }
  }

  function startSR(recognition: SpeechRecognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!shouldListenRef.current || modeRef.current !== "listening") return;
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (!final.trim()) return;
      speechBufferRef.current += (speechBufferRef.current ? ". " : "") + final.trim();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const t = speechBufferRef.current;
        speechBufferRef.current = "";
        if (t.trim() && modeRef.current === "listening") onSpeech(t.trim());
      }, DEBOUNCE_MS);
    };
    recognition.onend = () => {
      const t = speechBufferRef.current;
      if (t.trim() && modeRef.current === "listening") {
        speechBufferRef.current = "";
        onSpeech(t.trim());
      } else if (shouldListenRef.current && mountedRef.current) {
        try { recognition.start(); } catch { startMR(); }
      }
    };
    recognition.onerror = () => {
      if (shouldListenRef.current) startMR();
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { startMR(); }
  }

  function startMR() {
    if (!streamRef.current) return;
    stopRecorder();
    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/mpeg"]
      .find((t) => MediaRecorder.isTypeSupported(t)) || "audio/webm";
    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(streamRef.current, { mimeType });
    } catch {
      setMicError("Mic no disponible. Usa el teclado");
      ph("idle");
      return;
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      if (!mountedRef.current || chunks.length === 0) return;
      const blob = new Blob(chunks, { type: mimeType });
      if (shouldListenRef.current) onAudio(blob, mimeType);
    };
    try {
      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, CHUNK_MS);
    } catch {
      setMicError("Error al grabar. Usa el teclado");
      ph("idle");
    }
  }

  function onSpeech(text: string) {
    if (modeRef.current !== "listening" || !mountedRef.current) return;
    shouldListenRef.current = false;
    stopRecorder();
    stopSpeechRecognition();
    ph("processing");
    setThinking(true);
    setStatusText("Pensando...");
    doAIRef.current?.(text).finally(() => {
      if (mountedRef.current) setThinking(false);
    });
  }

  function onAudio(blob: Blob, mimeType: string) {
    if (modeRef.current !== "listening" || !mountedRef.current) return;
    shouldListenRef.current = false;
    stopRecorder();
    ph("processing");
    setThinking(true);
    setStatusText("Procesando...");
    sttAudio(blob).then((text) => {
      if (!mountedRef.current) return;
      console.debug("[Call] STT transcript:", text);
      if (text.trim()) {
        setStatusText("Pensando...");
        return doAIRef.current?.(text.trim());
      }
      acquireMicAndListen();
    }).catch((err) => {
      console.error("[Call] STT error:", err);
      if (mountedRef.current) {
        setMicError("Error de audio. Usa el teclado");
        ph("idle");
      }
    }).finally(() => {
      if (mountedRef.current) setThinking(false);
    });
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
      userGender: (localStorage.getItem("lunacall_gender") || "hombre") as "hombre" | "mujer",
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

  async function sendText() {
    const text = textInput.trim();
    if (!text || thinking) return;
    setTextInput("");
    shouldListenRef.current = false;
    stopRecorder();
    stopSpeechRecognition();
    releaseMic();
    setStatusText("Pensando...");
    await doAI(text);
  }

  function answerCall() {
    setCallState("connecting");
    setStatusText("Conectando...");
    setTimeout(() => {
      if (!mountedRef.current) return;
      setCallState("connected");
      const welcome = `Hola, soy ${girl.name}. ¿Cómo estás?`;
      const welcomeMsg: ChatMessage = { role: "assistant", content: welcome };
      setMessages([welcomeMsg]);
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
      speak(welcome);
    }, 500);
  }

  function hangUp() {
    cleanup();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ringing");
    ph("idle");
    saveToHistory(girl.id, girl.name, messages);
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    window.location.href = `${base}/girls`;
  }

  function cleanup() {
    shouldListenRef.current = false;
    stopRecorder();
    stopSpeechRecognition();
    releaseMic();
    speechBufferRef.current = "";
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopRingback();
  }

  function stopRecorder() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch {}
    }
    recorderRef.current = null;
  }

  function stopSpeechRecognition() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
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

  if (callState === "ringing" || callState === "connecting") {
    return (
      <div className={`relative flex min-h-screen flex-col bg-gradient-to-b ${backgroundGradients[background]}`}>
        <div className="flex flex-1 flex-col items-center justify-center px-5">
          <div className="flex flex-col items-center animate-fadeUp">
            <div className="relative mb-8">
              {callState === "ringing" && (
                <>
                  <div className="absolute -inset-8 rounded-full border-2 border-pink/15 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute -inset-4 rounded-full border border-pink/25" />
                </>
              )}
              <Avatar
                name={girl.id}
                accentColor={girl.accentColor}
                accentColorSecondary={girl.accentColorSecondary}
                hair={custom?.hair ?? girl.defaultHair}
                outfit={custom?.outfit ?? girl.defaultOutfit}
                background={custom?.background ?? girl.defaultBackground}
                size={200}
                animated
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{girl.name}</h1>
            <p className="mt-1 text-sm text-muted/70">{girl.style}</p>
            <p className="mt-8 text-xs text-muted/50 tracking-widest uppercase animate-pulse">
              {callState === "ringing" ? "Llamando..." : "Conectando..."}
            </p>
          </div>
        </div>
        {callState === "ringing" && (
          <div className="flex items-center justify-center pb-16">
            <button
              onClick={hangUp}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/40 transition-transform active:scale-90 group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="text-xs text-muted font-medium">Cancelar</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-screen flex-col bg-gradient-to-b ${backgroundGradients[background]}`}>
      <div className="flex flex-1 flex-col items-center justify-center px-5 pt-12">
        <Avatar
          name={girl.id}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          hair={custom?.hair ?? girl.defaultHair}
          pose={custom?.pose ?? girl.defaultPose}
          background={custom?.background ?? girl.defaultBackground}
          size={220}
          animated
          talking={mode === "speaking"}
        />
        {micError && mode !== "listening" && (
          <button
            onClick={() => { setMicError(null); acquireMicAndListen(); }}
            className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 text-xs text-muted hover:bg-white/20 transition-all"
          >
            {micError} — Toca para intentar
          </button>
        )}
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold">{girl.name}</h2>
          <p className="mt-1 text-lg text-muted font-mono tabular-nums tracking-wider">{formatDuration(callDuration)}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${mode === "speaking" ? "bg-green-400 animate-pulse" : mode === "listening" ? "bg-pink animate-pulse" : "bg-muted"}`} />
            <span className="text-sm text-muted/80">
              {mode === "speaking" ? `${girl.name} habla...` :
               mode === "listening" ? "Te escucho" :
               mode === "processing" ? "Pensando..." :
               statusText || "En llamada"}
            </span>
          </div>
        </div>
        {lastReply && (
          <p className="mt-8 max-w-sm text-center text-sm text-muted/70 animate-fadeUp leading-relaxed">
            &ldquo;{lastReply}&rdquo;
          </p>
        )}
      </div>

      <div className="w-full px-8 pb-12">
        {showTextPanel && (
          <div className="mb-6 flex gap-2 animate-fadeUp">
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
        <div className="flex items-center justify-center gap-12">
          <button
            onClick={() => setShowTextPanel((v) => !v)}
            className="flex flex-col items-center gap-2 group"
            title="Teclado"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" />
                <path d="M6 14h.01M10 14h.01M14 14h.01M18 14h.01" />
              </svg>
            </div>
            <span className="text-[10px] text-muted/70 tracking-wider uppercase">Teclado</span>
          </button>
          <button
            onClick={hangUp}
            className="flex flex-col items-center gap-2 group"
            title="Colgar"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/40 transition-transform active:scale-90">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span className="text-[10px] text-muted/70 tracking-wider uppercase">Colgar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
