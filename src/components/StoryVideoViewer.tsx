"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const APPLE_SPRING = "cubic-bezier(.32,.72,0,1)";

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
  onClose,
}: {
  videoSrc: string;
  avatar: string;
  name: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const scrollYRef = useRef(0);

  const [closing, setClosing] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const [likes, setLikes] = useState(3421);
  const [viewers, setViewers] = useState(1247);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [comments, setComments] = useState<TtComment[]>([]);
  const [gifts, setGifts] = useState<GiftPop[]>([]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const diff = now.getTime() - start.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeAgo(h >= 1 ? `Hace ${h}h` : `Hace ${m}m`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
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
    const spawnGift = () => {
      if (!mountedRef.current) return;
      const id = nextId();
      const g: GiftPop = {
        id,
        emoji: GIFT_EMOJIS[Math.floor(Math.random() * GIFT_EMOJIS.length)],
        x: 14 + Math.random() * 52,
      };
      setGifts((gs) => [...gs.slice(-4), g]);
      setTimeout(() => {
        if (mountedRef.current) setGifts((gs) => gs.filter((k) => k.id !== id));
      }, 2500);
    };
    const t1 = setInterval(spawnComment, 2100);
    const t2 = setInterval(spawnGift, 7000);
    const t3 = setInterval(() => setViewers((v) => v + (Math.random() < 0.5 ? -1 : 1)), 4000);
    spawnComment();
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    videoRef.current?.pause();
    setTimeout(onClose, 280);
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

  const handle = name.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 14) || "sofia";

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
          className="story-video-media"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
          }}
        />

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

        {/* EN VIVO badge */}
        <div style={{
          position: "absolute", zIndex: 12,
          top: "calc(env(safe-area-inset-top,0px) + 10px)", left: 12,
          display: "flex", alignItems: "center", gap: 7,
        }} data-story-interactive>
          <span style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "#e2183b", padding: "5px 9px", borderRadius: 14,
            color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: 0.4,
            boxShadow: "0 2px 8px rgba(0,0,0,.35)",
          }}>
            <span className="tt-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
            EN VIVO
          </span>
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
            {fmt(viewers)} viendo
          </span>
        </div>

        {/* Avatar + user + follow */}
        <div style={{
          position: "absolute", zIndex: 12,
          top: "calc(env(safe-area-inset-top,0px) + 52px)", left: 12,
          display: "flex", alignItems: "center", gap: 8, maxWidth: "calc(100% - 90px)",
        }} data-story-interactive>
          <span style={{ position: "relative", display: "flex", flex: "0 0 auto" }}>
            <span style={{ position: "absolute", inset: -2, borderRadius: "50%", background: "linear-gradient(135deg,#fe2c55,#ff8a00)" }} />
            <img src={avatar} alt="" style={{ position: "relative", width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid #000" }} />
          </span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            @{handle}
          </span>
          <button
            style={{
              marginLeft: 2, background: "#e2183b", color: "#fff", border: 0,
              borderRadius: 14, padding: "5px 14px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", flex: "0 0 auto",
            }}
          >
            SEGUIR
          </button>
        </div>

        {/* Close */}
        <button
          aria-label="Cerrar"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          style={{
            position: "absolute", zIndex: 13,
            top: "calc(env(safe-area-inset-top,0px) + 12px)", right: 10,
            width: 38, height: 38, display: "grid", placeItems: "center",
            border: 0, borderRadius: "50%", background: "rgba(22,22,22,.5)",
            color: "#fff", cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Bottom info */}
        <div style={{
          position: "absolute", zIndex: 12, left: 14, right: 82, bottom: 62,
          display: "flex", flexDirection: "column", gap: 5,
        }} data-story-interactive>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.6)" }}>
            Sofía en vivo 🌸
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.88)", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flex: "0 0 auto" }}>
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              sonido original · {timeAgo}
            </span>
          </div>
        </div>

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

          <button
            aria-label="Compartir"
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}
          >
            <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(22,22,22,.45)", color: "#fff" }}>
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>Compartir</span>
          </button>

          <img src={avatar} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #fff", marginTop: 2 }} />
        </div>

        {/* Comments */}
        <div style={{
          position: "absolute", zIndex: 11, left: 14, right: 84, bottom: 80,
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
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
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#ffd447" style={{ flex: "0 0 auto" }}>
              <circle cx="12" cy="12" r="10" fill="#ffd447" /><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#7a4e00" strokeWidth="1.6" fill="none" strokeLinecap="round" /><circle cx="9" cy="10" r="1.3" fill="#7a4e00" /><circle cx="15" cy="10" r="1.3" fill="#7a4e00" />
            </svg>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Añade un comentario...</span>
          </div>
          <button
            aria-label="Enviar"
            onClick={(e) => e.stopPropagation()}
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