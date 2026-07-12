"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { saveInteraction, getInteractions } from "@/lib/storyInteractionsService";
import InAppNotification from "./InAppNotification";
import type { NotificationData } from "./InAppNotification";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TOTAL_STORIES = 21;
const STORY_IMAGES = Array.from({ length: TOTAL_STORIES }, (_, i) => {
  const n = i + 1;
  const ext = n <= 9 ? "jpg" : "png";
  return `${basePath}/iris_stories/iris_story_${n}.${ext}`;
});
const STORY_DURATION = 6000;
const PROGRESS_INTERVAL = 50;
const STEPS = STORY_DURATION / PROGRESS_INTERVAL;

function getDayIndex(): number {
  const start = new Date(2026, 6, 12);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return diff % TOTAL_STORIES;
}

function timeAgo(): string {
  const h = new Date().getHours();
  return h < 1 ? "Hace 1 hora" : `Hace ${h} horas`;
}

const REACTIONS = ["❤️", "😂", "😍", "😮", "😢", "🔥"];

export default function StoryViewer({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(getDayIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [text, setText] = useState("");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [heartAnim, setHeartAnim] = useState(false);
  const [reactionAnim, setReactionAnim] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swiping, setSwiping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const inputFocusedRef = useRef(false);

  progressRef.current = progress;
  pausedRef.current = paused || inputFocused;
  inputFocusedRef.current = inputFocused;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight") { setIndex((i) => (i + 1) % TOTAL_STORIES); return; }
      if (e.key === "ArrowLeft") { setIndex((i) => (i - 1 + TOTAL_STORIES) % TOTAL_STORIES); return; }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      if (pausedRef.current || inputFocusedRef.current) return;
      setProgress((p) => {
        const next = p + (100 / STEPS);
        if (next >= 100) {
          setIndex((i) => (i + 1) % TOTAL_STORIES);
          return 0;
        }
        return next;
      });
    }, PROGRESS_INTERVAL);
    return () => clearInterval(interval);
  }, [index]);

  const goNext = useCallback(() => { setIndex((i) => (i + 1) % TOTAL_STORIES); }, []);
  const goPrev = useCallback(() => { setIndex((i) => (i - 1 + TOTAL_STORIES) % TOTAL_STORIES); }, []);

  const addNotification = useCallback((data: Omit<NotificationData, "id">) => {
    const id = crypto.randomUUID();
    setNotifications((p) => [...p, { ...data, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
  }, []);

  const showConfirm = useCallback((msg: string) => {
    setConfirmMsg(msg);
    setTimeout(() => setConfirmMsg(null), 2000);
  }, []);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    saveInteraction(`iris_story_${index + 1}`, "Iris", "message", text.trim());
    addNotification({ type: "message", title: "Respuesta enviada", message: `Tu mensaje se ha enviado a Iris` });
    showConfirm(`Mensaje enviado a Iris`);
    setText("");
    setInputFocused(false);
    inputRef.current?.blur();
  }, [text, index, addNotification, showConfirm]);

  const handleReaction = useCallback((emoji?: string) => {
    const r = emoji || "❤️";
    saveInteraction(`iris_story_${index + 1}`, "Iris", "reaction", r);
    if (!emoji) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 800);
    } else {
      setReactionAnim(r);
      setTimeout(() => setReactionAnim(null), 800);
    }
    addNotification({ type: "reaction", title: "Reacción enviada", message: `Has reaccionado con ${r} a la historia de Iris` });
    setShowReactionPicker(false);
  }, [index, addNotification]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const dy = e.touches[0].clientY - touchStart.y;
    if (dy > 80) setSwiping(true);
  }, [touchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setPaused(false);
    if (swiping) { onClose(); setSwiping(false); setTouchStart(null); return; }
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx > 0) goPrev(); else goNext();
    }
    setTouchStart(null);
  }, [touchStart, swiping, onClose, goPrev, goNext]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "#000",
        display: "flex", flexDirection: "column",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        WebkitUserSelect: "none", userSelect: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onMouseLeave={() => setPaused(false)}
    >
      {notifications.map((n) => (
        <InAppNotification key={n.id} notification={n} onRemove={removeNotification} />
      ))}

      {heartAnim && (
        <div style={{ position: "fixed", top: "50%", left: "50%", zIndex: 99998, pointerEvents: "none", fontSize: 80, animation: "heartFloat 0.8s ease forwards" }}>❤️</div>
      )}

      {reactionAnim && (
        <div key={reactionAnim} style={{ position: "fixed", top: "50%", left: "50%", zIndex: 99998, pointerEvents: "none", fontSize: 72, animation: "reactionFloat 0.8s ease forwards" }}>{reactionAnim}</div>
      )}

      {confirmMsg && (
        <div style={{
          position: "fixed", bottom: `calc(env(safe-area-inset-bottom, 8px) + 80px)`, left: 12, right: 12, zIndex: 99998,
          textAlign: "center", animation: "confirmPop 2s ease forwards",
        }}>
          <div style={{ display: "inline-block", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "10px 18px" }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{confirmMsg}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 3, padding: "8px 8px 0", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        {STORY_IMAGES.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < index ? "#fff" : i === index ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)", position: "relative", overflow: "hidden" }}>
            {i === index && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(progress, 100)}%`, background: "#fff", transition: "width 0.05s linear" }} />}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", top: `calc(env(safe-area-inset-top, 4px) + 16px)`, left: 12, right: 60, zIndex: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "2px solid #FF5798", flexShrink: 0 }}>
          <img src={`${basePath}/iris_stories/iris_story_${index + 1}.${index < 9 ? "jpg" : "png"}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>iris</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginLeft: 8 }}>{timeAgo()}</span>
        </div>
      </div>

      <button
        aria-label="Cerrar historia"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{ position: "absolute", top: `calc(env(safe-area-inset-top, 4px) + 12px)`, right: 12, zIndex: 10, background: "none", border: 0, color: "#fff", fontSize: 24, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, opacity: 0.8 }}
      >&#10005;</button>

      <div style={{ position: "absolute", left: 0, top: 60, bottom: 80, width: "30%", zIndex: 5, minHeight: 44 }}
        onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Historia anterior" />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <img key={index} src={STORY_IMAGES[index]} alt="Historia de Iris"
          style={{ width: "100%", maxHeight: "calc(100vh - 140px)", objectFit: "contain", userSelect: "none", WebkitUserSelect: "none", animation: "fadeIn 0.2s ease" }}
        />

        {showReactionPicker && (
          <div style={{
            position: "absolute", bottom: 60, left: 12, right: 12,
            display: "flex", justifyContent: "center", gap: 8,
            zIndex: 20, animation: "fadeIn 0.15s ease",
          }}>
            <div style={{ background: "rgba(30,30,30,0.95)", backdropFilter: "blur(12px)", borderRadius: 999, padding: "8px 12px", display: "flex", gap: 6 }}>
              {REACTIONS.map((r) => (
                <button key={r} onClick={() => handleReaction(r)}
                  aria-label={`Reaccionar con ${r}`}
                  style={{ fontSize: 28, background: "none", border: 0, cursor: "pointer", padding: "4px 6px", transition: "transform 0.15s", WebkitTapHighlightColor: "transparent" }}
                >{r}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: "8px 12px",
        paddingBottom: `calc(env(safe-area-inset-bottom, 4px) + 8px)`,
        display: "flex", alignItems: "center", gap: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}>
        <button
          aria-label="Reaccionar"
          onClick={() => { setShowReactionPicker(!showReactionPicker); handleReaction(); }}
          style={{ background: "none", border: 0, fontSize: 24, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
        >❤️</button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Enviar mensaje..."
          aria-label="Escribir mensaje"
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none",
            WebkitAppearance: "none",
          }}
        />

        <button
          aria-label="Enviar mensaje"
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            background: text.trim() ? "#FF5798" : "rgba(255,255,255,0.06)",
            border: 0, borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: text.trim() ? "pointer" : "default", flexShrink: 0, transition: "all 0.15s",
            color: text.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 18,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}
