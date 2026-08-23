"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ttsText, getGirlVoice, unlockAudioGesture } from "@/lib/voiceClient";

const APPLE_SPRING = "cubic-bezier(.32,.72,0,1)";

// Ventanas (segundos del video) en las que Sofía puede hablar
const SPEAK_LAG = 1.2; // ella dice las frases un pelín más tarde
const SOFIA_WINDOWS: Array<[number, number]> = [
  [10.96, 14],
  [14.27, 23.75],
  [30.61, 31.85],
  [40.67, 42.3],
  [55.67, 56.16],
];
const KIRA_WINDOWS: Array<[number, number]> = [
  [8, 11.5],
  [17.5, 21],
  [27.5, 30.5],
  [40.5, 43.5],
  [52, 55],
];

const REPLIES_TINY = ["Uff sí...", "Dale, papi...", "Qué rico...", "Mmm guapo...", "No pares...", "Sí, sígue"];
const REPLIES_SHORT = [
  "Me encantas, no dejo de pensarte",
  "Si estuvieras aquí no te dejaba ir",
  "Tu mensaje me ha puesto malpensada",
  "Hablar contigo me pone a mil",
];
const REPLIES_MED = [
  "Me encanta que me hables así... si ahora mismo estuvieras aquí te haría cosas muy malas",
  "Estoy sola en casa y tú me dices eso... qué quieres que haga yo contigo",
  "Cada vez que me escribes siento un cosquilleo... no sabes lo que me provocas",
];
const REPLIES_LONG = [
  "Uff cariño... me encanta cuando me hablas así, me pongo tan caliente que tengo que morderme el labio... sigue y verás qué hago después en privado",
  "Sabes que eres peligroso para mí... me dices esas cosas y ya estoy imaginando esta noche contigo, sin ropa y sin prisa... cuéntame más",
];

const FAKE_USERS: Array<[string, string]> = [
  ["carlos_87", "Ese cuerpo me vuelve loco 😈"],
  ["Luna", "Qué rica estás 🔥"],
  ["edu", "Me pones a mil ❤️‍🔥"],
  ["ana2026", "Quiero hacer cosas contigo 😈"],
  ["Mari 🧡", "La más sexy que he visto 🥵"],
  ["tiktok_fan", "Ese outfit es pura tentación 🔥"],
  ["marco10", "Vente a México y nos divertimos 😏"],
  ["sofiafans", "Modo caliente activado 😏🔥"],
  ["julian", "Entré a tu live y no puedo dejar de mirarte 🥵"],
  ["valen_", "Eres pura tentación 🌸😈"],
];

const HEART_EMOJIS = ["❤️", "💖", "💕", "🥰", "💗"];
const GIFT_EMOJIS = ["🌹", "🎁", "💎", "🔥", "🍩", "💘"];

let uid = 0;
const nextId = () => ++uid;

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")}K` : `${n}`);

interface Heart {
  id: number;
  x: number;
  sway: number;
  emoji: string;
  delay: number;
}
interface TtComment {
  id: number;
  user: string;
  text: string;
}
interface GiftPop {
  id: number;
  emoji: string;
  x: number;
}

export default function StoryVideoViewer({
  videoSrc,
  avatar,
  name,
  girlId,
  onClose,
}: {
  videoSrc: string;
  avatar: string;
  name: string;
  girlId?: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const scrollYRef = useRef(0);
  const replyAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const replyDataRef = useRef<{ text: string; url: string } | null>(null);
  const pendingReplyRef = useRef<string | null>(null);
  const autoUsedRef = useRef<Set<number>>(new Set());
  const ttsCtxRef = useRef<AudioContext | null>(null);
  const ttsGainRef = useRef<GainNode | null>(null);
  const prefetchRef = useRef<{ text: string; url: string }[]>([]);

  const [closing, setClosing] = useState(false);
  const [likes, setLikes] = useState(3421);
  const [viewers, setViewers] = useState(1247);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [comments, setComments] = useState<TtComment[]>([]);
  const [gifts, setGifts] = useState<GiftPop[]>([]);
  const [warmFilter, setWarmFilter] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [userComments, setUserComments] = useState<{ id: number; text: string }[]>([]);
  const [sofiaComments, setSofiaComments] = useState<{ id: number; text: string }[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [buffering, setBuffering] = useState(true);

  // El video va SIN audio (solo se oye la voz TTS de ella, amplificada).
  // El audio de la página ya quedó desbloqueado por el toque que abrió el directo
  // (unlockAudioGesture en StoriesRow). Esto es solo respaldo por si entró directo.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
    const onFirstTap = () => { unlockAudioGesture(); };
    window.addEventListener("pointerdown", onFirstTap);
    window.addEventListener("touchstart", onFirstTap);
    return () => {
      window.removeEventListener("pointerdown", onFirstTap);
      window.removeEventListener("touchstart", onFirstTap);
    };
  }, []);

  // Música ambiental de fondo: suave, en loop, y baja aún más cuando ella habla
  useEffect(() => {
    const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const b = new Audio(`${bp}/sofia-ambiente.mp3`);
    b.loop = true;
    b.volume = 0.25;
    bgmRef.current = b;
    const tryPlay = () => { if (b.paused) b.play().catch(() => {}); };
    tryPlay();
    window.addEventListener("pointerdown", tryPlay);
    window.addEventListener("touchstart", tryPlay);
    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      try { b.pause(); } catch {}
      bgmRef.current = null;
    };
  }, []);

  // Ventanas de habla según la chica del directo
  const speakWindows = girlId === "kira" ? KIRA_WINDOWS : SOFIA_WINDOWS;

  // Precarga de las 5 frases de las ventanas: al abrirse la ventana suenan AL INSTANTE
  useEffect(() => {
    let alive = true;
    speakWindows.forEach(([a, b], i) => {
      const line = pickReply(b - a);
      ttsText(line, getGirlVoice(girlId || "luna"))
        .then((r) => { if (alive) prefetchRef.current[i] = { text: line, url: `data:audio/mp3;base64,${r.audio}` }; })
        .catch(() => {});
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    scrollYRef.current = window.scrollY;
    const b = document.body;
    const h = document.documentElement;
    const origB = { position: b.style.position, top: b.style.top, overflow: b.style.overflow };
    const origH = { overflow: h.style.overflow };
    h.style.overflow = "hidden";
    b.style.position = "fixed";
    b.style.top = `-${scrollYRef.current}px`;
    b.style.overflow = "hidden";
    return () => {
      mountedRef.current = false;
      b.style.position = origB.position;
      b.style.top = origB.top;
      b.style.overflow = origB.overflow;
      h.style.overflow = origH.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, []);

  useEffect(() => {
    const spawnComment = () => {
      if (!mountedRef.current) return;
      const [user, text] = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      const id = nextId();
      setComments((c) => [...c.slice(-3), { id, user, text }]);
      setTimeout(() => {
        if (mountedRef.current) setComments((c) => c.filter((k) => k.id !== id));
      }, 6800);
    };
    const t1 = setInterval(spawnComment, 2100);
    const t3 = setInterval(() => setViewers((v) => v + (Math.random() < 0.5 ? -1 : 1)), 4000);
    spawnComment();
    return () => {
      clearInterval(t1);
      clearInterval(t3);
    };
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    videoRef.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (replyAudioRef.current) {
      replyAudioRef.current.pause();
      replyAudioRef.current = null;
    }
    setTimeout(onClose, 280);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.currentTime >= 10 && !warmFilter) setWarmFilter(true);
  };

  const pickReply = (availSecs: number): string => {
    const budget = Math.floor(availSecs * 13);
    const pools = [REPLIES_LONG, REPLIES_MED, REPLIES_SHORT, REPLIES_TINY];
    for (const pool of pools) {
      const fits = pool.filter((t) => t.length <= budget);
      if (fits.length) return fits[Math.floor(Math.random() * fits.length)];
    }
    return "Hola";
  };

  const showSofiaReply = (text: string) => {
    const id = nextId();
    setSofiaComments((prev) => [...prev.slice(-4), { id, text }]);
    setTimeout(() => {
      if (mountedRef.current) setSofiaComments((prev) => prev.filter((c) => c.id !== id));
    }, 7000);
  };

  const duckVideo = () => {};

  const stopPrevVoice = () => {
    if (replyAudioRef.current) {
      try { replyAudioRef.current.pause(); } catch {}
      replyAudioRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const ensureAudioGain = (): { ctx: AudioContext | null; gain: GainNode | null } => {
    try {
      if (!ttsCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return { ctx: null, gain: null };
        ttsCtxRef.current = new Ctx();
        ttsGainRef.current = ttsCtxRef.current.createGain();
        ttsGainRef.current.gain.value = 2.5; // voz EN ALTO
        ttsGainRef.current.connect(ttsCtxRef.current.destination);
      }
      return { ctx: ttsCtxRef.current, gain: ttsGainRef.current };
    } catch {
      return { ctx: null, gain: null };
    }
  };

  // Reproduce SIEMPRE el nuevo mensaje: corta el anterior.
  // Cadena garantizada: audio TTS amplificado → si el navegador bloquea el play → voz del navegador.
  const duckBgm = (down: boolean) => {
    if (bgmRef.current) bgmRef.current.volume = down ? 0.1 : 0.25;
  };

  const synthSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 1.05;
    u.pitch = 1.1;
    u.volume = 1;
    u.onend = () => { duckBgm(false); };
    u.onerror = () => { duckBgm(false); };
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find((vv) => vv.lang.startsWith("es") && /femenin|female|paulina|monica|elena|conchita/i.test(vv.name)) || voices.find((vv) => vv.lang.startsWith("es"));
    if (female) u.voice = female;
    duckBgm(true);
    window.speechSynthesis.speak(u);
  };

  const playReplyAudio = (text: string) => {
    const entry = replyDataRef.current;
    replyDataRef.current = null;
    const data = entry && entry.text === text ? entry.url : null;
    duckVideo();
    stopPrevVoice();
    if (!data) { synthSpeak(text); return; }
    try {
      const au = new Audio(data);
      au.volume = 1;
      const g = ensureAudioGain();
      if (g.ctx && g.gain && g.ctx.state === "running") {
        try {
          const src = g.ctx.createMediaElementSource(au);
          src.connect(g.gain);
        } catch {}
      } else if (g.ctx && g.ctx.state === "suspended") {
        g.ctx.resume().catch(() => {});
      }
      let started = false;
      au.onended = () => { replyAudioRef.current = null; duckBgm(false); };
      au.onerror = () => { replyAudioRef.current = null; duckBgm(false); };
      duckBgm(true);
      replyAudioRef.current = au;
      au.play().then(() => { started = true; }).catch(() => {});
      // Si en 1.5s no ha empezado (autoplay bloqueado), voz del navegador como red de seguridad
      setTimeout(() => {
        if (!started) {
          try { au.pause(); } catch {}
          if (replyAudioRef.current === au) replyAudioRef.current = null;
          synthSpeak(text);
        }
      }, 1500);
    } catch {
      synthSpeak(text);
    }
  };

  // Motor único: en cada ventana del video Sofía dice algo.
  // Si hay respuesta pendiente del usuario, esa tiene prioridad; si no, frase caliente automática.
  useEffect(() => {
    let raf = 0;
    let lastT = -1;
    const tick = () => {
      const v = videoRef.current;
      if (!v || !mountedRef.current) return;
      const t = v.currentTime;
      if (t < lastT - 1) autoUsedRef.current.clear(); // el video dió la vuelta
      lastT = t;

      const idx = speakWindows.findIndex(([a, b]) => t >= a - 0.08 + SPEAK_LAG && t <= b + SPEAK_LAG);
      if (idx >= 0 && !autoUsedRef.current.has(idx)) {
        autoUsedRef.current.add(idx);
        const pendingText = pendingReplyRef.current;
        if (pendingText) {
          pendingReplyRef.current = null;
          showSofiaReply(pendingText);
          playReplyAudio(pendingText);
        } else {
          // Frase precargada de esta ventana: suena AL INSTANTE
          const pre = prefetchRef.current[idx];
          if (pre) {
            prefetchRef.current[idx] = null as unknown as { text: string; url: string };
            showSofiaReply(pre.text);
            replyDataRef.current = pre;
            playReplyAudio(pre.text);
          } else {
            const [a, b] = speakWindows[idx];
            const line = pickReply(b - a);
            showSofiaReply(line);
            // TTS en caliente: pide y reproduce en cuanto llegue
            ttsText(line, getGirlVoice(girlId || "luna"))
              .then((r) => { replyDataRef.current = { text: line, url: `data:audio/mp3;base64,${r.audio}` }; playReplyAudio(line); })
              .catch(() => { playReplyAudio(line); });
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleUserComment = () => {
    const text = userComment.trim();
    if (!text) return;
    const id = nextId();
    setUserComments((prev) => [...prev.slice(-4), { id, text }]);
    setUserComment("");
    const v = videoRef.current;
    const now = v ? v.currentTime : 0;
    let win: [number, number] | null = null;
    for (let i = 0; i < speakWindows.length; i++) {
      const w = speakWindows[i];
      if (w[0] + SPEAK_LAG > now + 0.2 && !autoUsedRef.current.has(i)) { win = w; break; }
    }
    if (!win) {
      // siguiente vuelta del bucle: libera todas las ventanas
      autoUsedRef.current.clear();
      win = speakWindows[0];
    }
    const replyText = pickReply(win[1] - win[0]);
    replyAudioRef.current = null;
    replyDataRef.current = null;
    ttsText(replyText, getGirlVoice(girlId || "luna"))
      .then((r) => { replyDataRef.current = { text: replyText, url: `data:audio/mp3;base64,${r.audio}` }; })
      .catch(() => { replyDataRef.current = null; });
    pendingReplyRef.current = replyText;
  };

  const spawnHearts = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const batch: Heart[] = Array.from({ length: 2 }, (_, i) => ({
      id: nextId(),
      x: Math.min(92, Math.max(6, x + (Math.random() * 18 - 9))),
      sway: Math.round(Math.random() * 34 - 17),
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      delay: i * 80,
    }));
    setHearts((h) => [...h.slice(-22), ...batch]);
    setLikes((l) => l + 1);
    setTimeout(() => setHearts((h) => h.filter((k) => !batch.some((n) => n.id === k.id))), 1650);
  };

  const spawnGift = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const g: GiftPop = {
      id: nextId(),
      emoji: GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)],
      x: 30 + Math.random() * 30,
    };
    setGifts((gs) => [...gs.slice(-4), g]);
    setTimeout(() => setGifts((gs) => gs.filter((k) => k.id !== g.id)), 2500);
  };

  const frame = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
        overscrollBehavior: "none",
        height: "100dvh",
        fontFamily: `-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif`,
        transition: `transform 280ms ${APPLE_SPRING}, opacity 240ms ease`,
        transform: closing ? "translate3d(0,105%,0)" : "translate3d(0,0,0)",
        opacity: closing ? 0 : 1,
      }}
    >
      <div
        ref={frameRef}
        className="story-video-frame"
        style={{
          position: "relative",
          width: "min(430px, calc(100vw - 0px))",
          height: "100dvh",
          minHeight: "100dvh",
          overflow: "hidden",
          background: "#000",
          borderRadius: 0,
          boxShadow: "0 20px 70px rgba(0,0,0,.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={spawnHearts}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onCanPlay={() => { setBuffering(false); const v = videoRef.current; if (v && v.paused && !closing) v.play().catch(() => {}); }}
          onLoadedMetadata={() => { const v = videoRef.current; if (v && v.paused && !closing) v.play().catch(() => {}); }}
          onStalled={() => { setBuffering(true); }}
          onPlaying={() => setBuffering(false)}
          onWaiting={() => setBuffering(true)}
          poster={videoSrc.replace(/\.mp4$/, "-poster.jpg")}
          className="story-video-media"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
            filter: warmFilter ? "sepia(0.28) saturate(1.4) brightness(1.06) hue-rotate(-8deg)" : "none",
            transition: "filter 1.5s ease",
          }}
        >
          {/* HEVC 1440p (Safari/móviles con HEVC) → VP9 1440p (Chrome/Android/Firefox) → H.264 respaldo */}
          <source src={videoSrc.replace(/\.mp4$/, "-hevc.mp4")} type='video/mp4; codecs="hvc1"' />
          <source src={videoSrc.replace(/\.mp4$/, "-vp9.webm")} type="video/webm" />
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Corazón de carga (igual que el de "Creando") */}
        {buffering && (
          <div style={{
            position: "absolute", zIndex: 14, inset: 0,
            display: "grid", placeItems: "center", pointerEvents: "none",
          }}>
            <div style={{ position: "relative", width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "rgba(255,87,152,.15)", filter: "blur(24px)",
                animation: "ttCreateGlow 2.6s ease-in-out infinite",
              }} />
              <svg
                width="40" height="40" viewBox="0 0 24 24" fill="#FF5798"
                style={{ animation: "ttCreateBeat 1.1s ease-in-out infinite", transformOrigin: "50% 50%" }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        )}

        <style>{`@keyframes ttCreateBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}@keyframes ttCreateGlow{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:.75;transform:scale(1.15)}}@keyframes ttGatePulse{0%{box-shadow:0 0 0 0 rgba(255,45,149,.55)}70%{box-shadow:0 0 0 26px rgba(255,45,149,0)}100%{box-shadow:0 0 0 0 rgba(255,45,149,0)}}`}</style>

        {/* Gradients */}
        <div style={{
          position: "absolute", zIndex: 5, inset: "0 0 auto", height: 165,
          background: "linear-gradient(to bottom,rgba(0,0,0,.62) 0%,rgba(0,0,0,.24) 55%,transparent 100%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", zIndex: 5, left: 0, right: 0, bottom: 0, height: 250,
          background: "linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.3) 45%,transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Avatar de perfil (sin @nombre) */}
        <div style={{
          position: "absolute", zIndex: 12,
          top: "calc(env(safe-area-inset-top,0px) + 10px)", left: 12,
          display: "flex", alignItems: "center",
        }} data-story-interactive>
          <span style={{ position: "relative", display: "flex", flex: "0 0 auto" }}>
            <span style={{ position: "absolute", inset: -2, borderRadius: "50%", background: "linear-gradient(135deg,#fe2c55,#ff8a00)" }} />
            <img src={avatar} alt="" style={{ position: "relative", width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #000" }} />
          </span>
        </div>

        {/* Close */}
        <button
          aria-label="Cerrar"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          style={{
            position: "absolute", zIndex: 45,
            top: "calc(env(safe-area-inset-top,0px) + 20px)", right: 10,
            width: 38, height: 38, display: "grid", placeItems: "center",
            border: 0, borderRadius: "50%", background: "rgba(22,22,22,.5)",
            color: "#fff", cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Bottom info - empty for clean look */}

        {/* Action rail */}
        <div style={{
          position: "absolute", zIndex: 12, right: 8, bottom: 96,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 15,
        }} data-story-interactive>
          <button
            aria-label="Me gusta"
            onClick={(e) => { e.stopPropagation(); spawnHearts({ clientX: e.clientX } as React.MouseEvent<HTMLDivElement>); }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}
          >
            <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(22,22,22,.45)", color: "#fff" }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M12 21s-6.7-4.35-9.33-8.11C.9 10.35 1.6 6.5 4.6 5.2 6.7 4.27 9 5.1 10.2 7l1.8 2.7L13.8 7c1.2-1.9 3.5-2.73 5.6-1.8 3 1.3 3.7 5.15 1.93 7.69C18.7 16.65 12 21 12 21z" />
              </svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>{fmt(likes)}</span>
          </button>

          {/* Botón chat (mismo icono que en videollamada): oculta/muestra el chat */}
          <button
            aria-label={showChat ? "Ocultar chat" : "Mostrar chat"}
            onClick={(e) => { e.stopPropagation(); setShowChat((v) => !v); }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}
          >
            <span style={{
              width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%",
              background: showChat ? "#e2183b" : "rgba(22,22,22,.45)", color: "#fff",
            }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>Chat</span>
          </button>

          <button
            aria-label="Regalar"
            onClick={(e) => spawnGift(e)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}
          >
            <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(22,22,22,.45)", color: "#fff" }}>
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
              </svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>Regalar</span>
          </button>

          <img src={avatar} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #fff", marginTop: 2 }} />
        </div>

        {/* Comentarios de Sofía: siempre visibles, aunque el chat esté oculto */}
        <div style={{
          position: "absolute", zIndex: 12, left: 14, right: 84, bottom: 132,
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
        }} data-story-interactive>
          {sofiaComments.map((c) => (
            <div key={c.id} className="tt-comment" style={{ display: "flex", alignItems: "center", gap: 7, maxWidth: "100%" }}>
              <img src={avatar} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #fff", flex: "0 0 auto" }} />
              <span style={{ background: "rgba(254,44,85,.6)", padding: "6px 12px", borderRadius: 16, fontSize: 13, color: "#fff", lineHeight: 1.35, backdropFilter: "blur(4px)", textShadow: "0 1px 1px rgba(0,0,0,.25)" }}>
                <b style={{ fontWeight: 700 }}>{name}</b>&nbsp; {c.text}
              </span>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div style={{
          position: "absolute", zIndex: 11, left: 14, right: 84, bottom: 80,
          display: showChat ? "flex" : "none",
          flexDirection: "column", alignItems: "flex-start", gap: 8,
        }} data-story-interactive>
          {comments.map((c) => (
            <div key={c.id} className="tt-comment" style={{ display: "flex", alignItems: "center", gap: 7, maxWidth: "100%" }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flex: "0 0 auto",
                display: "grid", placeItems: "center", color: "#fff",
                fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                background: "linear-gradient(135deg,#fe2c55,#ff8a00)",
              }}>
                {c.user[0]}
              </span>
              <span style={{ background: "rgba(22,22,22,.45)", padding: "5px 11px", borderRadius: 16, fontSize: 12.5, color: "#fff", lineHeight: 1.35, backdropFilter: "blur(4px)" }}>
                <b style={{ fontWeight: 600 }}>{c.user}</b>&nbsp; {c.text}
              </span>
            </div>
          ))}
          {userComments.map((c) => (
            <div key={c.id} className="tt-comment" style={{ display: "flex", alignItems: "center", gap: 7, maxWidth: "100%" }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flex: "0 0 auto",
                display: "grid", placeItems: "center", color: "#fff",
                fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                background: "linear-gradient(135deg,#fe2c55,#ff8a00)",
              }}>
                Tú
              </span>
              <span style={{ background: "rgba(22,22,22,.45)", padding: "5px 11px", borderRadius: 16, fontSize: 12.5, color: "#fff", lineHeight: 1.35, backdropFilter: "blur(4px)" }}>
                <b style={{ fontWeight: 600 }}>Tú</b>&nbsp; {c.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{
          position: "absolute", zIndex: 13, left: 14, right: 10,
          bottom: "max(12px, env(safe-area-inset-bottom,0px))",
          display: "flex", alignItems: "center", gap: 8,
        }} data-story-interactive>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 7,
            background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.28)",
            borderRadius: 22, padding: "8px 13px", color: "rgba(255,255,255,.88)",
            fontSize: 13, backdropFilter: "blur(8px)",
          }}>
            <input
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUserComment(); } }}
              placeholder="Escribe algo caliente a Sofía..."
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1, background: "transparent", border: 0, outline: "none",
                color: "#fff", fontSize: 13, fontFamily: "inherit",
              }}
            />
          </div>
          <button
            aria-label="Enviar"
            onClick={(e) => { e.stopPropagation(); handleUserComment(); }}
            style={{ width: 36, height: 36, flex: "0 0 auto", display: "grid", placeItems: "center", border: 0, borderRadius: "50%", background: "#e2183b", color: "#fff", cursor: "pointer" }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" style={{ transform: "rotate(15deg)" }}>
              <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
            </svg>
          </button>
        </div>

        {/* Hearts */}
        {hearts.map((h) => (
          <span
            key={h.id}
            className="tt-heart"
            style={{ left: `${h.x}%`, animationDelay: `${h.delay}ms`, "--sway": `${h.sway}px` } as React.CSSProperties}
          >
            {h.emoji}
          </span>
        ))}

        {/* Gifts */}
        {gifts.map((g) => (
          <span key={g.id} className="tt-gift" style={{ left: `${g.x}%` }}>
            {g.emoji}
          </span>
        ))}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(frame, document.body);
}