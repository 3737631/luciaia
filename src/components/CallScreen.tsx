"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCustomization, getCustomGirls, CustomGirlData } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
import { goBack } from "@/lib/nav";
import { sendChatMessage } from "@/lib/chatClient";
import { splitForTTS, sttAudio, ttsText, voiceIdMap, getCustomGirlVoice } from "@/lib/voiceClient";
import {
  getConversationHistory,
  saveConversationHistory,
  getConversationSummary,
  getUserMemory,
  saveUserMemory,
  extractMemoryFromMessages,
  buildSummary,
  saveConversationSummary,
  saveToHistory,
  ChatMessage,
} from "@/lib/memory";
import { getGirlImage } from "@/lib/images";
import { detectGender } from "@/lib/gender";
import { isFeatureLocked, getPlan, getFreeSecondsLeftToday, recordCallSeconds, isFreeCallLimitReached, FREE_CALL_SECONDS_PER_DAY } from "@/lib/premium";
import LockIcon from "./LockIcon";
import { Girl } from "@/data/girls";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const sanitizeForTTS = (text: string): string => {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/\([^)]*\)/g, "")
    .replace(/([.!?])\1{2,}/g, "$1$1")
    .replace(/\.{3,}/g, "…")
    .replace(/\b(baby|sweetie|honey|darling|babe|yes|yeah|wow|oh|hey|okay|ok|please|sorry|let's|come\s+on|love|shit|fuck|damn|hell|gonna|wanna|gotta)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .replace(/\.{2,}/g, ".");
};

const supportedMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/mpeg",
];

export default function CallScreen({ girl }: { girl: Girl }) {
  const router = useRouter();
  const custom = getCustomization(girl.id);
  const [activeCustom, setActiveCustom] = useState<CustomGirlData | null>(null);
  useEffect(() => {
    const customId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("custom") : null;
    if (customId) {
      const g = getCustomGirls().find((x) => x.id === customId);
      if (g) setActiveCustom(g);
    }
  }, []);
  const callName = activeCustom?.name || girl.name;
const callGirlImage = activeCustom?.imageUrl || girl.cloudinaryImage || getGirlImage(
    girl.id,
    custom?.hair || girl.defaultHair,
    custom?.pose || girl.defaultPose,
    custom?.background || girl.defaultBackground,
    girl.cloudinaryImage,
  );
  const debug = typeof window !== "undefined" && window.location.search.includes("callDebug=1");

  const [callState, setCallState] = useState<"dialing" | "greeting" | "speaking" | "listening" | "processing" | "ended" | "error">("dialing");
  const [muted, setMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState("");
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [switchingMic, setSwitchingMic] = useState(false);
  const [micStatus, setMicStatus] = useState("");
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [hasSinkSupport, setHasSinkSupport] = useState(false);
  const [speakerStatus, setSpeakerStatus] = useState("");
  const [ringScale, setRingScale] = useState(1);
  const [ringOpacity, setRingOpacity] = useState(0.3);
  const [processingLock, setProcessingLock] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [subtitleText, setSubtitleText] = useState("");
  const subtitleTimerRef = useRef<any>(null);
  const [videoOn, setVideoOn] = useState(false);
  const [videoLockedOnce] = useState(() => typeof window !== "undefined" && isFeatureLocked("video"));
  const [videoBlurred, setVideoBlurred] = useState(false);
  const isFreeUser = typeof window !== "undefined" && getPlan() === "free";
  const [freeSecondsLeft, setFreeSecondsLeft] = useState(() => (typeof window !== "undefined" && getPlan() === "free" ? getFreeSecondsLeftToday() : FREE_CALL_SECONDS_PER_DAY));
  const [callLocked, setCallLocked] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [dotCount, setDotCount] = useState(0);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const audioUnlockedRef = useRef(false);
  const audioUnlockHandlersRef = useRef<(() => void)[]>([]);
  const isIOS = typeof navigator !== "undefined" && /iP(hone|ad|od)/i.test(navigator.userAgent || "");
  const [recDriver, setRecDriver] = useState<"none" | "sr" | "mr">("none");
  const [freqData, setFreqData] = useState<number[]>(Array(12).fill(2));
  const [micTestCountdown, setMicTestCountdown] = useState(0);
  const [micTestResult, setMicTestResult] = useState("");
  const [micTesting, setMicTesting] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const callStateRef = useRef("dialing");
  const mountedRef = useRef(true);
  const sessionId = useRef(Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoGateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const speakerAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const speechRecRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const ringbackRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  const turnIdRef = useRef(0);
  const greetingWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef = useRef(false);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctxKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringRafRef = useRef(0);
  const freqRafRef = useRef(0);
  const micLevelRafRef = useRef(0);
  const backoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechBufferRef = useRef("");
  const interimBufferRef = useRef("");
  const finalBufferRef = useRef("");
  const lastResultIndexRef = useRef(-1);
  const nextListenAtRef = useRef(0);
  const silentPingsRef = useRef(0);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recorderActiveRef = useRef(false);
  const recordingDriverRef = useRef<"none" | "sr" | "mr">("none");
  const raActiveRef = useRef(false);
  const voiceActivityRef = useRef<{
    analyser: AnalyserNode;
    dataArray: Uint8Array;
    noiseFloor: number;
    floorSamples: number;
    speakingSince: number;
    silentSince: number;
    active: boolean;
    rafId: number;
  } | null>(null);
  const doAIRef = useRef<((text: string) => Promise<void>) | null>(null);
  const prevMicRef = useRef<MediaStream | null>(null);

  function setCS(s: string) {
    callStateRef.current = s;
    setCallState(s as any);
  }

  function stopRingback() {
    if (ringbackRef.current) {
      try {
        ringbackRef.current.osc.stop();
        ringbackRef.current.osc.disconnect();
        ringbackRef.current.gain.disconnect();
        if (ringbackRef.current.ctx.state !== "closed") ringbackRef.current.ctx.close();
      } catch {}
      ringbackRef.current = null;
    }
  }

  function startFreqAnimation() {
    cancelAnimationFrame(freqRafRef.current);
    const buf = new Uint8Array(512);
    function tick() {
      if (!mountedRef.current || (callStateRef.current !== "speaking" && callStateRef.current !== "greeting")) {
        setFreqData(Array(12).fill(2));
        return;
      }
      const an = speakerAnalyserRef.current;
      if (!an) {
        freqRafRef.current = requestAnimationFrame(tick);
        return;
      }
      an.getByteFrequencyData(buf);
      const arr = Array.from({ length: 12 }, (_, i) =>
        Math.max(2, Math.min(24,
          Array.from({ length: 4 }, (_, n) => buf[Math.min(i * 4 + n, 511)])
            .reduce((a, b) => a + b, 0) / 4 / 18
        ))
      );
      setFreqData(arr);
      freqRafRef.current = requestAnimationFrame(tick);
    }
    freqRafRef.current = requestAnimationFrame(tick);
  }

  function stopFreqAnimation() {
    cancelAnimationFrame(freqRafRef.current);
    freqRafRef.current = 0;
  }

  async function connectMicAnalyser(stream: MediaStream) {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    if (micAnalyserRef.current) {
      micAnalyserRef.current.disconnect();
      micAnalyserRef.current = null;
    }
    const src = audioCtxRef.current.createMediaStreamSource(stream);
    const an = audioCtxRef.current.createAnalyser();
    an.fftSize = 512;
    an.smoothingTimeConstant = 0.68;
    src.connect(an);
    try {
      const silentGain = audioCtxRef.current.createGain();
      silentGain.gain.value = 0;
      src.connect(silentGain);
      silentGain.connect(audioCtxRef.current.destination);
    } catch {}
    micSourceRef.current = src;
    micAnalyserRef.current = an;
  }

  function disconnectMicAnalyser() {
    if (micLevelRafRef.current) {
      cancelAnimationFrame(micLevelRafRef.current);
      micLevelRafRef.current = 0;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    if (micAnalyserRef.current) {
      micAnalyserRef.current.disconnect();
      micAnalyserRef.current = null;
    }
    if (audioElementSourceRef.current) {
      try { audioElementSourceRef.current.disconnect(); } catch {}
      audioElementSourceRef.current = null;
    }
    if (speakerAnalyserRef.current) {
      try { speakerAnalyserRef.current.disconnect(); } catch {}
      speakerAnalyserRef.current = null;
    }
    raActiveRef.current = false;
  }

  function setupSpeakerAnalyser() {
    if (!audioCtxRef.current || !audioElRef.current || audioElementSourceRef.current) return;
    try {
      const src = audioCtxRef.current.createMediaElementSource(audioElRef.current);
      const an = audioCtxRef.current.createAnalyser();
      an.fftSize = 512;
      an.smoothingTimeConstant = 0.68;
      src.connect(an);
      an.connect(audioCtxRef.current.destination);
      audioElementSourceRef.current = src;
      speakerAnalyserRef.current = an;
      raActiveRef.current = true;
    } catch {}
  }

  function startRingAnimation() {
    cancelAnimationFrame(ringRafRef.current);
    const d1 = new Uint8Array(512);
    const d2 = new Uint8Array(512);
    let nfSamples = 0;
    let nf = 0;
    let phase = 0;

    function tick() {
      if (!mountedRef.current) return;
      const s = callStateRef.current;
      if (s === "dialing") {
        setRingScale(1);
        setRingOpacity(0.25);
        ringRafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (s === "processing") {
        setRingScale(1);
        setRingOpacity(0.15);
        ringRafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (s === "greeting" || s === "speaking") {
        if (speakerAnalyserRef.current) {
          speakerAnalyserRef.current.getByteTimeDomainData(d2);
          let sum = 0;
          for (let i = 0; i < d2.length; i++) {
            const v = (d2[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.min(1, Math.sqrt(sum / d2.length) / 0.25);
          const targetScale = 1 + 0.035 * rms;
          const targetOpacity = 0.35 + 0.3 * rms;
          setRingScale(prev => prev + (targetScale - prev) * 0.15);
          setRingOpacity(prev => prev + (targetOpacity - prev) * 0.15);
        } else {
          phase += 0.045;
          setRingScale(1 + 0.0175 * Math.sin(phase));
          setRingOpacity(0.5 + 0.15 * Math.sin(phase));
        }
        ringRafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (s === "listening") {
        if (muted || !micAnalyserRef.current) {
          phase += 0.01;
          setRingScale(1 + 0.005 * Math.sin(phase));
          setRingOpacity(0.25 + 0.04 * Math.sin(phase));
          ringRafRef.current = requestAnimationFrame(tick);
          return;
        }
        micAnalyserRef.current.getByteTimeDomainData(d1);
        let sum = 0;
        for (let i = 0; i < d1.length; i++) {
          const v = (d1[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / d1.length);
        if (nfSamples < 30 && rms < 0.04) {
          nf += (rms - nf) / (nfSamples + 1);
          nfSamples++;
        }
        const threshold = Math.max(1.5 * nf, 0.006);
        const signal = Math.min(1, Math.max(0, (rms - threshold) / 0.12));
        const targetScale = 1 + 0.025 * signal;
        const targetOpacity = 0.2 + 0.3 * signal;
        setRingScale(prev => prev + (targetScale - prev) * 0.12);
        setRingOpacity(prev => prev + (targetOpacity - prev) * 0.12);
        ringRafRef.current = requestAnimationFrame(tick);
        return;
      }
      ringRafRef.current = requestAnimationFrame(tick);
    }
    ringRafRef.current = requestAnimationFrame(tick);
  }

  function speakWithBrowserVoice(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
      const synth = window.speechSynthesis;
      const say = () => {
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "es-ES";
        utter.rate = 1;
        utter.pitch = 1;
        let voices = synth.getVoices();
        if (voices.length === 0) {
          synth.onvoiceschanged = () => { voices = synth.getVoices(); };
        }
        const esVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("es"));
        if (esVoice) utter.voice = esVoice;
        const done = () => {
          stopFreqAnimation();
          setFreqData(Array(12).fill(2));
          setSubtitleText("");
          resolve();
        };
        utter.onend = done;
        utter.onerror = done;
        synth.speak(utter);
      };
      if (!isIOS || audioUnlockedRef.current) {
        say();
        return;
      }
      audioUnlockHandlersRef.current.push(say);
      attachUnlockGesture();
    });
  }

  function attachUnlockGesture() {
    const unlock = () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
      unlockAudioForGesture();
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("touchstart", unlock);
    document.addEventListener("click", unlock);
  }

  function playGuarded(el: HTMLAudioElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const attempt = () => {
        const p = el.play();
        if (p && p.then) p.then(() => resolve(), e => {
          if (isIOS && e && e.name === "NotAllowedError") {
            audioUnlockHandlersRef.current.push(attempt);
            attachUnlockGesture();
          } else {
            reject(e);
          }
        });
        else resolve();
      };
      attempt();
    });
  }

  function setSubtitleWords(text: string) {
    if (subtitleTimerRef.current) { clearInterval(subtitleTimerRef.current); subtitleTimerRef.current = null; }
    const words = text.split(/\s+/).filter(Boolean);
    let i = 0;
    setSubtitleText("");
    subtitleTimerRef.current = setInterval(() => {
      i++;
      setSubtitleText(words.slice(0, i).join(" "));
      if (i >= words.length && subtitleTimerRef.current) {
        clearInterval(subtitleTimerRef.current);
        subtitleTimerRef.current = null;
      }
    }, 160);
  }

  function unlockAudioForGesture() {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    const handlers = audioUnlockHandlersRef.current;
    audioUnlockHandlersRef.current = [];
    handlers.forEach(h => { try { h(); } catch {} });
  }

  async function speakTTS(text: string, isGreeting: boolean): Promise<void> {
    const tid = ++turnIdRef.current;
    const el = audioElRef.current;
    if (!el) return;

    try {
      const sanitized = sanitizeForTTS(text);
      if (!sanitized) throw new Error("Texto vacío después de sanitizar");
      const chunks = splitForTTS(sanitized);
      const voiceKey = (activeCustom ? getCustomGirlVoice(activeCustom.id) : voiceIdMap[girl.id] || `female-${girl.id}`);
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const r = await ttsText(chunk, voiceKey);
          if (!mountedRef.current || tid !== turnIdRef.current) return null;
          return r;
        })
      );
      if (!mountedRef.current || tid !== turnIdRef.current) return;
      const finalResults = results.filter(Boolean) as { audio: string; contentType: string }[];
      if (finalResults.length === 0) return;

      el.volume = (muted || !audioOn) ? 0 : 1;
      for (let i = 0; i < finalResults.length; i++) {
        if (!mountedRef.current || tid !== turnIdRef.current) return;
        await new Promise<void>((resolve, reject) => {
          const playedRef = { started: false };
          const timeout = setTimeout(() => reject(new Error("timeout")), 30000);
          const guardTimer = setTimeout(() => {
            // Solo corta si el audio nunca llegó a sonar; si ya suena, esperamos al onended real.
            if (!playedRef.started) resolve();
          }, 2500);
          const cleanup = () => { clearTimeout(timeout); clearTimeout(guardTimer); };
          el.onplaying = () => {
            clearTimeout(timeout);
            playedRef.started = true;
            if (isGreeting && callStateRef.current === "dialing") {
              stopRingback();
              setCS("greeting");
              startFreqAnimation();
              if (!durTimerRef.current) {
                durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
              }
            } else {
              setCS("speaking");
              startFreqAnimation();
            }
          };
          el.onended = () => {
            cleanup();
            stopFreqAnimation();
            setFreqData(Array(12).fill(2));
            setSubtitleText("");
            if (subtitleTimerRef.current) { clearInterval(subtitleTimerRef.current); subtitleTimerRef.current = null; }
            resolve();
          };
          el.onerror = () => {
            cleanup();
            reject(new Error("audio error"));
          };
          el.src = `data:${finalResults[i].contentType};base64,${finalResults[i].audio}`;
          playGuarded(el).catch(e => { clearTimeout(timeout); reject(e); });
        });
      }
    } catch (err) {
      if (tid !== turnIdRef.current || !mountedRef.current) return;
      console.warn("[CALL] TTS failed, retrying once", err);
      try {
        const sanitized = sanitizeForTTS(text);
        if (!sanitized) return;
        const result = await ttsText(sanitized, (activeCustom ? getCustomGirlVoice(activeCustom.id) : voiceIdMap[girl.id] || `female-${girl.id}`));
        if (!mountedRef.current || tid !== turnIdRef.current) return;
el.volume = !audioOn ? 0 : 1;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("timeout")), 30000);
          el.onplaying = () => {
            clearTimeout(timeout);
            if (isGreeting) {
              stopRingback();
              setCS("greeting");
              startFreqAnimation();
              if (!durTimerRef.current) {
                durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
              }
            } else {
              setCS("speaking");
              startFreqAnimation();
            }
          };
          el.onended = () => {
            stopFreqAnimation();
            setFreqData(Array(12).fill(2));
            setSubtitleText("");
            resolve();
          };
          el.onerror = () => { clearTimeout(timeout); reject(new Error("audio error")); };
          el.src = `data:${result.contentType};base64,${result.audio}`;
          const pp = playGuarded(el);
          pp.catch(e => { clearTimeout(timeout); reject(e); });
          setTimeout(() => resolve(), 2500);
        });
      } catch (e) {
        console.warn("[CALL] TTS retry failed, usando voz del navegador", e);
        if (!mountedRef.current || tid !== turnIdRef.current) return;
        try {
          if (isGreeting && callStateRef.current === "dialing") {
            stopRingback();
            setCS("greeting");
            startFreqAnimation();
            if (!durTimerRef.current) {
              durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
            }
          } else if (!isGreeting) {
            setCS("speaking");
            startFreqAnimation();
          }
          await speakWithBrowserVoice(sanitizeForTTS(text) || text);
        } catch (browserErr) {
          console.error("[CALL] Browser voice also failed", browserErr);
          if (!mountedRef.current || tid !== turnIdRef.current) return;
          if (isGreeting) {
            setErrorType("tts_generation_error");
            setErrorMsg("No se pudo iniciar la llamada.");
            setCS("error");
          } else {
            setErrorType("tts_generation_error");
            setErrorMsg("No he podido reproducir la voz.");
            setCS("error");
          }
        }
      }
    }
  }

  async function acquireMic(deviceId?: string): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      };
      if (deviceId) (constraints.audio as MediaTrackConstraints).deviceId = { exact: deviceId };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const track = stream.getAudioTracks()[0];
      if (!stream.active || !track || track.readyState === "ended") {
        stream.getTracks().forEach(t => t.stop());
        return null;
      }
      return stream;
    } catch (e: any) {
      if (e.name === "NotAllowedError") {
        setErrorType("microphone_error");
        setErrorMsg("Nuvia necesita acceso al micrófono para escucharte.");
      } else if (e.name === "NotFoundError") {
        setErrorType("microphone_error");
        setErrorMsg("No se encontró ningún micrófono.");
      } else {
        setErrorType("microphone_error");
        setErrorMsg("Error al abrir el micrófono.");
      }
      return null;
    }
  }

  function startSpeechRec() {
    if (processingRef.current || !micStreamRef.current || !mountedRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { startMediaRec(); return; }

    try {
      const rec = new SR();
      rec.lang = "es-ES";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        processingRef.current = true;
        setRecDriver("sr");
        recordingDriverRef.current = "sr";
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        if (processingRef.current || callStateRef.current !== "listening") return;
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = (event.results[i][0]?.transcript || "").trim();
          if (t) {
            if (event.results[i].isFinal) {
              if (i > lastResultIndexRef.current) {
                final += t + " ";
                lastResultIndexRef.current = i;
              }
            } else {
              interim += t + " ";
            }
          }
        }
        interimBufferRef.current = interim.trim();
        if (final) finalBufferRef.current = (finalBufferRef.current + " " + final.trim()).trim();
        if (debug) {
          (window as any).__callDebugInterim = interimBufferRef.current;
          (window as any).__callDebugFinal = finalBufferRef.current;
        }
        const combined = (finalBufferRef.current + " " + interimBufferRef.current).trim();
        if (combined.length >= 3) {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            if (combined && !processingRef.current && mountedRef.current && callStateRef.current === "listening") {
              processSpeech(combined);
            }
          }, 1400);
        }
      };

      rec.onend = () => {
        processingRef.current = false;
        setRecDriver("none");
        recordingDriverRef.current = "none";
        const combined = (finalBufferRef.current + " " + interimBufferRef.current).trim();
        if (combined && !processingRef.current && mountedRef.current && callStateRef.current === "listening") {
          processSpeech(combined);
        } else if (mountedRef.current && callStateRef.current === "listening" && !processingRef.current) {
          startSpeechRec();
        }
      };

      rec.onerror = (e: any) => {
        processingRef.current = false;
        setRecDriver("none");
        recordingDriverRef.current = "none";
        if (e.error === "not-allowed") {
          setErrorType("recognition_error");
          setErrorMsg("Nuvia necesita acceso al micrófono.");
          setCS("error");
          return;
        }
        if (e.error === "no-speech") {
          if (mountedRef.current && callStateRef.current === "listening" && !processingRef.current) startSpeechRec();
          return;
        }
        startMediaRec();
      };

      speechRecRef.current = rec;
      rec.start();
    } catch {
      startMediaRec();
    }
  }

  function abortSpeechRec(reason = "restart") {
    recordingDriverRef.current = reason as any;
    processingRef.current = false;
    if (speechRecRef.current) {
      try { speechRecRef.current.abort(); } catch {}
      try { speechRecRef.current.stop(); } catch {}
      speechRecRef.current = null;
    }
  }

  function startMediaRec() {
    if (recorderActiveRef.current || !micStreamRef.current || !audioCtxRef.current) return;
    stopRecorder();
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const src = ctx.createMediaStreamSource(micStreamRef.current);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    an.smoothingTimeConstant = 0.8;
    src.connect(an);
    try {
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      src.connect(silentGain);
      silentGain.connect(ctx.destination);
    } catch {}
    const data = new Uint8Array(an.fftSize);
    let nf = 0;
    let nfSamples = 0;
    let speakingSince = 0;
    let silentSince = 0;
    let active = false;
    const chunks: Blob[] = [];
    let ended = false;
    const mimeType = supportedMimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || "";

    function startRecorder(stream: MediaStream, type: string) {
      if (recorderActiveRef.current || !stream) return;
      recorderActiveRef.current = true;
      recorderChunksRef.current = chunks;
      try {
        const rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
        rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        rec.start(250);
        mediaRecorderRef.current = rec;
      } catch {}
    }

    startRecorder(micStreamRef.current, mimeType);
    recordingDriverRef.current = "mr";
    setRecDriver("mr");

    voiceActivityRef.current = {
      analyser: an, dataArray: data, noiseFloor: nf,
      floorSamples: nfSamples, speakingSince, silentSince, active, rafId: 0,
    };

    function tick() {
      an.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);

      if (nfSamples < 50) {
        if (rms > 0 && rms < 0.01) nf += (rms - nf) / (nfSamples + 1);
        nfSamples++;
        voiceActivityRef.current!.rafId = requestAnimationFrame(tick);
        return;
      }

      const threshold = Math.max(1.2 * nf, 0.002);
      const now = Date.now();

      if (rms > threshold) {
        if (!active) { active = true; speakingSince = now; silentSince = 0; }
      } else if (active) {
        if (silentSince === 0) silentSince = now;
        else if (now - silentSince > 900) {
          active = false; ended = true;
          stopRecorder(() => {
            if (chunks.length > 0) handleAudioChunk(new Blob(chunks, { type: mimeType || "audio/mp4" }));
            else startListening();
          });
          if (voiceActivityRef.current?.rafId) cancelAnimationFrame(voiceActivityRef.current.rafId);
          return;
        }
      }

      if (active && now - speakingSince > 30000) {
        active = false; ended = true;
        stopRecorder(() => {
          if (chunks.length > 0) handleAudioChunk(new Blob(chunks, { type: mimeType || "audio/mp4" }));
          else startListening();
        });
        if (voiceActivityRef.current?.rafId) cancelAnimationFrame(voiceActivityRef.current.rafId);
        return;
      }

      an.getByteTimeDomainData(data);
      voiceActivityRef.current!.rafId = requestAnimationFrame(tick);
    }
    voiceActivityRef.current!.rafId = requestAnimationFrame(tick);
  }

  function cleanupMediaRec() {
    if (voiceActivityRef.current) {
      if (voiceActivityRef.current.rafId) cancelAnimationFrame(voiceActivityRef.current.rafId);
      voiceActivityRef.current = null;
    }
    stopRecorder();
  }

  function stopRecorder(cb?: () => void) {
    if (!recorderActiveRef.current) { cb?.(); return; }
    recorderActiveRef.current = false;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.onstop = () => { mediaRecorderRef.current = null; cb?.(); };
      try { rec.stop(); } catch { mediaRecorderRef.current = null; cb?.(); }
    } else {
      mediaRecorderRef.current = null;
      cb?.();
    }
  }

  function handleAudioChunk(blob: Blob) {
    if (!mountedRef.current || callStateRef.current === "ended" || callStateRef.current === "error") return;
    if (Date.now() < nextListenAtRef.current || blob.size < 1500) {
      startListening();
      return;
    }
    setCS("processing");
    const tid = ++turnIdRef.current;
    cleanupMediaRec();
    stopRecorder();
    abortSpeechRec();

    sttAudio(blob).then(text => {
      if (!mountedRef.current || turnIdRef.current !== tid) return;
      const t = text.trim().toLowerCase().replace(/[.,!?;:]+$/, "");
      if (t && t.length >= 3 && !/^(gracias|muchas gracias|thank you|thanks|adiós|sí|no|ok|vale|hey|ah|mm|mhm|uh|eh|hmm|mmm|ajá|okay)$/i.test(t)) {
        handleAI(text.trim(), tid);
      } else {
        startListening();
      }
    }).catch(() => {
      if (mountedRef.current && turnIdRef.current === tid) startListening();
    });
  }

  function processSpeech(text: string) {
    if (processingRef.current || !text.trim()) return;
    const t = text.trim().toLowerCase().replace(/[.,!?;:]+$/, "");
    if (t.length < 3 || /^(gracias|muchas gracias|thank you|thanks|adiós|sí|no|ok|vale|hey|ah|mm|mhm|uh|eh|hmm|mmm|ajá|okay)$/i.test(t)) {
      startListening();
      return;
    }
    abortSpeechRec("user-finished");
    cleanupMediaRec();
    stopRecorder();
    const tid = ++turnIdRef.current;
    finalBufferRef.current = "";
    interimBufferRef.current = "";
    lastResultIndexRef.current = -1;
    if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); debounceTimerRef.current = null; }
    setCS("processing");
    handleAI(text.trim(), tid);
  }

  function handleAI(text: string, tid: number) {
    if (processingRef.current) return;
    const t = text.trim().toLowerCase().replace(/[.,!?;:]+$/, "");
    if (t.length < 3 || /^(gracias|muchas gracias|thank you|thanks|adiós|sí|no|ok|vale|hey|ah|mm|mhm|uh|eh|hmm|mmm|ajá|okay)$/i.test(t)) {
      startListening();
      return;
    }
    processingRef.current = true;
    doAIRef.current?.(text);
  }

  const doAI = useCallback(async (text: string) => {
    const storageId = activeCustom?.id ?? girl.id;
    const history = getConversationHistory(storageId);
    const memory = getUserMemory(storageId);
    const summary = getConversationSummary(storageId);
    const customScenario = activeCustom
      ? `Chica: ${activeCustom.girlDesc}\nRoleplay: ${activeCustom.roleplayDesc}`
      : "";
    try {
      const reply = await sendChatMessage({
        message: text,
        girlId: activeCustom?.id ?? girl.id,
        girlName: activeCustom?.name ?? girl.name,
        girlStyle: activeCustom?.girlDesc ?? girl.style,
        girlPersonality: activeCustom?.personality ?? custom?.personality ?? girl.personality,
        customization: (custom || {}) as Record<string, unknown>,
        history,
        memory,
        summary,
        mode: activeCustom?.roleplayDesc ? "actions" : "text",
        userGender: (localStorage.getItem("lunacall_gender") || "hombre") as "hombre" | "mujer",
        characterGender: detectGender(activeCustom?.name ?? girl.name),
        customScenario: customScenario || undefined,
      });
      if (!mountedRef.current) return;
      const msgs: ChatMessage[] = [
        ...history,
        { role: "user", content: text },
        { role: "assistant", content: reply },
      ];
      saveConversationHistory(storageId, msgs);
      setSubtitleWords(reply);
      setTimeout(() => {
        const extracted = extractMemoryFromMessages(msgs);
        if (extracted.length > 0) {
          const existing = getUserMemory(storageId);
          const merged = [...new Map([...existing, ...extracted].map(m => [m, m])).values()];
          saveUserMemory(storageId, merged.slice(-30));
        }
        if (msgs.length > 20) {
          const sum = buildSummary(msgs);
          if (sum) saveConversationSummary(storageId, sum);
        }
      }, 0);
      await speakTTS(reply, false);
      if (!mountedRef.current) return;
      processingRef.current = false;
      startListening();
    } catch (err: any) {
      console.warn("[CALL] AI error:", err);
      if (!mountedRef.current) return;
      const fallback = getFallbackResponse(text);
      const msgs: ChatMessage[] = [
        ...history,
        { role: "user", content: text },
        { role: "assistant", content: fallback },
      ];
      saveConversationHistory(girl.id, msgs);
      setSubtitleWords(fallback);
      await speakTTS(fallback, false);
      if (!mountedRef.current) return;
      processingRef.current = false;
      startListening();
    }
  }, [girl, custom, subtitlesOn, activeCustom]);

  doAIRef.current = doAI;

  function startListening() {
    nextListenAtRef.current = Date.now() + 350;
    if (backoffTimerRef.current) clearTimeout(backoffTimerRef.current);
    backoffTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || callStateRef.current === "ended" || callStateRef.current === "error") return;
      processingRef.current = false;
      setCS("listening");
      finalBufferRef.current = "";
      interimBufferRef.current = "";
      lastResultIndexRef.current = -1;
      startSpeechRec();

      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      speakTimerRef.current = setTimeout(() => {
        if (!mountedRef.current || callStateRef.current !== "listening" || processingRef.current || silentPingsRef.current >= 3) return;
        const pings = ["¿Hola? ¿Estás ahí?", "¿Me escuchas?", "¿Sigues ahí?"];
        const msg = pings[Math.min(silentPingsRef.current, pings.length - 1)];
        silentPingsRef.current += 1;
        abortSpeechRec("assistant-speaking");
        cleanupMediaRec();
        speakTTS(msg, false);
      }, 8000);
    }, 400);
  }

  async function initCall() {
    const abort = new AbortController();

    dotTimerRef.current = setInterval(() => {
      setDotCount(d => (d + 1) % 4);
    }, 500);

    const audioEl = new Audio();
    audioEl.preload = "auto";
    audioElRef.current = audioEl;
    if (typeof audioEl.setSinkId === "function") setHasSinkSupport(true);

    const stream = await acquireMic();
    if (!stream || abort.signal.aborted || !mountedRef.current) {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (!stream && mountedRef.current) setCS("error");
      return;
    }
    if (abort.signal.aborted) { stream.getTracks().forEach(t => t.stop()); return; }

    micStreamRef.current = stream;
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioUnlockedRef.current = true;
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
    const queuedHandlers = audioUnlockHandlersRef.current;
    audioUnlockHandlersRef.current = [];
    queuedHandlers.forEach(h => { try { h(); } catch {} });
    if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();
    await connectMicAnalyser(stream);
    setupSpeakerAnalyser();
    startRingAnimation();

    const ringCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ringCtx.createOscillator();
    const gain = ringCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 440;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ringCtx.destination);
    osc.start();
    const now = ringCtx.currentTime;
    for (let i = 0; i < 16; i++) {
      const t = 3.5 * i;
      gain.gain.setValueAtTime(0.08, now + t);
      gain.gain.setValueAtTime(0, now + t + 1.4);
    }
    ringbackRef.current = { ctx: ringCtx, osc, gain };

    navigator.mediaDevices.enumerateDevices().then(devices => {
      const mics = devices.filter(d => d.kind === "audioinput" && d.deviceId && d.label);
      const seen = new Set<string>();
      setMicDevices(mics.filter(d => {
        const key = d.groupId || d.label;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }));
      if (!selectedMic && mics.length > 0) setSelectedMic(mics[0].deviceId);
      setSpeakerDevices(devices.filter(d => d.kind === "audiooutput" && d.deviceId && d.label && d.deviceId !== "default" && d.deviceId !== "communications"));
    }).catch(() => {});

const greeting = `Hola, soy ${callName}. ¿Cómo estás?`;
      // Watchdog: si seguimos en "Llamando..." a los 6s, rescatamos con voz del navegador
      // para no quedarnos jamás en dialing (el TTS remoto es el punto más frágil).
      let rescued = false;
      greetingWatchdogRef.current = setTimeout(() => {
        if (callStateRef.current !== "dialing") return;
        rescued = true;
        greetingWatchdogRef.current = null;
        if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
        setCS("greeting");
        stopRingback();
        startFreqAnimation();
        if (!durTimerRef.current) {
          durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        silentPingsRef.current = 0;
        setSubtitleWords(greeting);
        speakWithBrowserVoice(sanitizeForTTS(greeting) || greeting)
          .then(() => {
            if (abort.signal.aborted || !mountedRef.current) return;
            if (callStateRef.current !== "ended" && callStateRef.current !== "error") {
              startListening();
            }
          })
          .catch(() => {
            if (abort.signal.aborted || !mountedRef.current) return;
            setErrorMsg("No se pudo iniciar la llamada.");
            setCS("error");
          });
      }, 6000);
      // El saludo no debe tardar: si el TTS tarda más de 12s, cambiamos a voz del navegador.
      const greetingRace = await Promise.race([
        (async () => {
          const sanitized = sanitizeForTTS(greeting);
          if (!sanitized) throw new Error("empty after sanitize");
          const result = await ttsText(sanitized, (activeCustom ? getCustomGirlVoice(activeCustom.id) : voiceIdMap[girl.id] || `female-${girl.id}`));
          if (abort.signal.aborted || !mountedRef.current) return null;
          audioEl.volume = 1;
          audioEl.src = `data:${result.contentType};base64,${result.audio}`;
          await new Promise<void>((resolve, reject) => {
            const t = setTimeout(() => reject(new Error("timeout")), 12000);
            audioEl.oncanplay = () => { clearTimeout(t); resolve(); };
            audioEl.onerror = () => { clearTimeout(t); reject(new Error("error")); };
          });
          return true;
        })(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 14000)),
      ]);

      if (abort.signal.aborted || !mountedRef.current || rescued) return;
      if (greetingRace === null) {
        // TTS lento: voz del navegador al instante para no dejar "Llamando..." para siempre.
        if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
        setCS("greeting");
        stopRingback();
        startFreqAnimation();
        if (!durTimerRef.current) {
          durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        
        silentPingsRef.current = 0;
        setSubtitleWords(greeting);
        await speakWithBrowserVoice(sanitizeForTTS(greeting) || greeting);
        if (abort.signal.aborted || !mountedRef.current) return;
        if (callStateRef.current !== "ended" && callStateRef.current !== "error") {
          startListening();
        }
        return;
      }

      try {
      setSubtitleWords(greeting);
      audioEl.onplaying = () => {
        if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
        setCS("greeting");
        stopRingback();
        startFreqAnimation();
        if (!durTimerRef.current) {
          durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
      };
      audioEl.onended = () => {
        if (mountedRef.current && callStateRef.current !== "ended" && callStateRef.current !== "error") {
          
          silentPingsRef.current = 0;
          startListening();
        }
      };
      const played = await Promise.race([
        playGuarded(audioEl).then(() => true, () => false),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2500)),
      ]);
      if (abort.signal.aborted || !mountedRef.current) return;
      if (!played && callStateRef.current === "dialing") {
        if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
        setCS("greeting");
        stopRingback();
        startFreqAnimation();
        if (!durTimerRef.current) {
          durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        // El audio remoto no arrancó: que hable con voz del navegador para que
        // siempre se la oiga desde el primer momento de la llamada.
        setSubtitleWords(greeting);
        await speakWithBrowserVoice(sanitizeForTTS(greeting) || greeting);
        if (abort.signal.aborted || !mountedRef.current) return;
        silentPingsRef.current = 0;
        startListening();
      }
    } catch (err) {
      console.warn("[CALL] greeting prep failed", err);
      if (abort.signal.aborted || !mountedRef.current || rescued) return;
      try {
        const sanitized = sanitizeForTTS(greeting);
        if (!sanitized) throw new Error("empty");
        const result = await ttsText(sanitized, (activeCustom ? getCustomGirlVoice(activeCustom.id) : voiceIdMap[girl.id] || `female-${girl.id}`));
        if (abort.signal.aborted || !mountedRef.current) return;
        audioEl.volume = 1;
        audioEl.src = `data:${result.contentType};base64,${result.audio}`;
        setSubtitleWords(greeting);
        audioEl.onplaying = () => {
          if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
          setCS("greeting");
          stopRingback();
          startFreqAnimation();
          if (!durTimerRef.current) {
            durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
          }
        };
        audioEl.onended = () => {
          if (mountedRef.current && callStateRef.current !== "ended" && callStateRef.current !== "error") {
            
            silentPingsRef.current = 0;
            startListening();
          }
        };
        await playGuarded(audioEl);
      } catch (err) {
        console.warn("[CALL] greeting TTS failed, usando voz del navegador", err);
        if (abort.signal.aborted || !mountedRef.current || rescued) return;
        try {
          if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
          setCS("greeting");
          stopRingback();
          startFreqAnimation();
          if (!durTimerRef.current) {
            durTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
          }
          setSubtitleWords(greeting);
          await speakWithBrowserVoice(sanitizeForTTS(greeting) || greeting);
          if (abort.signal.aborted || !mountedRef.current) return;
          if (callStateRef.current !== "ended" && callStateRef.current !== "error") {
            
            silentPingsRef.current = 0;
            startListening();
          }
        } catch (browserErr) {
          console.error("[CALL] browser greeting also failed", browserErr);
          if (abort.signal.aborted || !mountedRef.current || rescued) return;
          setErrorType("tts_generation_error");
          setErrorMsg("No se pudo iniciar la llamada.");
          setCS("error");
        }
      }
    }

    const resumeCtx = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    };
    document.addEventListener("touchstart", resumeCtx);
    document.addEventListener("touchend", resumeCtx);
    document.addEventListener("click", resumeCtx);

    const ctxKeepAlive = setInterval(() => {
      if (!mountedRef.current || !audioCtxRef.current) return;
      const st = callStateRef.current;
      if (st === "ended" || st === "error") return;
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    }, 1500);
    ctxKeepAliveRef.current = ctxKeepAlive;
  }

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || !!(navigator as any).standalone);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("mode") === "video") {
      toggleVideo();
      if (videoLockedOnce) {
        const t = setTimeout(() => {
          if (mountedRef.current) setVideoBlurred(true);
        }, 5000);
        videoGateTimerRef.current = t;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const abort = new AbortController();

    const timeout = setTimeout(() => {
      if (mountedRef.current && callStateRef.current === "dialing") {
        setErrorType("timeout");
        setErrorMsg("No se pudo iniciar la llamada.");
        setCS("error");
      }
    }, 30000);

    if (typeof window !== "undefined" && getPlan() === "free" && isFreeCallLimitReached()) {
      setCallLocked(true);
    } else {
      initCall();
    }

    return () => {
      clearTimeout(timeout);
      mountedRef.current = false;
      try { abort.abort(); } catch {}
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    processingRef.current = false;
    if (videoGateTimerRef.current) { clearTimeout(videoGateTimerRef.current); videoGateTimerRef.current = null; }
    abortSpeechRec("call-ended");
    cleanupMediaRec();
    stopRecorder();
    if (greetingWatchdogRef.current) { clearTimeout(greetingWatchdogRef.current); greetingWatchdogRef.current = null; }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
    disconnectMicAnalyser();
    stopFreqAnimation();
    stopRingback();
    if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); debounceTimerRef.current = null; }
    if (speakTimerRef.current) { clearTimeout(speakTimerRef.current); speakTimerRef.current = null; }
    if (backoffTimerRef.current) { clearTimeout(backoffTimerRef.current); backoffTimerRef.current = null; }
    if (listenTimeoutRef.current) { clearTimeout(listenTimeoutRef.current); listenTimeoutRef.current = null; }
    if (durTimerRef.current) { clearInterval(durTimerRef.current); durTimerRef.current = null; }
    if (dotTimerRef.current) { clearInterval(dotTimerRef.current); dotTimerRef.current = null; }
    if (ctxKeepAliveRef.current) { clearInterval(ctxKeepAliveRef.current); ctxKeepAliveRef.current = null; }
    cancelAnimationFrame(ringRafRef.current);
    cancelAnimationFrame(freqRafRef.current);
    cancelAnimationFrame(micLevelRafRef.current);
    const el = audioElRef.current;
    if (el) { el.pause(); el.src = ""; el.load(); }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (voiceActivityRef.current?.rafId) cancelAnimationFrame(voiceActivityRef.current.rafId);
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") audioCtxRef.current.close();
    audioCtxRef.current = null;
  }

  function hangUp() {
    if (callStateRef.current === "ended") return;
    setIsHangingUp(true);
    setTimeout(() => {
      if (!mountedRef.current) return;
      const storageId = activeCustom?.id ?? girl.id;
      const msgs = getConversationHistory(storageId);
      cleanup();
      setCS("ended");
      if (msgs.length > 0) saveToHistory(storageId, activeCustom?.name ?? girl.name, msgs);
      router.replace("/girls");
    }, 0);
  }

  function switchMic(deviceId: string) {
    if (switchingMic || !deviceId || deviceId === selectedMic) return;
    abortSpeechRec("device-switch");
    cleanupMediaRec();
    setSwitchingMic(true);
    setMicStatus("");
    const prev = micStreamRef.current;
    prevMicRef.current = prev;
    acquireMic(deviceId).then(async (stream) => {
      if (!mountedRef.current) { stream?.getTracks().forEach(t => t.stop()); return; }
      if (!stream) {
        if (prevMicRef.current && mountedRef.current) {
          micStreamRef.current = prevMicRef.current;
          disconnectMicAnalyser();
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();
          await connectMicAnalyser(prevMicRef.current);
          setCS("listening");
          startSpeechRec();
        }
        setMicStatus("No se pudo cambiar el micrófono");
        setTimeout(() => setMicStatus(""), 2000);
        setSwitchingMic(false);
        prevMicRef.current = null;
        return;
      }
      disconnectMicAnalyser();
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();
      await connectMicAnalyser(stream);
      if (prev) prev.getTracks().forEach(t => t.stop());
      micStreamRef.current = stream;
      setSelectedMic(deviceId);
      const track = stream.getAudioTracks()[0];
      setMicStatus("Micrófono cambiado a " + (track.label.replace(/\(.*?\)/g, "").trim() || "nuevo"));
      setTimeout(() => setMicStatus(""), 1800);
      if (mountedRef.current && callStateRef.current !== "ended") {
        setCS("listening");
        startSpeechRec();
      }
    }).catch(e => {
      console.error("[CALL] mic switch failed", e);
      if (prevMicRef.current && mountedRef.current) {
        micStreamRef.current = prevMicRef.current;
        disconnectMicAnalyser();
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
        connectMicAnalyser(prevMicRef.current);
        setCS("listening");
        startSpeechRec();
      }
      setMicStatus("No se pudo cambiar el micrófono");
      setTimeout(() => setMicStatus(""), 2000);
    }).finally(() => {
      setSwitchingMic(false);
      prevMicRef.current = null;
    });
  }

  function switchSpeaker(deviceId: string) {
    const el = audioElRef.current;
    if (!el || typeof el.setSinkId !== "function") return;
    setSpeakerStatus("");
    el.setSinkId(deviceId).then(() => {
      if (el.sinkId === deviceId) {
        setSelectedSpeaker(deviceId);
        const dev = speakerDevices.find(d => d.deviceId === deviceId);
        setSpeakerStatus("Audio cambiado a " + (dev?.label.replace(/\(.*?\)/g, "").trim() || "nuevo"));
        setTimeout(() => setSpeakerStatus(""), 1800);
      }
    }).catch(e => {
      console.error("[CALL] output switch failed", e);
      setSpeakerStatus("No se pudo cambiar la salida");
      setTimeout(() => setSpeakerStatus(""), 2000);
    });
  }

  function toggleVideo() {
    if (videoOn) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
      }
      setVideoOn(false);
    } else {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
        .then(stream => {
          if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
          const track = stream.getVideoTracks()[0];
          if (!track || track.readyState === "ended") { stream.getTracks().forEach(t => t.stop()); return; }
          videoStreamRef.current = stream;
          setVideoOn(true);
        })
        .catch(() => {});
    }
  }

  function toggleMute() {
    const newMuted = !muted;
    setMuted(newMuted);
    if (newMuted) {
      const track = micStreamRef.current?.getAudioTracks()[0];
      if (track) track.enabled = false;
      abortSpeechRec("user-finished");
      cleanupMediaRec();
      stopRecorder();
      if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); debounceTimerRef.current = null; }
    } else {
      if (callStateRef.current !== "listening" || processingRef.current) startSpeechRec();
      const track = micStreamRef.current?.getAudioTracks()[0];
      if (track) track.enabled = true;
    }
  }

  function toggleAudio() {
    const on = !audioOn;
    setAudioOn(on);
    if (on) {
      const el = audioElRef.current;
      if (el) el.volume = 1;
    } else {
      const el = audioElRef.current;
      if (el) { el.pause(); el.src = ""; el.load(); }
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      stopRingback();
      turnIdRef.current++;
      if (el) {
        try { el.dispatchEvent(new Event("ended")); } catch {}
      }
    }
  }

  function testMic() {
    if (micTesting || !micAnalyserRef.current) return;
    if (muted) { setMicTestResult("Activa el micrófono para probarlo"); return; }
    setMicTesting(true);
    setMicTestResult("");
    let maxRms = 0;
    let sumRms = 0;
    let count = 0;
    const buf = new Uint8Array(micAnalyserRef.current.fftSize);
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (!micAnalyserRef.current || !mountedRef.current) {
        clearInterval(interval);
        setMicTesting(false);
        return;
      }
      setMicTestCountdown(Math.max(0, 3 - Math.floor((Date.now() - startTime) / 1000)));
      micAnalyserRef.current.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      maxRms = Math.max(maxRms, rms);
      sumRms += rms;
      count++;
    }, 80);
    setTimeout(() => {
      clearInterval(interval);
      if (maxRms > 0.15) setMicTestResult("El micrófono funciona correctamente.");
      else if (maxRms > 0.05) setMicTestResult("El nivel del micrófono es muy bajo.");
      else setMicTestResult("No estamos recibiendo sonido.");
      setMicTesting(false);
      setMicTestCountdown(0);
    }, 3000);
  }

  function sendTextMessage() {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    setShowTextPanel(false);
    if (processingRef.current || callStateRef.current === "ended" || callStateRef.current === "error") return;
    abortSpeechRec("user-finished");
    cleanupMediaRec();
    stopRecorder();
    if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); debounceTimerRef.current = null; }
    if (backoffTimerRef.current) { clearTimeout(backoffTimerRef.current); backoffTimerRef.current = null; }
    if (speakTimerRef.current) { clearTimeout(speakTimerRef.current); speakTimerRef.current = null; }
    finalBufferRef.current = "";
    interimBufferRef.current = "";
    lastResultIndexRef.current = -1;
    if (debug) { (window as any).__callDebugInterim = ""; (window as any).__callDebugFinal = ""; }
    processingRef.current = true;
    setCS("processing");
    doAIRef.current?.(text);
  }

  const isConnected = callState === "listening" || callState === "processing" || callState === "speaking" || callState === "greeting";
  const isDialing = callState === "dialing";

  // Límite diario de llamada gratis (1 minuto al día, compartido entre todas las chicas).
  useEffect(() => {
    if (!isFreeUser || callLocked) return;
    if (!isConnected || isDialing) return;
    const interval = setInterval(() => {
      const left = getFreeSecondsLeftToday();
      if (left <= 0) {
        clearInterval(interval);
        setFreeSecondsLeft(0);
        setCallLocked(true);
        try { abortSpeechRec("free-limit"); } catch {}
        try { if (audioElRef.current) { audioElRef.current.pause(); } } catch {}
        try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch {}
        return;
      }
      recordCallSeconds(1);
      setFreeSecondsLeft(getFreeSecondsLeftToday());
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFreeUser, callLocked, isConnected, isDialing]);

  const statusText = isDialing
    ? "Llamando" + ".".repeat(dotCount)
    : callState === "greeting" || callState === "speaking"
    ? "Hablando"
    : callState === "processing"
    ? "Pensando"
    : muted && callState === "listening"
    ? "Micrófono silenciado"
    : callState === "listening"
    ? "Escuchando"
    : "Conectando";

  return (
    <>
      <style>{'@keyframes sp{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'}</style>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__voiceId="${(activeCustom ? getCustomGirlVoice(activeCustom.id) : voiceIdMap[girl.id] || `female-${girl.id}`)}"`,
        }}
      />
      <div
        style={{
          position: "fixed", inset: 0, paddingTop: 60, zIndex: 9999, overflow: "hidden",
          background: "#08050a", overscrollBehavior: "none", touchAction: "manipulation",
          fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Arial,sans-serif",
          WebkitUserSelect: "none", userSelect: "none",
          display: "grid", gridTemplateRows: "auto 1fr auto",
          minHeight: "100dvh",
          opacity: isHangingUp ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {callGirlImage && (
          <img
            src={callGirlImage}
            alt=""
            style={{
              position: "absolute", inset: -60,
              width: "calc(100% + 120px)", height: "calc(100% + 120px)",
              objectFit: "cover", objectPosition: "center 30%",
              filter: "blur(48px) brightness(0.28) saturate(0.7)",
              transform: "scale(1.15)", opacity: 0.5, pointerEvents: "none",
            }}
          />
        )}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(20,5,15,0.4) 0%, rgba(8,4,12,0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", top: "45%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(70vw, 320px)", height: "min(70vw, 320px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(180,50,100,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", zIndex: 1,
            transform: "translateY(-14px)", minHeight: 0, padding: "0 24px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "min(180px, calc(100vw - 200px), 184px)",
              height: "min(180px, calc(100vw - 200px), 184px)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute", inset: -7, borderRadius: "50%",
                border: "1px solid rgba(180,50,100,0.18)",
                transform: `scale(${ringScale})`, opacity: ringOpacity,
                pointerEvents: "none",
                transition: "transform 0.3s ease, opacity 0.3s ease",
              }}
            />
            {callGirlImage ? (
              <img
                src={callGirlImage}
                alt={callName}
                style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  objectFit: "cover", objectPosition: "center",
                  border: "1px solid rgba(255,255,255,0.14)",
                  filter: videoBlurred ? "blur(28px) brightness(0.45) saturate(0.7)" : "none",
                  transition: "filter 600ms ease",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "linear-gradient(135deg,#ff4c98,#a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 48, fontWeight: 700, color: "#f7f7f8",
                }}
              >
                {callName[0]}
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: "clamp(36px, 9vw, 42px)", fontWeight: 650,
              lineHeight: 1, color: "rgba(255,255,255,0.97)",
              textAlign: "center",
            }}
          >
            {callName}
          </div>
          <div
            style={{
              marginTop: 16, fontSize: 17, fontWeight: 400,
              color: "rgba(255,255,255,0.68)",
              textAlign: "center", lineHeight: 1.25, height: 22,
              transition: "opacity 0.18s ease",
            }}
          >
            {statusText}
          </div>
          <div
            style={{
              marginTop: 6, fontSize: 14, fontWeight: 400,
              color: "rgba(255,255,255,0.42)",
              fontVariantNumeric: "tabular-nums",
              textAlign: "center", lineHeight: 1.2, minHeight: 18,
              visibility: isConnected ? "visible" : "hidden",
              position: "relative",
            }}
          >
            {Math.floor(callDuration / 60).toString().padStart(2, "0")}
            :{(callDuration % 60).toString().padStart(2, "0")}
            {isFreeUser && isConnected && !callLocked && (
              <div
                style={{
                  marginTop: 4, fontSize: 12, fontWeight: 600,
                  color: freeSecondsLeft <= 10 ? "#ff4466" : "#FF3B82",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {freeSecondsLeft}s restantes hoy
              </div>
            )}
          </div>
          {subtitlesOn && isConnected && (
            <div
              aria-live="polite"
              style={{
                marginTop: 14,
                maxWidth: "min(340px, calc(100vw - 60px))",
                minHeight: 46,
                fontSize: 14, fontWeight: 500, lineHeight: 1.45,
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                textShadow: "0 1px 4px rgba(0,0,0,0.55)",
                display: "flex", alignItems: "flex-start", justifyContent: "center",
                padding: "0 12px",
              }}
            >
              {subtitleText}
            </div>
          )}
        </div>

        <div
          style={{
            width: "min(382px, calc(100vw - 32px))",
            marginInline: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            rowGap: 24, columnGap: 16,
            justifyItems: "center", alignItems: "start",
            zIndex: 2, paddingTop: 40,
            paddingBottom: isStandalone
              ? "calc(env(safe-area-inset-bottom) + 24px)"
              : "max(calc(env(safe-area-inset-bottom) + 24px), 72px)",
          }}
        >
          {isDialing ? (
            <button
              onClick={hangUp}
              aria-label="Cancelar llamada"
              style={{
                gridColumn: 2, gridRow: 2,
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
                background: "none", border: 0, cursor: "pointer",
                padding: 0, WebkitTapHighlightColor: "transparent",
              }}
            >
              <div
                style={{
                  width: 74, height: 74, borderRadius: "50%",
                  background: "#ff453a", border: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px rgba(255,69,58,0.25)",
                }}
              >
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>Cancelar</span>
            </button>
          ) : (
            <>
              {/* Audio */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={toggleAudio}
                  aria-label={audioOn ? "Desactivar audio" : "Activar audio"}
                  aria-pressed={!audioOn}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: audioOn ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.86)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: audioOn ? "rgba(255,255,255,0.92)" : "rgba(20,16,22,0.96)",
                    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                    transition: "transform 140ms ease, background-color 160ms ease, color 160ms ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onPointerDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {audioOn ? (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </>
                    ) : (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </>
                    )}
                  </svg>
                </button>
                <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>
                  {audioOn ? "Audio" : "Activar audio"}
                </span>
              </div>

              {/* Video */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={toggleVideo}
                  aria-label={videoLockedOnce ? "Video (Premium)" : videoOn ? "Cerrar video" : "Activar video"}
                  aria-pressed={videoOn}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: videoOn ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.09)",
                    border: videoLockedOnce ? "1.5px solid rgba(255,87,152,0.6)" : "1px solid rgba(255,255,255,0.10)",
                    boxShadow: videoLockedOnce ? "0 0 16px rgba(255,87,152,0.28)" : "none",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: videoOn ? "rgba(20,16,22,0.96)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                    transition: "transform 140ms ease, background-color 160ms ease, color 160ms ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onPointerDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {videoOn ? (
                      <>
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </>
                    ) : (
                      <>
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </>
                    )}
                  </svg>
                  {videoLockedOnce && (
                    <span
                      style={{
                        position: "absolute", top: 2, right: 2, zIndex: 6,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#100710", border: "1.5px solid #FF5798",
                        boxShadow: "0 0 4px rgba(255,87,152,0.55)",
                        display: "grid", placeItems: "center",
                      }}
                    >
                      <LockIcon size={9} />
                    </span>
                  )}
                </button>
                <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>
                  {videoOn ? "Cerrar video" : "Video"}
                </span>
              </div>

              {/* Silenciar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Activar micrófono" : "Silenciar micrófono"}
                  aria-pressed={muted}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: muted ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: muted ? "rgba(20,16,22,0.96)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                    transition: "transform 140ms ease, background-color 160ms ease, color 160ms ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onPointerDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {muted ? (
                      <>
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </>
                    )}
                  </svg>
                </button>
                <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>
                  {muted ? "Activar" : "Silenciar"}
                </span>
              </div>

              {/* Subtítulos */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setSubtitlesOn(v => !v)}
                  aria-label={subtitlesOn ? "Desactivar subtítulos" : "Activar subtítulos"}
                  aria-pressed={subtitlesOn}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: subtitlesOn ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: subtitlesOn ? "rgba(20,16,22,0.96)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                    transition: "transform 140ms ease, background-color 160ms ease, color 160ms ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onPointerDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
                    <path d="M9 10a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-4z" />
                    <path d="M15 10a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H16a1 1 0 0 1-1-1v-4z" />
                  </svg>
                </button>
                <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>Subtítulos</span>
              </div>

              {/* Finalizar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={hangUp}
                  aria-label="Finalizar llamada"
                  disabled={isHangingUp}
                  style={{
                    width: 74, height: 74, borderRadius: "50%",
                    background: "#ff453a", border: 0,
                    cursor: isHangingUp ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: isHangingUp ? 0.4 : 1,
                    boxShadow: "0 0 20px rgba(255,69,58,0.25)",
                    transition: "transform 140ms ease, opacity 0.15s ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onPointerDown={e => { if (!isHangingUp) e.currentTarget.style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </button>
                <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>Finalizar</span>
              </div>

              {/* Chat */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => {
                    if (callStateRef.current === "ended") return;
                    setIsHangingUp(true);
                    setTimeout(() => {
                      if (!mountedRef.current) return;
                      const storageId = activeCustom?.id ?? girl.id;
                      const msgs = getConversationHistory(storageId);
                      cleanup();
                      setCS("ended");
                      if (msgs.length > 0) saveToHistory(storageId, activeCustom?.name ?? girl.name, msgs);
                      router.replace("/girls");
                    }, 0);
                  }}
                  aria-label="Ir al chat"
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                    transition: "transform 140ms ease, background-color 160ms ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onPointerDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  onPointerLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>Chat</span>
              </div>
            </>
          )}
        </div>

        {/* Overlay Premium para videollamada (5s para gratis) */}
        {videoBlurred && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 5000,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 14, padding: "0 32px", textAlign: "center",
              background: "rgba(8,4,10,0.34)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <button
              onClick={hangUp}
              aria-label="Salir de la llamada"
              style={{
                position: "absolute", top: "calc(env(safe-area-inset-top) + 56px)", left: 16,
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                zIndex: 5001, color: "#fff",
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="#FF5798" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.95 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>
              Continuar la videollamada
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,.78)", textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>
              La videollamada completa es exclusiva de Premium.
            </span>
            <button
              onClick={() => router.push("/premium")}
              style={{
                marginTop: 6, padding: "13px 30px", borderRadius: 999,
                border: 0, cursor: "pointer",
                background: "linear-gradient(135deg,#FF5798,#FF6AA5)",
                color: "#fff", fontWeight: 700, fontSize: 15,
                boxShadow: "0 8px 28px rgba(255,87,152,.45)",
                fontFamily: "inherit",
              }}
            >
              Hazte Premium
            </button>
          </div>
        )}

        {/* Overlay límite diario de llamada gratis agotado */}
        {callLocked && (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 5000,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 14, padding: "0 32px", textAlign: "center",
              background: "rgba(8,4,10,0.86)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <button
              onClick={hangUp}
              aria-label="Salir de la llamada"
              style={{
                position: "absolute", top: "calc(env(safe-area-inset-top) + 56px)", left: 16,
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                zIndex: 5001, color: "#fff",
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="#FF5798" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.95 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>
              Se acabó tu tiempo gratis de hoy
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,.78)", textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>
              Tienes 1 minuto de llamada gratis al día. Hazte Premium para llamar sin límites.
            </span>
            <button
              onClick={() => router.push("/premium")}
              style={{
                marginTop: 6, padding: "13px 30px", borderRadius: 999,
                border: 0, cursor: "pointer",
                background: "linear-gradient(135deg,#FF5798,#FF6AA5)",
                color: "#fff", fontWeight: 700, fontSize: 15,
                boxShadow: "0 8px 28px rgba(255,87,152,.45)",
                fontFamily: "inherit",
              }}
            >
              Hazte Premium
            </button>
          </div>
        )}

        {/* Video preview */}
        {videoOn && (
          <div
            style={{
              position: "fixed",
              top: "calc(env(safe-area-inset-top) + 72px)",
              right: "max(16px, env(safe-area-inset-right))", width: 92, height: 126,
              borderRadius: 18, overflow: "hidden",
              zIndex: 10, background: "#000",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            <video
              ref={el => { if (el && videoStreamRef.current && !el.srcObject) { el.srcObject = videoStreamRef.current; el.play().catch(() => {}); } }}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", filter: videoBlurred ? "blur(6px)" : "none" }}
            />
            {videoLockedOnce && (
              <span
                style={{
                  position: "absolute", top: 4, right: 4, zIndex: 11,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "rgba(8,4,10,0.85)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1.5px solid #FF5798",
                }}
                aria-label="Vídeo Premium"
              >
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#FF5798" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
            )}
          </div>
        )}

        {/* Device settings panel */}
        {showDevicePanel && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10000 }}
            onClick={() => setShowDevicePanel(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute", left: 10, right: 10,
                bottom: "calc(env(safe-area-inset-bottom) + 10px)",
                maxHeight: "68dvh",
                borderRadius: "32px 32px 26px 26px",
                background: "rgba(18,14,21,0.92)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "12px 18px 20px",
                overflowY: "auto",
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 650, color: "#F7F7F8" }}>Audio de la llamada</div>
                <button
                  onClick={() => setShowDevicePanel(false)}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(247,247,248,0.6)" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(247,247,248,0.5)", marginBottom: 6 }}>Micrófono</div>
                {micStatus && <div style={{ fontSize: 12, color: micStatus.includes("cambiado") ? "#4ade80" : "#ff6b6b", padding: "4px 0 6px" }}>{micStatus}</div>}
                {micDevices.length === 0 ? (
                  <div style={{ fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0" }}>No se encontraron micrófonos</div>
                ) : (
                  micDevices.map(d => (
                    <button
                      key={d.deviceId}
                      onClick={() => switchMic(d.deviceId)}
                      disabled={switchingMic}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", height: 54, padding: "0 12px",
                        borderRadius: 16, border: 0,
                        cursor: switchingMic ? "default" : "pointer",
                        background: d.deviceId === selectedMic && !micStatus.includes("cambiado") ? "rgba(255,55,145,0.10)" : "transparent",
                        color: d.deviceId === selectedMic ? "#fff" : "rgba(247,247,248,0.72)",
                        fontSize: 13, fontWeight: 500, textAlign: "left",
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                      </svg>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.label.replace(/\(.*?\)/g, "").trim() || "Micrófono"}
                      </span>
                      {switchingMic && d.deviceId !== selectedMic ? (
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,87,152,0.3)", borderTopColor: "#FF5798", animation: "sp 0.6s linear infinite" }} />
                      ) : d.deviceId === selectedMic ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF5798" stroke="none">
                          <circle cx="12" cy="12" r="8" />
                          <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" />
                        </svg>
                      ) : null}
                    </button>
                  ))
                )}
                <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(100, 100 * Math.max(0, ringScale - 1) / 0.09) + "%", background: "#FF5798", borderRadius: 2, transition: "width 0.08s linear" }} />
                </div>
                {muted ? (
                  <div style={{ marginTop: 10, fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0", textAlign: "center" }}>
                    Activa el micrófono para probarlo
                  </div>
                ) : (
                  <button
                    onClick={testMic}
                    disabled={micTesting}
                    style={{
                      marginTop: 10, padding: "8px 16px", borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent", color: "#F7F7F8",
                      fontSize: 13, fontWeight: 500,
                      cursor: micTesting ? "default" : "pointer",
                      width: "100%",
                    }}
                  >
                    {micTesting ? "Probando micrófono... " + micTestCountdown : "Probar micrófono"}
                  </button>
                )}
                {micTestResult && (
                  <div style={{ fontSize: 12, color: micTestResult.includes("correctamente") ? "#4ade80" : micTestResult.includes("bajo") || micTestResult.includes("Activa") ? "#f59e0b" : "#ff6b6b", padding: "6px 0 0", textAlign: "center" }}>
                    {micTestResult}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(247,247,248,0.5)", marginBottom: 6 }}>Salida de audio</div>
                {speakerStatus && <div style={{ fontSize: 12, color: speakerStatus.includes("cambiado") ? "#4ade80" : "#ff6b6b", padding: "4px 0 6px" }}>{speakerStatus}</div>}
                {hasSinkSupport ? (
                  speakerDevices.length === 0 ? (
                    <div style={{ fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0" }}>No se encontraron dispositivos de salida</div>
                  ) : (
                    speakerDevices.map(d => (
                      <button
                        key={d.deviceId}
                        onClick={() => switchSpeaker(d.deviceId)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", height: 54, padding: "0 12px",
                          borderRadius: 16, border: 0, cursor: "pointer",
                          background: d.deviceId === selectedSpeaker ? "rgba(255,55,145,0.10)" : "transparent",
                          color: d.deviceId === selectedSpeaker ? "#fff" : "rgba(247,247,248,0.72)",
                          fontSize: 13, fontWeight: 500, textAlign: "left",
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.label.replace(/\(.*?\)/g, "").trim() || "Altavoz"}
                        </span>
                        {d.deviceId === selectedSpeaker && (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF5798" stroke="none">
                            <circle cx="12" cy="12" r="8" />
                            <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" />
                          </svg>
                        )}
                      </button>
                    ))
                  )
                ) : (
                  <div style={{ fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0" }}>
                    La salida de audio se controla desde tu iPhone.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {callState === "error" && (
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(6,4,8,0.6)",
            }}
          >
            <div
              style={{
                background: "rgba(18,14,21,0.92)",
                backdropFilter: "blur(24px)",
                padding: "28px 24px", borderRadius: 20,
                margin: "0 24px", maxWidth: 320,
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}
            >
              <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#F7F7F8" }}>
                {errorMsg || "Se ha producido un error."}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    setErrorType("");
                    setIsHangingUp(true);
                    setTimeout(() => { goBack(router, "/girls"); }, 0);
                  }}
                  style={{
                    padding: "10px 24px", borderRadius: 999, border: 0,
                    background: "rgba(255,255,255,0.1)",
                    color: "#F7F7F8", fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug overlay */}
        {debug && (
          <div
            style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top) + 60px)",
              right: 10, zIndex: 9999,
              background: "rgba(0,0,0,0.85)", borderRadius: 12,
              padding: "10px 14px", fontSize: 11,
              fontFamily: "monospace", color: "#0f0",
              maxWidth: 260, pointerEvents: "none",
            }}
          >
            <div>state: {callState}</div>
            <div>driver: {recDriver}</div>
            <div>rec: {recordingDriverRef.current}</div>
            <div>micLv: {(ringScale - 1).toFixed(3)}</div>
            <div>ring: {ringScale.toFixed(3)}</div>
            <div>interim: &quot;{(window as any).__callDebugInterim || ""}&quot;</div>
            <div>final: &quot;{(window as any).__callDebugFinal || ""}&quot;</div>
            <div>turnId: {turnIdRef.current}</div>
            <div>muted: {String(muted)}</div>
            <div>canSink: {String(hasSinkSupport)}</div>
            <div>sinkId: {audioElRef.current?.sinkId || "—"}</div>
          </div>
        )}
        </div>
    </>
  );
}
