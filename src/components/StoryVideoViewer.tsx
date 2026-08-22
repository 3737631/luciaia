"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ttsText, getGirlVoice } from "@/lib/voiceClient";

const APPLE_SPRING = "cubic-bezier(.32,.72,0,1)";

// Ventanas (segundos del video) en las que Sofía puede hablar
const SPEAK_WINDOWS: Array<[number, number]> = [
  [10.96, 14],
  [14.27, 23.75],
  [30.61, 31.85],
  [40.67, 42.3],
  [55.67, 56.16],
];

const REPLIES_TINY = ["Hola...", "Sí...", "Guapo...", "Mmm... dale", "Aquí estoy", "Te veo"];
const REPLIES_SHORT = [
  "Hola cariño, qué alegría verte",
  "Me encanta que me escribas",
  "¿Qué tal guapo? Me haces sonreír",
  "Estoy aquí pensando en ti",
];
const REPLIES_MED = [
  "Hola precioso... sabes que escribirte mientras estoy en directo me pone muy contenta",
  "Qué bien que hayas entrado... estaba deseando que alguien como tú me escribiera",
  "Me pones nerviosa buena cuando me hablas así... no pares",
];
const REPLIES_LONG = [
  "Hola cariño... la verdad es que me hace muchísima ilusión que me escribas en directo, me encantaría que te quedaras un rato conmigo",
  "Sabes que cuando me escribes así se me dibuja una sonrisa imposible... cuéntame más sobre ti, quiero saberlo todo",
];

const FAKE_USERS: Array<[string, string]> = [
  ["carlos_87", "Hola Sofía!! ❤️"],
  ["Luna", "Qué hermosa eres 😍"],
  ["edu", "En vivooo 🔥"],
  ["ana2026", "Saludos desde Colombia 🇨🇴"],
  ["Mari 🧡", "Te quiero muchísimo 💕"],
  ["tiktok_fan", "Eres increíble 🌟"],
  ["marco10", "Besitos desde México 🇲🇽"],
  ["sofiafans", "Ese look te queda 💜"],
  ["julian", "Primera vez en tu live 🔥"],
  ["valen_", "Eres mi favorita 🌸"],
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
  const replyDataRef = useRef<string | null>(null);

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
  const [pendingReply, setPendingReply] = useState<{ text: string } | null>(null);

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

  // Cuando hay respuesta pendiente, espera con rAF a que el video entre en una ventana y habla entonces
  useEffect(() => {
    if (!pendingReply) return;
    let raf = 0;
    let fired = false;
    const tick = () => {
      const v = videoRef.current;
      if (!v || !mountedRef.current || fired) return;
      const t = v.currentTime;
      const win = SPEAK_WINDOWS.find(([a, b]) => t >= a - 0.08 && t <= b);
      if (win) {
        fired = true;
        setPendingReply(null);
        const text = pendingReply.text;
        showSofiaReply(text);
        const data = replyDataRef.current;
        if (data && replyAudioRef.current === null) {
          try {
            const au = new Audio(data);
            replyAudioRef.current = au;
            au.onended = () => { replyAudioRef.current = null; };
            au.play().catch(() => {});
          } catch {}
        } else if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "es-ES";
          u.rate = 1.05;
          u.pitch = 1.1;
          const voices = window.speechSynthesis.getVoices();
          const female = voices.find((vv) => vv.lang.startsWith("es") && /femenin|female|paulina|monica|elena|conchita/i.test(vv.name)) || voices.find((vv) => vv.lang.startsWith("es"));
          if (female) u.voice = female;
          window.speechSynthesis.speak(u);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pendingReply]);

  const handleUserComment = () => {
    const text = userComment.trim();
    if (!text) return;
    const id = nextId();
    setUserComments((prev) => [...prev.slice(-4), { id, text }]);
    setUserComment("");
    const v = videoRef.current;
    const now = v ? v.currentTime : 0;
    let win: [number, number] | null = null;
    for (const w of SPEAK_WINDOWS) {
      if (w[0] > now + 0.2) { win = w; break; }
    }
    if (!win) win = SPEAK_WINDOWS[0]; // siguiente vuelta del bucle
    const replyText = pickReply(win[1] - win[0]);
    replyAudioRef.current = null;
    replyDataRef.current = null;
    ttsText(replyText, getGirlVoice(girlId || "luna"))
      .then((r) => { replyDataRef.current = `data:audio/mp3;base64,${r.audio}`; })
      .catch(() => { replyDataRef.current = null; });
    setPendingReply({ text: replyText });
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
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onCanPlay={() => setBuffering(false)}
          onPlaying={() => setBuffering(false)}
          onWaiting={() => setBuffering(true)}
          poster="/sofia-poster.jpg"
          className="story-video-media"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
            filter: warmFilter ? "sepia(0.18) saturate(1.25) brightness(1.05) hue-rotate(-5deg)" : "none",
            transition: "filter 1.5s ease",
          }}
        />

        {/* Corazón parpadeante mientras carga */}
        {buffering && (
          <div style={{
            position: "absolute", zIndex: 14, inset: 0,
            display: "grid", placeItems: "center", pointerEvents: "none",
          }}>
            <span style={{
              fontSize: 46, lineHeight: 1,
              animation: "ttHeartPulse 1s ease-in-out infinite",
              filter: "drop-shadow(0 2px 14px rgba(254,44,85,.7))",
            }}>❤️</span>
          </div>
        )}

        <style>{`@keyframes ttHeartPulse { 0%,100% { transform: scale(1); opacity:.55 } 50% { transform: scale(1.28); opacity:1 } }`}</style>

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
            position: "absolute", zIndex: 13,
            top: "calc(env(safe-area-inset-top,0px) + 4px)", right: 10,
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

          <button
            aria-label="Comentarios"
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}
          >
            <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(22,22,22,.45)", color: "#fff" }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>{fmt(1204)}</span>
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
          {sofiaComments.map((c) => (
            <div key={c.id} className="tt-comment" style={{ display: "flex", alignItems: "center", gap: 7, maxWidth: "100%" }}>
              <img src={avatar} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #fff", flex: "0 0 auto" }} />
              <span style={{ background: "rgba(254,44,85,.55)", padding: "5px 11px", borderRadius: 16, fontSize: 12.5, color: "#fff", lineHeight: 1.35, backdropFilter: "blur(4px)" }}>
                <b style={{ fontWeight: 600 }}>{name}</b>&nbsp; {c.text}
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
              placeholder="Escribe a Sofía..."
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