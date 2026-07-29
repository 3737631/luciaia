"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCustomization } from "@/lib/storage";
import { getFallbackResponse } from "@/lib/ai";
import { sendChatMessage } from "@/lib/chatClient";
import { sttAudio, ttsText } from "@/lib/voiceClient";
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

type CallMode = "dialing" | "greeting" | "speaking" | "listening" | "processing" | "ended" | "error";

const voiceProfiles: Record<string, { pitch: number; rate: number }> = {
  luna: { pitch: 1.15, rate: 0.92 }, nia: { pitch: 1.05, rate: 1.05 },
  vera: { pitch: 0.88, rate: 0.85 }, alma: { pitch: 1.1, rate: 0.9 },
  kira: { pitch: 0.95, rate: 1.0 }, maya: { pitch: 1.2, rate: 1.08 },
  sasha: { pitch: 0.82, rate: 0.88 }, yuki: { pitch: 1.3, rate: 0.82 },
};

const voiceIdMap: Record<string, string> = {
  luna: "female-luna", nia: "female-nia", vera: "female-vera", alma: "female-alma",
  kira: "female-kira", maya: "female-maya", sasha: "female-sasha", yuki: "female-yuki",
  axel: "male-axel", liam: "male-liam", athena: "female-athena", eva: "female-eva",
  cora: "female-cora", mira: "female-mira", yumi_lib: "female-yumi_lib", raven: "female-raven",
  sky: "female-sky", jade: "female-jade", gemma: "female-gemma", nova: "female-nova",
  lena: "female-lena", shadow: "female-shadow", morgana: "female-morgana", roxy: "female-roxy",
  iris: "female-iris", zara: "female-zara",
};

const AUDIO_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/mpeg"];

export default function CallScreen({ girl }: { girl: Girl }) {
  const router = useRouter();
  const custom = getCustomization(girl.id);
  const img = girl.cloudinaryImage;

  const [mode, setMode] = useState<CallMode>("dialing");
  const [statusText, setStatusText] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [subtitleText, setSubtitleText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [micStatus, setMicStatus] = useState("");
  const [speakerStatus, setSpeakerStatus] = useState("");
  const [isSwitchingMic, setIsSwitchingMic] = useState(false);
  const [canSetSinkId, setCanSetSinkId] = useState(false);
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [ringScale, setRingScale] = useState(1);
  const [ringOpacity, setRingOpacity] = useState(0.3);
  const [fadeOut, setFadeOut] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testResult, setTestResult] = useState("");

  const mountedRef = useRef(true);
  const modeRef = useRef<CallMode>("dialing");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringbackRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  const greetingPlayedRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const speechBufferRef = useRef("");
  const finalTranscriptRef = useRef("");
  const shouldListenRef = useRef(false);
  const turnIdRef = useRef(0);
  const doAIRef = useRef<((text: string) => Promise<string | undefined>) | null>(null);
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextListenAtRef = useRef(0);
  const promptCountRef = useRef(0);
  const animFrameRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const vadRef = useRef<{
    analyser: AnalyserNode; dataArray: Uint8Array;
    noiseFloor: number; speakingSince: number; silentSince: number;
    active: boolean; rafId: number;
  } | null>(null);
  const recorderActiveRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__voiceId = voiceIdMap[girl.id] || `female-${girl.id}`;
    }
  }, [girl.id]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; cleanup(); };
  }, []);

  useEffect(() => {
    if (mode === "dialing") {
      startRingback();
      greetingPlayedRef.current = false;
      const t = setTimeout(() => {
        if (mountedRef.current) startCall();
      }, 3000);
      const t30 = setTimeout(() => {
        if (mountedRef.current && modeRef.current === "dialing" && !greetingPlayedRef.current) {
          setErrorMessage("No se pudo iniciar la llamada.");
          setCallMode("error");
        }
      }, 30000);
      return () => { clearTimeout(t); clearTimeout(t30); stopRingback(); };
    } else {
      stopRingback();
    }
  }, [mode]);

  useEffect(() => {
    if (showDevicePanel) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        setMicDevices(devices.filter(d => d.kind === "audioinput" && d.deviceId));
        setSpeakerDevices(devices.filter(d => d.kind === "audiooutput" && d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications"));
      });
    }
  }, [showDevicePanel]);

  function setCallMode(m: CallMode) {
    modeRef.current = m;
    setMode(m);
  }

  // Ringback
  function startRingback() {
    if (ringbackRef.current) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      ringbackRef.current = { ctx, osc, gain };
      const now = ctx.currentTime;
      for (let i = 0; i < 16; i++) {
        const t = 3.5 * i;
        gain.gain.setValueAtTime(0.08, now + t);
        gain.gain.setValueAtTime(0, now + t + 1.4);
      }
    } catch {}
  }

  function stopRingback() {
    if (ringbackRef.current) {
      try {
        ringbackRef.current.osc.stop();
        ringbackRef.current.ctx.close();
      } catch {}
      ringbackRef.current = null;
    }
  }

  // Audio setup
  function setupAudioElement() {
    if (audioRef.current) return;
    const el = new Audio();
    el.preload = "auto";
    audioRef.current = el;
    if (typeof el.setSinkId === "function") {
      setCanSetSinkId(true);
    }
  }

  async function acquireMic(deviceId?: string): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
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
      if (e.name === "NotAllowedError") setErrorMessage("Nuvia necesita acceso al micrófono para escucharte.");
      else if (e.name === "NotFoundError") setErrorMessage("No se encontró ningún micrófono.");
      else setErrorMessage("Error al abrir el micrófono.");
      return null;
    }
  }

  function connectMicAnalyser(stream: MediaStream) {
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.68;
      source.connect(analyser);
      micAnalyserRef.current = analyser;
    } catch {}
  }

  function connectOutputAnalyser() {
    if (!audioCtxRef.current || !audioRef.current || outputSourceRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.68;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      outputSourceRef.current = source;
      outputAnalyserRef.current = analyser;
    } catch {}
  }

  function disconnectAnalyser() {
    if (outputSourceRef.current) {
      try { outputSourceRef.current.disconnect(); } catch {}
      outputSourceRef.current = null;
    }
    if (outputAnalyserRef.current) {
      try { outputAnalyserRef.current.disconnect(); } catch {}
      outputAnalyserRef.current = null;
    }
    if (micAnalyserRef.current) {
      try { micAnalyserRef.current.disconnect(); } catch {}
      micAnalyserRef.current = null;
    }
  }

  function releaseMic() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function releaseVideo() {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
  }

  // TTS
  async function speakTTS(text: string, isGreeting = false): Promise<void> {
    if (!mountedRef.current) return;
    shouldListenRef.current = false;
    stopRecognition();
    stopVAD();
    const turnId = ++turnIdRef.current;
    if (isGreeting && !greetingPlayedRef.current) {
      try {
        const result = await ttsText(text);
        if (!mountedRef.current || turnId !== turnIdRef.current) return;
        const el = audioRef.current;
        if (!el) return;
        el.volume = 1;
        el.src = `data:${result.contentType};base64,${result.audio}`;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("timeout")), 15000);
          el.oncanplay = () => { clearTimeout(timeout); resolve(); };
          el.onerror = () => { clearTimeout(timeout); reject(new Error("error")); };
        });
        if (!mountedRef.current || turnId !== turnIdRef.current) return;
        el.onplaying = () => {
          if (!greetingPlayedRef.current) {
            greetingPlayedRef.current = true;
            if (timerRef.current) clearInterval(timerRef.current);
            setCallMode("greeting");
            setStatusText("Hablando");
            if (!timerRef.current) {
              timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
            }
          }
        };
        el.onended = () => {
          if (greetingPlayedRef.current && mountedRef.current) {
            resetAndListen();
          }
        };
        await el.play();
      } catch (e) {
        console.warn("[CALL] greeting TTS failed", e);
        if (!mountedRef.current || turnId !== turnIdRef.current) return;
        try {
          const result = await ttsText(text);
          if (!mountedRef.current || turnId !== turnIdRef.current) return;
          const el = audioRef.current;
          if (!el) return;
          el.volume = 1;
          el.src = `data:${result.contentType};base64,${result.audio}`;
          el.onplaying = () => {
            if (!greetingPlayedRef.current) {
              greetingPlayedRef.current = true;
              if (timerRef.current) clearInterval(timerRef.current);
              setCallMode("greeting");
              setStatusText("Hablando");
              if (!timerRef.current) {
                timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
              }
            }
          };
          el.onended = () => {
            if (greetingPlayedRef.current && mountedRef.current) resetAndListen();
          };
          await el.play();
        } catch {
          if (mountedRef.current) {
            setErrorMessage("No se pudo iniciar la llamada.");
            setCallMode("error");
          }
        }
      }
    } else {
      setCallMode("speaking");
      setStatusText("Hablando");
      if (subtitlesOn) setSubtitleText(text);
      try {
        const result = await ttsText(text);
        if (!mountedRef.current || turnId !== turnIdRef.current) return;
        const el = audioRef.current;
        if (!el) { fallbackSpeak(text); return; }
        el.volume = isMuted ? 0 : 1;
        el.src = `data:${result.contentType};base64,${result.audio}`;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("timeout")), 30000);
          el.onplaying = () => { clearTimeout(timeout); };
          el.onended = () => { clearTimeout(timeout); resolve(); };
          el.onerror = () => { clearTimeout(timeout); reject(new Error("error")); };
          el.play().catch(reject);
        });
      } catch {
        if (mountedRef.current && turnId === turnIdRef.current) {
          await fallbackSpeak(text);
        }
      }
      if (mountedRef.current && turnId === turnIdRef.current) {
        resetAndListen();
      }
    }
  }

  function fallbackSpeak(text: string): Promise<void> {
    return new Promise(resolve => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      const profile = voiceProfiles[girl.id] || voiceProfiles.luna;
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      speakTimerRef.current = setTimeout(resolve, text.length * 60 + 2000);
    });
  }

  function resetAndListen() {
    nextListenAtRef.current = Date.now() + 350;
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    listenTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || modeRef.current === "ended" || modeRef.current === "error") return;
      shouldListenRef.current = false;
      speechBufferRef.current = "";
      finalTranscriptRef.current = "";
      startListening();
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      promptTimerRef.current = setTimeout(promptIfSilent, 8000);
    }, 400);
  }

  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function promptIfSilent() {
    if (!mountedRef.current || modeRef.current !== "listening" || shouldListenRef.current) return;
    const prompts = ["¿Hola? ¿Estás ahí?", "¿Me escuchas?", "¿Sigues ahí?"];
    const idx = Math.min(promptCountRef.current, prompts.length - 1);
    promptCountRef.current += 1;
    setCallMode("speaking");
    speakTTS(prompts[idx]).then(() => {
      if (mountedRef.current) resetAndListen();
    });
  }

  // Speech Recognition
  function startListening() {
    if (!streamRef.current || !mountedRef.current) return;
    if (shouldListenRef.current) return;
    shouldListenRef.current = true;
    setCallMode("listening");
    setStatusText(isMuted ? "Micrófono silenciado" : "Escuchando");
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      startSR(new SR());
    } else {
      startMR();
    }
  }

  function startSR(recognition: SpeechRecognition) {
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = true;
    (recognition as any).maxAlternatives = 1;
    recognition.onstart = () => {};
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!shouldListenRef.current || modeRef.current !== "listening") return;
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = (event.results[i][0]?.transcript || "").trim();
        if (!transcript) continue;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript + " ";
        }
      }
      speechBufferRef.current = (speechBufferRef.current + " " + final).trim();
      const combined = (finalTranscriptRef.current + " " + speechBufferRef.current + " " + interim).trim();
      if (combined.length >= 3) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          const text = (finalTranscriptRef.current + " " + speechBufferRef.current).trim();
          if (text && !shouldListenRef.current && modeRef.current === "listening") {
            onSpeechDetected(text);
          }
        }, 1400);
      }
    };
    recognition.onend = () => {
      if (shouldListenRef.current && mountedRef.current) {
        const text = (finalTranscriptRef.current + " " + speechBufferRef.current).trim();
        if (text && modeRef.current === "listening") {
          onSpeechDetected(text);
        } else {
          startMR();
        }
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        setErrorMessage("Nuvia necesita acceso al micrófono.");
        setCallMode("error");
        return;
      }
      if (e.error === "no-speech") {
        if (mountedRef.current && modeRef.current === "listening") startMR();
        return;
      }
      startMR();
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { startMR(); }
  }

  function stopRecognition() {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }

  function startMR() {
    if (vadRef.current || !streamRef.current || !audioCtxRef.current) return;
    stopRecorder();
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const source = ctx.createMediaStreamSource(streamRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.fftSize);
    const chunks: Blob[] = [];
    const mimeType = AUDIO_MIME_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || "";
    let noiseFloor = 0, calibrationCount = 0;
    let speakingSince = 0, silentSince = 0;
    let active = false, done = false;
    if (!recorderActiveRef.current && streamRef.current) {
      recorderActiveRef.current = true;
      try {
        const r = mimeType ? new MediaRecorder(streamRef.current, { mimeType }) : new MediaRecorder(streamRef.current);
        r.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        r.start(250);
        recorderRef.current = r;
      } catch {}
    }
    vadRef.current = { analyser, dataArray, noiseFloor, speakingSince, silentSince, active, rafId: 0 };
    function calibrate() {
      analyser.getByteTimeDomainData(dataArray);
      let rms = 0;
      for (let i = 0; i < dataArray.length; i++) { const v = (dataArray[i] - 128) / 128; rms += v * v; }
      const level = Math.sqrt(rms / dataArray.length);
      if (calibrationCount < 50) {
        if (level > 0 && level < 0.01) noiseFloor += (level - noiseFloor) / (calibrationCount + 1);
        calibrationCount++;
        vadRef.current!.rafId = requestAnimationFrame(calibrate);
        return;
      }
      vadRef.current!.noiseFloor = noiseFloor;
      detect(level, Math.max(1.2 * noiseFloor, 0.002));
    }
    function detect(level: number, threshold: number) {
      if (done || !mountedRef.current) return;
      const now = Date.now();
      if (level > threshold) {
        if (!active) { active = true; speakingSince = now; silentSince = 0; }
      } else if (active) {
        if (silentSince) {
          if (now - silentSince > 900) {
            done = true; active = false;
            stopRecorderWithCb(() => {
              vadRef.current = null;
              if (chunks.length > 0) onAudioBlob(new Blob(chunks, { type: mimeType || "audio/mp4" }));
              else resetAndListen();
            });
            return;
          }
        } else { silentSince = now; }
      }
      if (active && now - speakingSince > 30000) {
        done = true; active = false;
        stopRecorderWithCb(() => {
          vadRef.current = null;
          if (chunks.length > 0) onAudioBlob(new Blob(chunks, { type: mimeType || "audio/mp4" }));
          else resetAndListen();
        });
        return;
      }
      analyser.getByteTimeDomainData(dataArray);
      let nextRms = 0;
      for (let i = 0; i < dataArray.length; i++) { const v = (dataArray[i] - 128) / 128; nextRms += v * v; }
      vadRef.current!.rafId = requestAnimationFrame(() => detect(Math.sqrt(nextRms / dataArray.length), threshold));
    }
    calibrate();
  }

  function stopRecorderWithCb(cb: () => void) {
    recorderActiveRef.current = false;
    const r = recorderRef.current;
    if (r && r.state !== "inactive") {
      r.onstop = () => { recorderRef.current = null; cb(); };
      try { r.stop(); } catch { recorderRef.current = null; cb(); }
    } else { recorderRef.current = null; cb(); }
  }

  function stopRecorder() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch {}
    }
    recorderRef.current = null;
    recorderActiveRef.current = false;
  }

  function stopVAD() {
    if (vadRef.current) {
      if (vadRef.current.rafId) cancelAnimationFrame(vadRef.current.rafId);
      vadRef.current = null;
    }
    stopRecorder();
  }

  function onSpeechDetected(text: string) {
    if (!shouldListenRef.current || !mountedRef.current) return;
    const cleaned = text.trim().toLowerCase().replace(/[.,!?;:]+$/, "");
    if (cleaned.length < 3 || /^(gracias|muchas gracias|thank you|thanks|adiós|sí|no|ok|vale|hey|ah|mm|mhm|uh|eh|hmm|mmm|ajá|okay)$/i.test(cleaned)) {
      resetAndListen();
      return;
    }
    shouldListenRef.current = true;
    stopRecognition();
    stopVAD();
    const turnId = ++turnIdRef.current;
    setCallMode("processing");
    setStatusText("Pensando");
    doAIRef.current?.(text).finally(() => {
      if (mountedRef.current && turnId === turnIdRef.current) {
      }
    });
  }

  function onAudioBlob(blob: Blob) {
    if (!mountedRef.current || modeRef.current === "ended" || modeRef.current === "error") return;
    if (Date.now() < nextListenAtRef.current || blob.size < 1500) {
      resetAndListen();
      return;
    }
    setCallMode("processing");
    setStatusText("Procesando");
    const turnId = ++turnIdRef.current;
    stopVAD();
    sttAudio(blob).then(text => {
      if (!mountedRef.current || turnId !== turnIdRef.current) return;
      const cleaned = text.trim().toLowerCase().replace(/[.,!?;:]+$/, "");
      if (cleaned && cleaned.length >= 3 && !/^(gracias|muchas gracias|thank you|thanks|adiós|sí|no|ok|vale|hey|ah|mm|mhm|uh|eh|hmm|mmm|ajá|okay)$/i.test(cleaned)) {
        doAIRef.current?.(text);
      } else {
        resetAndListen();
      }
    }).catch(() => {
      if (mountedRef.current && turnId === turnIdRef.current) resetAndListen();
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
      const updated = [...currentHistory, { role: "user" as const, content: text }, replyMessage];
      messagesRef.current = updated;
      if (subtitlesOn) setSubtitleText(reply);
      speakTTS(reply);
      saveConversationHistory(girl.id, updated);
      const extracted = extractMemoryFromMessages(updated);
      if (extracted.length > 0) {
        const existing = getUserMemory(girl.id);
        const merged = [...new Map([...existing, ...extracted].map(m => [m, m])).values()];
        saveUserMemory(girl.id, merged.slice(-30));
      }
      if (updated.length > 20) {
        const sum = buildSummary(updated);
        if (sum) saveConversationSummary(girl.id, sum);
      }
      return reply;
    } catch (err: any) {
      console.warn("[CALL] AI error:", err);
      if (!mountedRef.current) return;
      const fallback = getFallbackResponse(text);
      const replyMessage: ChatMessage = { role: "assistant", content: fallback };
      const updated = [...currentHistory, { role: "user" as const, content: text }, replyMessage];
      messagesRef.current = updated;
      if (subtitlesOn) setSubtitleText(fallback);
      speakTTS(fallback);
      saveConversationHistory(girl.id, updated);
      return fallback;
    }
  }, [girl, custom, subtitlesOn]);

  doAIRef.current = doAI;

  async function startCall() {
    setupAudioElement();
    const stream = await acquireMic();
    if (!stream || !mountedRef.current) {
      if (!stream) setCallMode("error");
      return;
    }
    streamRef.current = stream;
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    connectMicAnalyser(stream);
    connectOutputAnalyser();
    const greeting = `Hola, soy ${girl.name}. ¿Cómo estás?`;
    const greetingMsg: ChatMessage = { role: "assistant", content: greeting };
    messagesRef.current = [greetingMsg];
    await speakTTS(greeting, true);
    if (!mountedRef.current) return;
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
  }

  function hangUp(redirectToChat = false, dur?: number) {
    setFadeOut(true);
    setTimeout(() => {
      if (!mountedRef.current) return;
      cleanup();
      setCallMode("ended");
      const msgs = messagesRef.current;
      if (msgs.length > 0) saveToHistory(girl.id, girl.name, msgs);
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      if (redirectToChat) {
        const durParam = dur ? `?callDur=${dur}` : "";
        router.replace(`${base}/chat/${girl.id}${durParam}`);
      } else {
        router.replace(`${base}/chat/${girl.id}`);
      }
    }, 0);
  }

  function toggleMute() {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      if (audioRef.current) audioRef.current.volume = 0;
      const track = streamRef.current?.getAudioTracks()[0];
      if (track) track.enabled = false;
      stopRecognition();
      stopVAD();
    } else {
      const track = streamRef.current?.getAudioTracks()[0];
      if (track) track.enabled = true;
      if (audioRef.current) audioRef.current.volume = 1;
      if (modeRef.current === "listening") startListening();
    }
  }

  async function toggleVideo() {
    if (isVideoOn) {
      releaseVideo();
      setIsVideoOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        const track = stream.getVideoTracks()[0];
        if (!track || track.readyState === "ended") { stream.getTracks().forEach(t => t.stop()); return; }
        videoStreamRef.current = stream;
        setIsVideoOn(true);
      } catch {}
    }
  }

  function sendTextMessage() {
    const text = textInput.trim();
    if (!text || shouldListenRef.current || modeRef.current === "ended" || modeRef.current === "error") return;
    setTextInput("");
    setShowTextInput(false);
    shouldListenRef.current = true;
    stopRecognition();
    stopVAD();
    speechBufferRef.current = "";
    finalTranscriptRef.current = "";
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    setCallMode("processing");
    setStatusText("Pensando");
    doAIRef.current?.(text);
  }

  async function switchMic(deviceId: string) {
    if (isSwitchingMic || !deviceId || deviceId === selectedMic) return;
    stopRecognition();
    stopVAD();
    setIsSwitchingMic(true);
    setMicStatus("");
    const oldStream = streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
      });
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      const track = stream.getAudioTracks()[0];
      if (!track || track.readyState === "ended") throw new Error("track invalid");
      disconnectAnalyser();
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();
      connectMicAnalyser(stream);
      if (oldStream) oldStream.getTracks().forEach(t => t.stop());
      streamRef.current = stream;
      setSelectedMic(deviceId);
      setMicStatus(`Micrófono cambiado a ${(track.label.replace(/\(.*?\)/g, "").trim() || "nuevo")}`);
      setTimeout(() => setMicStatus(""), 1800);
      if (mountedRef.current && modeRef.current !== "ended") {
        setCallMode("listening");
        startListening();
      }
    } catch (e) {
      console.error("[CALL] mic switch failed", e);
      setMicStatus("No se pudo cambiar el micrófono");
      setTimeout(() => setMicStatus(""), 2000);
      if (oldStream && mountedRef.current) {
        streamRef.current = oldStream;
        disconnectAnalyser();
        if (audioCtxRef.current) {
          connectMicAnalyser(oldStream);
        }
        if (modeRef.current !== "ended") startListening();
      }
    }
    setIsSwitchingMic(false);
  }

  async function switchSpeaker(deviceId: string) {
    const el = audioRef.current;
    if (!el || typeof el.setSinkId !== "function") return;
    setSpeakerStatus("");
    try {
      await el.setSinkId(deviceId);
      if (el.sinkId === deviceId) {
        setSelectedSpeaker(deviceId);
        const device = speakerDevices.find(d => d.deviceId === deviceId);
        setSpeakerStatus(`Audio cambiado a ${(device?.label.replace(/\(.*?\)/g, "").trim() || "nuevo")}`);
        setTimeout(() => setSpeakerStatus(""), 1800);
      }
    } catch {
      setSpeakerStatus("No se pudo cambiar la salida");
      setTimeout(() => setSpeakerStatus(""), 2000);
    }
  }

  async function testMic() {
    if (isTestingMic || !micAnalyserRef.current) return;
    setIsTestingMic(true);
    setTestResult("");
    let peak = 0, count = 0, sum = 0;
    const dataArray = new Uint8Array(micAnalyserRef.current.fftSize);
    const startTime = Date.now();
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (!micAnalyserRef.current || !mountedRef.current) { clearInterval(interval); resolve(); return; }
        setMicLevel(Math.max(0, 3 - Math.floor((Date.now() - startTime) / 1000)));
        micAnalyserRef.current.getByteTimeDomainData(dataArray);
        let rms = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          rms += v * v;
        }
        const level = Math.sqrt(rms / dataArray.length);
        peak = Math.max(peak, level);
        sum += level;
        count++;
      }, 80);
      setTimeout(() => { clearInterval(interval); resolve(); }, 3000);
    });
    setMicLevel(0);
    if (peak > 0.15) setTestResult("El micrófono funciona correctamente.");
    else if (peak > 0.05) setTestResult("El nivel del micrófono es muy bajo.");
    else setTestResult("No estamos recibiendo sonido.");
    setIsTestingMic(false);
  }

  function cleanup() {
    shouldListenRef.current = false;
    stopRecognition();
    stopVAD();
    releaseMic();
    releaseVideo();
    speechBufferRef.current = "";
    finalTranscriptRef.current = "";
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    disconnectAnalyser();
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    stopRingback();
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setupAudioElement();
    audioCtxRef.current = new AudioContext();
    let outputData = new Uint8Array(512);
    let micData = new Uint8Array(512);
    let noiseFloor = 0, noiseCount = 0, phase = 0, raf = 0;
    function animate() {
      if (!mountedRef.current) return;
      const m = modeRef.current;
      if (m === "dialing") {
        setRingScale(1);
        setRingOpacity(0.25);
        raf = requestAnimationFrame(animate);
        return;
      }
      if (m === "processing") {
        setRingScale(1);
        setRingOpacity(0.15);
        raf = requestAnimationFrame(animate);
        return;
      }
      if (m === "greeting" || m === "speaking") {
        if (outputAnalyserRef.current) {
          outputAnalyserRef.current.getByteTimeDomainData(outputData);
          let rms = 0;
          for (let i = 0; i < outputData.length; i++) {
            const v = (outputData[i] - 128) / 128;
            rms += v * v;
          }
          const level = Math.min(1, Math.sqrt(rms / outputData.length) / 0.25);
          const ts = 1 + 0.035 * level;
          const to = 0.35 + 0.3 * level;
          setRingScale(prev => prev + (ts - prev) * 0.15);
          setRingOpacity(prev => prev + (to - prev) * 0.15);
        } else {
          setRingScale(1 + 0.0175 * Math.sin(phase));
          setRingOpacity(0.5 + 0.15 * Math.sin(phase));
          phase += 0.045;
        }
        raf = requestAnimationFrame(animate);
        return;
      }
      if (m === "listening") {
        if (!mutedRef.current && micAnalyserRef.current) {
          micAnalyserRef.current.getByteTimeDomainData(micData);
          let rms = 0;
          for (let i = 0; i < micData.length; i++) {
            const v = (micData[i] - 128) / 128;
            rms += v * v;
          }
          const level = Math.sqrt(rms / micData.length);
          if (noiseCount < 30 && level < 0.04) {
            noiseFloor += (level - noiseFloor) / (noiseCount + 1);
            noiseCount++;
          }
          const threshold = Math.max(1.5 * noiseFloor, 0.006);
          const adjusted = Math.min(1, Math.max(0, (level - threshold) / 0.12));
          setMicLevel(adjusted);
          const ts = 1 + 0.025 * adjusted;
          const to = 0.2 + 0.3 * adjusted;
          setRingScale(prev => prev + (ts - prev) * 0.12);
          setRingOpacity(prev => prev + (to - prev) * 0.12);
        } else {
          setRingScale(1 + 0.005 * Math.sin(phase));
          setRingOpacity(0.25 + 0.04 * Math.sin(phase));
          phase += 0.01;
        }
        raf = requestAnimationFrame(animate);
        return;
      }
      raf = requestAnimationFrame(animate);
    }
    animFrameRef.current = raf;
    requestAnimationFrame(animate);
    const resumeAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };
    document.addEventListener("touchstart", resumeAudio);
    document.addEventListener("touchend", resumeAudio);
    document.addEventListener("click", resumeAudio);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("touchstart", resumeAudio);
      document.removeEventListener("touchend", resumeAudio);
      document.removeEventListener("click", resumeAudio);
    };
  }, []);

  const isCallActive = mode === "listening" || mode === "processing" || mode === "speaking" || mode === "greeting";
  const isDialing = mode === "dialing";

  // Styles
  const containerStyle: React.CSSProperties = {
    position: "fixed", inset: 0, paddingTop: 60, zIndex: 9999, overflow: "hidden",
    background: "#08050a", overscrollBehavior: "none", touchAction: "manipulation",
    fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Arial,sans-serif",
    WebkitUserSelect: "none", userSelect: "none",
    display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: "100dvh",
    opacity: fadeOut ? 0 : 1, transition: "opacity 0.2s ease",
  };

  const blurBgStyle: React.CSSProperties = {
    position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)",
    objectFit: "cover", objectPosition: "center 30%",
    filter: "blur(48px) brightness(0.28) saturate(0.7)",
    transform: "scale(1.15)", opacity: 0.5, pointerEvents: "none",
  };

  const gradientOverlayStyle: React.CSSProperties = {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, rgba(20,5,15,0.4) 0%, rgba(8,4,12,0.85) 100%)",
    pointerEvents: "none",
  };

  const radialGlowStyle: React.CSSProperties = {
    position: "absolute", top: "45%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(70vw, 320px)", height: "min(70vw, 320px)",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(180,50,100,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const centerStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    zIndex: 1, transform: "translateY(-14px)", minHeight: 0, padding: "0 24px",
  };

  const avatarWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "min(180px, calc(100vw - 200px), 184px)",
    height: "min(180px, calc(100vw - 200px), 184px)",
    flexShrink: 0,
  };

  const ringStyle: React.CSSProperties = {
    position: "absolute", inset: -7, borderRadius: "50%",
    border: "1px solid rgba(180,50,100,0.18)",
    transform: `scale(${ringScale})`, opacity: ringOpacity,
    pointerEvents: "none",
    transition: "transform 0.3s ease, opacity 0.3s ease",
  };

  const avatarImgStyle: React.CSSProperties = {
    width: "100%", height: "100%", borderRadius: "50%",
    objectFit: "cover", objectPosition: "center",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  const nameStyle: React.CSSProperties = {
    marginTop: 22,
    fontSize: "clamp(36px, 9vw, 42px)", fontWeight: 650, lineHeight: 1,
    color: "rgba(255,255,255,0.97)", textAlign: "center",
  };

  const statusStyle: React.CSSProperties = {
    marginTop: 13, fontSize: 17, fontWeight: 400,
    color: "rgba(255,255,255,0.68)", textAlign: "center",
    lineHeight: 1.25, height: 22,
    transition: "opacity 0.18s ease",
  };

  const durationStyle: React.CSSProperties = {
    marginTop: 3, fontSize: 14, fontWeight: 400,
    color: "rgba(255,255,255,0.42)",
    fontVariantNumeric: "tabular-nums", textAlign: "center",
    lineHeight: 1.2, height: 18,
    visibility: isCallActive ? "visible" : "hidden",
  };

  const bottomGridStyle: React.CSSProperties = {
    width: "min(382px, calc(100vw - 32px))",
    marginInline: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    rowGap: 24, columnGap: 16,
    justifyItems: "center", alignItems: "start",
    zIndex: 2,
    paddingTop: 56,
    paddingBottom: showDevicePanel
      ? "calc(env(safe-area-inset-bottom) + 24px)"
      : "max(calc(env(safe-area-inset-bottom) + 24px), 60px)",
  };

  // Button style factories
  function ctrlBtn(active: boolean): React.CSSProperties {
    return {
      width: 68, height: 68, borderRadius: "50%",
      background: active ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.09)",
      border: "1px solid rgba(255,255,255,0.10)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      color: active ? "rgba(20,16,22,0.96)" : "rgba(255,255,255,0.92)",
      backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
      transition: "transform 140ms ease, background-color 160ms ease, color 160ms ease",
      WebkitTapHighlightColor: "transparent",
    };
  }

  const btnLabelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1,
  };

  const redBtnStyle: React.CSSProperties = {
    width: 74, height: 74, borderRadius: "50%", background: "#ff453a",
    border: 0, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: fadeOut ? 0.4 : 1,
    boxShadow: "0 0 20px rgba(255,69,58,0.25)",
    transition: "transform 140ms ease, opacity 0.15s ease",
    WebkitTapHighlightColor: "transparent",
  };

  const cancelBtnStyle: React.CSSProperties = {
    gridColumn: 2, gridRow: 2,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    background: "none", border: 0, cursor: "pointer", padding: 0,
    WebkitTapHighlightColor: "transparent",
  };

  // Get status text
  function getStatusText() {
    if (isDialing) return `Llamando${".".repeat(Math.floor(Date.now() / 500) % 4)}`;
    if (mode === "greeting" || mode === "speaking") return "Hablando";
    if (mode === "processing") return "Pensando";
    if (isMuted && mode === "listening") return "Micrófono silenciado";
    if (mode === "listening") return "Escuchando";
    return "Conectando";
  }

  return (
    <>
      <style>{'div[style*="z-index:9999"]{padding-top:60px!important}'}</style>
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <script dangerouslySetInnerHTML={{ __html: `window.__voiceId="${voiceIdMap[girl.id] || `female-${girl.id}`}"` }} />

      <div style={containerStyle}>
        {img && <img src={img} alt="" style={blurBgStyle} />}
        <div style={gradientOverlayStyle} />
        <div style={radialGlowStyle} />

        {/* Center content */}
        <div style={centerStyle}>
          <div style={avatarWrapperStyle}>
            <div style={ringStyle} />
            {img ? (
              <img src={img} alt={girl.name} style={avatarImgStyle} />
            ) : (
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(135deg,#ff4c98,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 48, fontWeight: 700, color: "#f7f7f8",
              }}>
                {girl.name[0]}
              </div>
            )}
          </div>
          <div style={nameStyle}>{girl.name}</div>
          <div style={statusStyle}>{getStatusText()}</div>
          <div style={durationStyle}>{formatDuration(callDuration)}</div>
        </div>

        {/* Bottom buttons */}
        <div style={bottomGridStyle}>
          {isDialing ? (
            <button
              onClick={() => hangUp(false)}
              aria-label="Cancelar llamada"
              style={cancelBtnStyle}
            >
              <div style={{
                width: 74, height: 74, borderRadius: "50%", background: "#ff453a",
                border: 0, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(255,69,58,0.25)",
              }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 450, color: "rgba(255,255,255,0.70)", lineHeight: 1 }}>Cancelar</span>
            </button>
          ) : (
            <>
              {/* Audio toggle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setShowDevicePanel(v => !v)}
                  aria-label="Configurar audio"
                  aria-pressed={showDevicePanel}
                  style={ctrlBtn(showDevicePanel)}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
                <span style={btnLabelStyle}>Audio</span>
              </div>

              {/* Video toggle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={toggleVideo}
                  aria-label={isVideoOn ? "Cerrar video" : "Activar video"}
                  aria-pressed={isVideoOn}
                  style={ctrlBtn(isVideoOn)}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {isVideoOn ? (
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
                </button>
                <span style={btnLabelStyle}>{isVideoOn ? "Cerrar video" : "Video"}</span>
              </div>

              {/* Mute toggle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
                  aria-pressed={isMuted}
                  style={ctrlBtn(isMuted)}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {isMuted ? (
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
                <span style={btnLabelStyle}>{isMuted ? "Activar" : "Silenciar"}</span>
              </div>

              {/* Subtitles */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setSubtitlesOn(v => !v)}
                  aria-label={subtitlesOn ? "Desactivar subtítulos" : "Activar subtítulos"}
                  aria-pressed={subtitlesOn}
                  style={ctrlBtn(subtitlesOn)}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
                    <path d="M9 10a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-4z" />
                    <path d="M15 10a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H16a1 1 0 0 1-1-1v-4z" />
                  </svg>
                </button>
                <span style={btnLabelStyle}>Subtítulos</span>
              </div>

              {/* End call */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => hangUp(false)}
                  aria-label="Finalizar llamada"
                  disabled={fadeOut}
                  style={{
                    ...redBtnStyle,
                    cursor: fadeOut ? "default" : "pointer",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </button>
                <span style={btnLabelStyle}>Finalizar</span>
              </div>

              {/* Chat */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => hangUp(true, callDuration)}
                  aria-label="Ir al chat"
                  style={ctrlBtn(false)}
                >
                  <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <span style={btnLabelStyle}>Chat</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Text input panel */}
      {showTextInput && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20,
          padding: "12px 16px",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
          background: "rgba(12,9,14,0.92)",
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              ref={inputRef}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && textInput.trim()) sendTextMessage(); }}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1, height: 44, borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)", color: "#fff",
                fontSize: 16, padding: "0 14px", outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={sendTextMessage}
              style={{
                width: 44, height: 44, borderRadius: 12, border: 0,
                background: "#ff2d95", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Subtitles overlay */}
      {subtitlesOn && subtitleText && isCallActive && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          display: "flex", justifyContent: "center",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 260px)",
          zIndex: 5, pointerEvents: "none",
        }}>
          <div style={{
            maxWidth: "min(330px, calc(100vw - 38px))",
            padding: "11px 15px", borderRadius: 15,
            background: "rgba(12,9,14,0.74)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            fontSize: 15, lineHeight: 1.4, color: "rgba(255,255,255,0.92)",
            textAlign: "center", maxHeight: 66, overflow: "hidden",
          }}>
            {subtitleText}
          </div>
        </div>
      )}

      {/* Video PIP */}
      {isVideoOn && (
        <div style={{
          position: "fixed", top: "calc(env(safe-area-inset-top) + 72px)",
          right: 16, width: 92, height: 126, borderRadius: 18,
          overflow: "hidden", zIndex: 10, background: "#000",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}>
          <video
            ref={el => { if (el && videoStreamRef.current && !el.srcObject) { el.srcObject = videoStreamRef.current; el.play().catch(() => {}); } }}
            autoPlay playsInline muted
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
          />
        </div>
      )}

      {/* Device settings panel */}
      {showDevicePanel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000 }} onClick={() => setShowDevicePanel(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "absolute", left: 10, right: 10,
            bottom: "calc(env(safe-area-inset-bottom) + 10px)",
            maxHeight: "68dvh", borderRadius: "32px 32px 26px 26px",
            background: "rgba(18,14,21,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 18px 20px", overflowY: "auto",
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 650, color: "#F7F7F8" }}>Audio de la llamada</div>
              <button onClick={() => setShowDevicePanel(false)} style={{
                width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(247,247,248,0.6)" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Mic section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(247,247,248,0.5)", marginBottom: 6 }}>Micrófono</div>
              {micStatus && <div style={{ fontSize: 12, color: micStatus.includes("cambiado") ? "#4ade80" : "#ff6b6b", padding: "4px 0 6px" }}>{micStatus}</div>}
              {micDevices.length === 0 ? (
                <div style={{ fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0" }}>No se encontraron micrófonos</div>
              ) : (
                micDevices.map(d => (
                  <button key={d.deviceId} onClick={() => switchMic(d.deviceId)} disabled={isSwitchingMic} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", height: 54,
                    padding: "0 12px", borderRadius: 16, border: 0,
                    cursor: isSwitchingMic ? "default" : "pointer",
                    background: d.deviceId === selectedMic ? "rgba(255,55,145,0.10)" : "transparent",
                    color: d.deviceId === selectedMic ? "#fff" : "rgba(247,247,248,0.72)",
                    fontSize: 13, fontWeight: 500, textAlign: "left",
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                    </svg>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.label.replace(/\(.*?\)/g, "").trim() || "Micrófono"}
                    </span>
                    {isSwitchingMic && d.deviceId !== selectedMic ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        border: "2px solid rgba(255,87,152,0.3)", borderTopColor: "#FF5798",
                        animation: "sp 0.6s linear infinite",
                      }} />
                    ) : d.deviceId === selectedMic ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF5798" stroke="none">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" />
                      </svg>
                    ) : null}
                  </button>
                ))
              )}
              {/* Mic level bar */}
              <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, micLevel * 100)}%`, background: "#FF5798", borderRadius: 2, transition: "width 0.08s linear" }} />
              </div>
              {isMuted ? (
                <div style={{ marginTop: 10, fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0", textAlign: "center" }}>
                  Activa el micrófono para probarlo
                </div>
              ) : (
                <button onClick={testMic} disabled={isTestingMic} style={{
                  marginTop: 10, padding: "8px 16px", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                  color: "#F7F7F8", fontSize: 13, fontWeight: 500,
                  cursor: isTestingMic ? "default" : "pointer", width: "100%",
                }}>
                  {isTestingMic ? `Probando micrófono... ${micLevel}` : "Probar micrófono"}
                </button>
              )}
              {testResult && (
                <div style={{
                  fontSize: 12,
                  color: testResult.includes("correctamente") ? "#4ade80" :
                         testResult.includes("bajo") || testResult.includes("Activa") ? "#f59e0b" : "#ff6b6b",
                  padding: "6px 0 0", textAlign: "center",
                }}>
                  {testResult}
                </div>
              )}
            </div>

            {/* Speaker section */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(247,247,248,0.5)", marginBottom: 6 }}>Salida de audio</div>
              {speakerStatus && <div style={{ fontSize: 12, color: speakerStatus.includes("cambiado") ? "#4ade80" : "#ff6b6b", padding: "4px 0 6px" }}>{speakerStatus}</div>}
              {canSetSinkId ? (
                speakerDevices.length === 0 ? (
                  <div style={{ fontSize: 13, color: "rgba(247,247,248,0.4)", padding: "8px 0" }}>No se encontraron dispositivos de salida</div>
                ) : (
                  speakerDevices.map(d => (
                    <button key={d.deviceId} onClick={() => switchSpeaker(d.deviceId)} style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%", height: 54,
                      padding: "0 12px", borderRadius: 16, border: 0, cursor: "pointer",
                      background: d.deviceId === selectedSpeaker ? "rgba(255,55,145,0.10)" : "transparent",
                      color: d.deviceId === selectedSpeaker ? "#fff" : "rgba(247,247,248,0.72)",
                      fontSize: 13, fontWeight: 500, textAlign: "left",
                    }}>
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
      {mode === "error" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(6,4,8,0.6)",
        }}>
          <div style={{
            background: "rgba(18,14,21,0.92)", backdropFilter: "blur(24px)",
            padding: "28px 24px", borderRadius: 20, margin: "0 24px",
            maxWidth: 320, border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#F7F7F8" }}>
              {errorMessage || "Se ha producido un error."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => { setFadeOut(true); setTimeout(() => router.back(), 0); }} style={{
                padding: "10px 24px", borderRadius: 999, border: 0,
                background: "rgba(255,255,255,0.1)", color: "#F7F7F8",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation for device switch */}
      <style dangerouslySetInnerHTML={{ __html: "@keyframes sp{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}" }} />
      <script dangerouslySetInnerHTML={{ __html: `addEventListener("DOMContentLoaded",function(){var e=document.querySelector('[style*="z-index:9999"]');if(e){e.style.setProperty("padding-top","60px","important");var t=new MutationObserver(function(){e.style.setProperty("padding-top","60px","important")});t.observe(e,{attributes:true,attributeFilter:["style"]})}})` }} />
    </>
  );
}
