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

type CallState = "ringing" | "connecting" | "connected";

const SILENCE_MS = 2000;

export default function CallScreen({ girl }: { girl: Girl }) {
  const custom = getCustomization(girl.id);
  const background = custom?.background ?? girl.defaultBackground;

  const [callState, setCallState] = useState<CallState>("ringing");
  const [talking, setTalking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const doAIRef = useRef<((text: string) => Promise<string | undefined>) | null>(null);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isProcessingRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const lastAudioEndRef = useRef<number>(0);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanupMic();
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
      if (voicesRef.current.length > 0) setVoicesReady(true);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
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

    const natural = es.find((v) =>
      ["natural", "neural", "premium", "sabina", "helena", "teresa", "desktop"]
        .some((k) => v.name.toLowerCase().includes(k))
    );
    if (natural) return natural;

    const msft = es.find((v) => v.name.toLowerCase().includes("microsoft"));
    if (msft) return msft;

    const google = es.find((v) => v.name.toLowerCase().includes("google"));
    if (google) return google;

    return es[0] || null;
  }

  function speakBrowser(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findBestVoice();
    const profile = voiceProfiles[girl.id] || voiceProfiles.luna;

    if (voice) utterance.voice = voice;
    utterance.pitch = profile.pitch + (Math.random() * 0.1 - 0.05);
    utterance.rate = profile.rate;
    utterance.volume = 1;

    setTalking(true);
    utterance.onend = () => {
      setTalking(false);
      setStatusText(micActive ? "Te escucho" : "");
    };
    window.speechSynthesis.speak(utterance);
  }

  function speakViaAudio(text: string) {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }

    setTalking(true);
    setStatusText("Hablando...");

    import("@/lib/voiceClient").then(({ ttsText }) => {
      ttsText(text).then(({ audio, contentType }) => {
        if (!mountedRef.current) return;
        const audioSrc = `data:${contentType};base64,${audio}`;
        const el = new Audio(audioSrc);
        audioPlaybackRef.current = el;
        el.onended = () => {
          setTalking(false);
          setStatusText(micActive ? "Te escucho" : "");
          audioPlaybackRef.current = null;
        };
        el.onerror = () => {
          speakBrowser(text);
        };
        el.play().catch(() => speakBrowser(text));
      }).catch(() => speakBrowser(text));
    }).catch(() => speakBrowser(text));
  }

  function speak(text: string) {
    setLastReply(text);
    speakViaAudio(text);
  }

  async function requestMic(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      return stream;
    } catch (e: any) {
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setMicError("Permiso denegado. Permite el micrófono en el navegador");
      } else if (e.name === "NotFoundError") {
        setMicError("No se encontró micrófono. Conecta uno");
      } else {
        setMicError("Error al acceder al micrófono");
      }
      return null;
    }
  }

  function cleanupMic() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    audioChunksRef.current = [];
    setMicActive(false);
    setInterimText("");
  }

  function startMicFromClick() {
    if (isProcessingRef.current) return;
    setMicError(null);
    setStatusText("Conectando micrófono...");

    requestMic().then((stream) => {
      if (!stream || !mountedRef.current) return;
      streamRef.current = stream;
      setMicActive(true);
      setStatusText("Te escucho");
      setMicError(null);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm;codecs=opus";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0 || !mountedRef.current) return;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setThinking(true);
        setStatusText("Procesando...");

        try {
          const text = await sttAudio(blob);
          if (text.trim() && mountedRef.current) {
            setInterimText("");
            setStatusText("Pensando...");
            await doAIRef.current?.(text);
          }
        } catch {
          setMicError("No se pudo transcribir. Escribe mejor");
        }

        isProcessingRef.current = false;
        setThinking(false);

        if (mountedRef.current && streamRef.current) {
          try {
            const r = new MediaRecorder(streamRef.current, { mimeType });
            mediaRecorderRef.current = r;
            audioChunksRef.current = [];
            r.ondataavailable = recorder.ondataavailable;
            r.onstop = recorder.onstop;
            r.start();
            silenceTimerRef.current = setTimeout(() => {
              if (r.state === "recording") r.stop();
            }, SILENCE_MS);
          } catch {}
        }
      };

      recorder.start();
      silenceTimerRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, SILENCE_MS);

      setInterval(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, SILENCE_MS);
    });
  }

  useEffect(() => {
    if (!micActive || !mediaRecorderRef.current) return;
    const interval = setInterval(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }, SILENCE_MS);
    return () => clearInterval(interval);
  }, [micActive]);

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

  async function sendText() {
    const text = textInput.trim();
    if (!text || thinking) return;
    setTextInput("");
    setThinking(true);
    setStatusText("Pensando...");
    await doAI(text);
    setThinking(false);
  }

  function answerCall() {
    setCallState("connecting");
    setStatusText("Conectando...");
    setTimeout(() => {
      setCallState("connected");
      const welcome = `Hola, soy ${girl.name}. ¿Cómo estás?`;
      const welcomeMsg: ChatMessage = { role: "assistant", content: welcome };
      setMessages([welcomeMsg]);
      speak(welcome);
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }, 1500);
  }

  function hangUp() {
    cleanupMic();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ringing");
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

  if (callState === "ringing" || callState === "connecting") {
    return (
      <div className={`relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b ${backgroundGradients[background]} px-5`}>
        <div className="flex flex-col items-center animate-fadeUp">
          <div className="relative mb-8">
            <Avatar
              name={girl.id}
              accentColor={girl.accentColor}
              accentColorSecondary={girl.accentColorSecondary}
              hair={custom?.hair ?? girl.defaultHair}
              outfit={custom?.outfit ?? girl.defaultOutfit}
              background={custom?.background ?? girl.defaultBackground}
              size={160}
              animated
            />
            {callState === "ringing" && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs shadow-lg shadow-green-500/50 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold">{girl.name}</h2>
          <p className="mt-1 text-sm text-muted">{girl.style}</p>
          <p className="mt-6 text-xs text-muted animate-pulse">
            {callState === "ringing" ? "Llamando..." : "Conectando..."}
          </p>
          {callState === "ringing" && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={hangUp}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-red-500/30"
                title="Rechazar"
              >
                <span className="text-2xl">📞</span>
              </button>
              <button
                onClick={answerCall}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-green-500/30 animate-float"
                title="Contestar"
              >
                <span className="text-2xl">📞</span>
              </button>
            </div>
          )}
          {callState === "connecting" && (
            <div className="mt-8">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-pink animate-pulse" />
                Conectando con {girl.name}...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b ${backgroundGradients[background]} px-5 py-8`}>
      <div className="w-full flex items-center justify-between text-sm">
        <div>
          <p className="font-semibold">{girl.name}</p>
          <p className="text-xs text-muted">{formatDuration(callDuration)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs ${talking ? "text-green-400" : micActive ? "text-pink" : "text-muted"}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${talking ? "bg-green-400 animate-pulse" : micActive ? "bg-pink animate-pulse" : "bg-muted"}`} />
            {statusText || "En llamada"}
          </span>
          <button
            onClick={clearMemory}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-muted hover:bg-white/20"
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
        {micError && !micActive && (
          <button
            onClick={startMicFromClick}
            className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 text-xs text-muted hover:bg-white/20 transition-all"
          >
            {micError} — Toca para activar
          </button>
        )}
        {interimText && (
          <p className="mt-6 max-w-sm text-center text-sm text-ink/60 animate-fadeUp italic">
            {interimText}
          </p>
        )}
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
          {!micActive ? (
            <button
              onClick={startMicFromClick}
              className="flex h-14 w-14 items-center justify-center rounded-full card-surface hover:scale-105 active:scale-95 transition-all duration-200"
              title="Activar micrófono"
            >
              🎙️
            </button>
          ) : (
            <button
              onClick={cleanupMic}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
              title="Desactivar micrófono"
            >
              🎤
            </button>
          )}
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
          {thinking ? "Pensando..." :
           talking ? `${girl.name} habla...` :
           micActive ? `Te escucho, habla` :
           micError ? "Activa el mic o escribe" :
           "Llamada en curso"}
        </p>
      </div>
    </div>
  );
}
