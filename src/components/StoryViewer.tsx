"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { saveInteraction } from "@/lib/storyInteractionsService";

const QUICK_REACTIONS = ["😍", "😂", "😮", "😢", "🔥"];
const HOLD_REACTIONS = ["😂", "😍", "😮", "😢", "👏", "🔥"];
const HOLD_TO_OPEN_MS = 300;
const STORY_DURATION = 6000;
const PROGRESS_INTERVAL = 50;
const TAP_MAX_MS = 150;
const TAP_MAX_MOVE = 10;
const SWIPE_THRESHOLD = 45;
const LONG_PRESS_MS = 200;
const TRANSITION_MS = 220;

const font = `-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif`;
const eFont = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;

function triggerHaptic(p: number | number[] = 12) {
  if ("vibrate" in navigator) try { navigator.vibrate(p); } catch {}
}

function HeartSvg({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="27" height="27" fill={filled ? "#ff304f" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function CloseSvg() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendSvg() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

export default function StoryViewer({ storyImages, storyIndex, avatarUrl, displayName, onClose }: {
  storyImages: string[];
  storyIndex: number;
  avatarUrl: string;
  displayName: string;
  onClose: () => void;
}) {
  const len = storyImages.length;
  const [currentIndex, setCurrentIndex] = useState(storyIndex);
  const [progress, setProgress] = useState<number[]>(() =>
    storyImages.map((_, i) => i < storyIndex ? 100 : i === storyIndex ? 0 : 0)
  );
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [highlightedReaction, setHighlightedReaction] = useState<string | null>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [likeParticles, setLikeParticles] = useState<{ id: string; x: number; y: number }[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [msgConfirm, setMsgConfirm] = useState<string | null>(null);
  const [transition, setTransition] = useState<{
    from: number; to: number; dir: 'next' | 'prev';
  } | null>(null);
  const [timeAgo, setTimeAgo] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const heartBtnRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const mountedRef = useRef(true);
  const heartHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartOpenedPicker = useRef(false);
  const highlightRef = useRef<string | null>(null);
  const autoFiredRef = useRef(false);
  const transitionLockedRef = useRef(false);

  const gestureRef = useRef({
    startX: 0, startY: 0, startTime: 0,
    moved: false, longPress: false, gestureConsumed: false,
  });

  // Visual viewport — detect keyboard open via viewport shrink
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const rawInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInset(rawInset > 100 ? rawInset : 0);
    };
    update();
    vv.addEventListener("resize", update);
    return () => { vv.removeEventListener("resize", update); };
  }, []);

  // Time since daily post (00:00 UTC today)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const diff = now.getTime() - start.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h >= 1) setTimeAgo(`Hace ${h}h`);
      else setTimeAgo(`Hace ${m}m`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  // Body lock — keep document in place while viewer is open
  useEffect(() => {
    mountedRef.current = true;
    scrollYRef.current = window.scrollY;
    const b = document.body;
    const h = document.documentElement;
    const origB = { position: b.style.position, top: b.style.top, left: b.style.left, right: b.style.right, overflow: b.style.overflow };
    const origH = { overflow: h.style.overflow };
    h.style.overflow = "hidden";
    b.style.position = "fixed";
    b.style.top = `-${scrollYRef.current}px`;
    b.style.left = "0";
    b.style.right = "0";
    b.style.overflow = "hidden";
    return () => {
      mountedRef.current = false;
      b.style.position = origB.position;
      b.style.top = origB.top;
      b.style.left = origB.left;
      b.style.right = origB.right;
      b.style.overflow = origB.overflow;
      h.style.overflow = origH.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (closing) return; setClosing(true);
    setTimeout(() => { if (mountedRef.current) onClose(); }, 180);
  }, [closing, onClose]);

  const goTo = useCallback((toIdx: number, dir: 'next' | 'prev') => {
    if (transition || closing || transitionLockedRef.current) return;
    if (toIdx < 0 || toIdx >= len) return;
    transitionLockedRef.current = true;
    if (isComposerFocused) hiddenInputRef.current?.blur();
    setTransition({ from: currentIndex, to: toIdx, dir });
    setProgress(storyImages.map((_, i) => {
      if (i < toIdx) return 100;
      if (i === toIdx) return 0;
      return 0;
    }));
    setTimeout(() => {
      if (!mountedRef.current) return;
      setCurrentIndex(toIdx);
      setTransition(null);
      autoFiredRef.current = false;
      transitionLockedRef.current = false;
    }, TRANSITION_MS);
  }, [transition, closing, len, isComposerFocused, currentIndex, storyImages]);

  const goToNext = useCallback(() => {
    goTo(currentIndex + 1, 'next');
  }, [currentIndex, goTo]);

  const goToPrev = useCallback(() => {
    goTo(currentIndex - 1, 'prev');
  }, [currentIndex, goTo]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key === "ArrowRight" && currentIndex < len - 1) { e.preventDefault(); goToNext(); return; }
      if (e.key === "ArrowLeft" && currentIndex > 0) { e.preventDefault(); goToPrev(); return; }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, len, handleClose, goToNext, goToPrev]);

  // Progress timer
  useEffect(() => {
    if (closing || transition || paused) return;
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      setProgress(prev => {
        if (prev[currentIndex] >= 100) return prev;
        const step = 100 / (STORY_DURATION / PROGRESS_INTERVAL);
        const newP = [...prev];
        newP[currentIndex] = Math.min(prev[currentIndex] + step, 100);
        return newP;
      });
    }, PROGRESS_INTERVAL);
    return () => clearInterval(interval);
  }, [closing, transition, paused, currentIndex]);

  // Auto-advance when progress reaches 100
  useEffect(() => {
    if (closing || transition || autoFiredRef.current) return;
    if (progress[currentIndex] >= 100) {
      if (currentIndex < len - 1) {
        autoFiredRef.current = true;
        const t = setTimeout(() => { autoFiredRef.current = false; goToNext(); }, 300);
        return () => { clearTimeout(t); autoFiredRef.current = false; };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress[currentIndex], closing, transition, currentIndex, len]);

  // Reaction picker pointer tracking
  useEffect(() => {
    if (!reactionPickerOpen) return;
    highlightRef.current = null;
    setHighlightedReaction(null);
    const onMove = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const btn = el?.closest?.("[data-re]") as HTMLElement | null;
      const emoji = btn?.dataset?.re ?? null;
      if (emoji && emoji !== highlightRef.current) { highlightRef.current = emoji; setHighlightedReaction(emoji); triggerHaptic(5); }
      else if (!emoji && highlightRef.current) { highlightRef.current = null; setHighlightedReaction(null); }
    };
    const onEnd = () => {
      if (highlightRef.current) {
        const btn = document.querySelector(`[data-re="${highlightRef.current}"]`);
        const r = btn?.getBoundingClientRect();
        sendReaction(highlightRef.current, r ? r.left + r.width / 2 : undefined, r ? r.top + r.height / 2 : undefined);
      } else setReactionPickerOpen(false);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onEnd);
    document.addEventListener("pointercancel", onEnd);
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onEnd); document.removeEventListener("pointercancel", onEnd); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionPickerOpen]);

  const sendReaction = useCallback((emoji: string | null, originX?: number, originY?: number) => {
    if (!emoji) return;
    triggerHaptic(15);
    saveInteraction(`daily_${displayName}`, displayName, "reaction", emoji);
    const id = crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    if (originX != null && originY != null) {
      setFloatingEmojis((p) => [...p, { id, emoji, x: originX, y: originY }]);
    } else {
      const btn = heartBtnRef.current;
      const x = btn ? btn.getBoundingClientRect().left + btn.offsetWidth / 2 : window.innerWidth / 2;
      const y = btn ? btn.getBoundingClientRect().top : window.innerHeight - 80;
      setFloatingEmojis((p) => [...p, { id, emoji, x, y }]);
    }
    setTimeout(() => { if (mountedRef.current) setFloatingEmojis((p) => p.filter((r) => r.id !== id)); }, 850);
    setReactionPickerOpen(false); setHighlightedReaction(null); highlightRef.current = null;
  }, [displayName]);

  const handleSend = useCallback(() => {
    if (!message.trim() || isSending) return;
    setIsSending(true); triggerHaptic(10);
    saveInteraction(`daily_${displayName}`, displayName, "message", message.trim());
    setMessage(""); hiddenInputRef.current?.blur();
    setMsgConfirm("Mensaje enviado");
    setTimeout(() => { if (mountedRef.current) setMsgConfirm(null); }, 800);
    setTimeout(() => { if (mountedRef.current) setIsSending(false); }, 300);
  }, [message, displayName, isSending]);

  const handleHeartDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    heartOpenedPicker.current = false;
    heartHoldTimer.current = setTimeout(() => {
      if (mountedRef.current) { heartOpenedPicker.current = true; setReactionPickerOpen(true); setHighlightedReaction(null); highlightRef.current = null; triggerHaptic(8); }
    }, HOLD_TO_OPEN_MS);
  }, []);

  const handleHeartUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (heartHoldTimer.current) clearTimeout(heartHoldTimer.current);
    if (!heartOpenedPicker.current) {
      triggerHaptic(15);
      setIsLiked((prev) => !prev);
      if (!isLiked) {
        const btn = heartBtnRef.current;
        const x = btn ? btn.getBoundingClientRect().left + btn.offsetWidth / 2 : window.innerWidth / 2;
        const y = btn ? btn.getBoundingClientRect().top : window.innerHeight - 80;
        const id = crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        setLikeParticles((p) => [...p, { id, x, y }]);
        setTimeout(() => { if (mountedRef.current) setLikeParticles((p) => p.filter((x) => x.id !== id)); }, 650);
      }
    }
    heartOpenedPicker.current = false;
  }, [isLiked]);

  const handleHeartCancel = useCallback(() => {
    if (heartHoldTimer.current) clearTimeout(heartHoldTimer.current);
    heartOpenedPicker.current = false;
  }, []);

  // ── Unified pointer event handlers ──

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [role="button"], [data-story-interactive]')) return;
    if (transition || closing || transitionLockedRef.current) return;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    gestureRef.current = {
      startX: e.clientX, startY: e.clientY, startTime: performance.now(),
      moved: false, longPress: false, gestureConsumed: false,
    };
    const tid = setTimeout(() => {
      if (mountedRef.current && gestureRef.current && !gestureRef.current.moved) {
        gestureRef.current.longPress = true;
        setPaused(true);
      }
    }, LONG_PRESS_MS);
    (e.currentTarget as HTMLElement).dataset.lpTimer = String(tid);
  }, [transition, closing]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g || g.gestureConsumed) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (Math.abs(dx) > TAP_MAX_MOVE || Math.abs(dy) > TAP_MAX_MOVE) {
      if (!g.moved) {
        g.moved = true;
        // Cancel long-press timer on move
        const el = e.currentTarget as HTMLElement;
        const t = el.dataset.lpTimer;
        if (t) { clearTimeout(Number(t)); delete el.dataset.lpTimer; }
        if (g.longPress) setPaused(false);
      }
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const t = el.dataset.lpTimer;
    if (t) { clearTimeout(Number(t)); delete el.dataset.lpTimer; }

    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [role="button"], [data-story-interactive]')) {
      resetGesture(el, e.pointerId);
      return;
    }

    const g = gestureRef.current;
    if (!g) return;
    resetGesture(el, e.pointerId);

    if (g.gestureConsumed) return;

    const dx = e.clientX - g.startX;
    const elapsed = performance.now() - g.startTime;

    // Long press — resume pause, do not navigate
    if (g.longPress) {
      setPaused(false);
      return;
    }

    // Swipe (horizontal drag > SWIPE_THRESHOLD)
    if (g.moved && Math.abs(dx) > SWIPE_THRESHOLD) {
      g.gestureConsumed = true;
      if (dx < 0 && currentIndex < len - 1) { goToNext(); return; }
      if (dx > 0 && currentIndex > 0) { goToPrev(); return; }
      return;
    }

    // Quick tap
    if (!g.moved && elapsed < TAP_MAX_MS) {
      const zoneX = e.clientX - el.getBoundingClientRect().left;
      const zoneW = el.clientWidth;
      if (zoneX < zoneW * 0.45 && currentIndex > 0) {
        g.gestureConsumed = true;
        goToPrev();
        return;
      }
      if (zoneX >= zoneW * 0.55 && currentIndex < len - 1) {
        g.gestureConsumed = true;
        goToNext();
        return;
      }
      return;
    }

    // Fallback: if moved but below swipe threshold, nothing
  }, [currentIndex, len, goToNext, goToPrev]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const t = el.dataset.lpTimer;
    if (t) { clearTimeout(Number(t)); delete el.dataset.lpTimer; }
    if (gestureRef.current) gestureRef.current.gestureConsumed = true;
    resetGesture(el, e.pointerId);
  }, []);

  function resetGesture(el: HTMLElement, pointerId: number) {
    try { el.releasePointerCapture(pointerId); } catch {}
    gestureRef.current = undefined as any;
  }

  // ── Render ──

  const currentImage = storyImages[currentIndex];
  const enterImage = transition ? storyImages[transition.to] : null;

  const exitAnim = transition
    ? (transition.dir === 'next' ? 'story-exit-next' : 'story-exit-prev')
    : null;
  const enterAnim = transition
    ? (transition.dir === 'next' ? 'story-enter-next' : 'story-enter-prev')
    : null;

  const storyContent = (
    <>
      <style>{`
        @keyframes lp{0%{opacity:0;transform:translate3d(0,4px,0) scale(.55)}25%{opacity:1;transform:translate3d(0,-4px,0) scale(1.12)}100%{opacity:0;transform:translate3d(0,-52px,0) scale(.78)}}
        @keyframes ef{0%{opacity:0;transform:translate3d(-50%,0,0) scale(.55) rotate(-5deg)}22%{opacity:1;transform:translate3d(-50%,-14px,0) scale(1.15) rotate(3deg)}100%{opacity:0;transform:translate3d(calc(-50% + 12px),-125px,0) scale(.84) rotate(-3deg)}}
        @keyframes mc{0%{opacity:0;transform:translateX(-50%) translateY(6px) scale(.92)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}70%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-4px) scale(.95)}}
        @keyframes hp{0%{transform:scale(1)}35%{transform:scale(1.28)}65%{transform:scale(.92)}100%{transform:scale(1)}}
        @keyframes qrs{0%{opacity:0;transform:translateY(8px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes story-exit-next{from{transform:translate3d(0,0,0) scale(1);opacity:1}to{transform:translate3d(-22px,0,0) scale(.995);opacity:0}}
        @keyframes story-enter-next{from{transform:translate3d(28px,0,0) scale(.995);opacity:0}to{transform:translate3d(0,0,0) scale(1);opacity:1}}
        @keyframes story-exit-prev{from{transform:translate3d(0,0,0) scale(1);opacity:1}to{transform:translate3d(22px,0,0) scale(.995);opacity:0}}
        @keyframes story-enter-prev{from{transform:translate3d(-28px,0,0) scale(.995);opacity:0}to{transform:translate3d(0,0,0) scale(1);opacity:1}}
        .story-desktop-shell{position:fixed;inset:0;z-index:9999;display:flex;justify-content:center;align-items:center;overflow:hidden;background:#000;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}
        .story-desktop-shell img{-webkit-touch-callout:none;pointer-events:none}
        .story-blurred-background{position:absolute;inset:-40px;background-position:center;background-size:cover;filter:blur(28px);transform:scale(1.08);opacity:0.55;pointer-events:none;will-change:background-image}
        .story-slide{position:absolute;inset:0;will-change:transform,opacity}
        .story-slide-exit{animation-duration:220ms;animation-timing-function:cubic-bezier(0.22,1,0.36,1);animation-fill-mode:forwards}
        .story-slide-enter{animation-duration:220ms;animation-timing-function:cubic-bezier(0.22,1,0.36,1);animation-fill-mode:forwards}
        .story-action-button{width:40px;height:40px;display:grid;place-items:center;padding:0;border:0;background:transparent;color:#fff;-webkit-tap-highlight-color:transparent;cursor:pointer;transition:transform 120ms ease}
        .story-action-button:active{transform:scale(.84)}
        .story-mobile-frame{position:relative;z-index:2;width:min(430px,calc(100vw - 32px));height:min(92dvh,860px);aspect-ratio:9/16;overflow:hidden;background:#000;border-radius:14px;box-shadow:0 20px 70px rgba(0,0,0,.55)}
        @media(max-width:767px){.story-desktop-shell{display:block}.story-blurred-background{display:none}.story-mobile-frame{width:100%!important;height:100dvh!important;max-width:none!important;aspect-ratio:auto!important;border-radius:0!important;box-shadow:none!important}}
      `}</style>

      {/* Hidden real input at TOP */}
      <input ref={hiddenInputRef}
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        onFocus={() => setIsComposerFocused(true)}
        onBlur={() => { setIsComposerFocused(false); setKeyboardInset(0); }}
        onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend()}}}
        inputMode="text" autoComplete="off"
        style={{
          position:"fixed",top:1,left:1,width:2,height:2,
          opacity:0.01,fontSize:16,border:0,padding:0,margin:0,
          zIndex:10001,
        }}
      />

      <div ref={rootRef} className="story-desktop-shell"
        style={{
          fontFamily:font,WebkitFontSmoothing:"antialiased",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(e)=>e.preventDefault()}
      >
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.38)",pointerEvents:"none",zIndex:1}} />
        <div className="story-blurred-background" style={{backgroundImage:`url(${currentImage})`}} />
        <div className="story-mobile-frame" style={{touchAction:"none"}}>
          {/* Image layers */}
          <div className="story-slide"
            style={{
              zIndex:transition ? 3 : 2,
              animation: exitAnim ? `${exitAnim} 220ms cubic-bezier(0.22,1,0.36,1) forwards` : 'none',
            }}
          >
            {transition ? (
              <img src={storyImages[transition.from]} alt="" draggable={false}
                style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}
              />
            ) : (
              <img src={currentImage} alt="" draggable={false}
                style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}
              />
            )}
          </div>

          {transition && (
            <div className="story-slide"
              style={{
                zIndex:4,
                animation: `${enterAnim} 220ms cubic-bezier(0.22,1,0.36,1) forwards`,
              }}
            >
              <img src={enterImage!} alt="" draggable={false}
                style={{width:"100%",height:"100%",display:"block",objectFit:"cover",objectPosition:"center center"}}
              />
            </div>
          )}

          {/* Top gradient */}
          <div style={{
            position:"absolute",zIndex:25,inset:"0 0 auto",height:145,
            background:"linear-gradient(to bottom,rgba(0,0,0,.64) 0%,rgba(0,0,0,.29) 55%,transparent 100%)",
            pointerEvents:"none"
          }} />

          {/* Bottom gradient */}
          <div style={{
            position:"absolute",zIndex:30,left:0,right:0,bottom:0,height:180,
            background:"linear-gradient(to top,rgba(0,0,0,.62) 0%,rgba(0,0,0,.28) 46%,rgba(0,0,0,.08) 72%,transparent 100%)",
            pointerEvents:"none"
          }} />

          {/* Keyboard overlay (subtle darken when typing) */}
          <div style={{
            position:"absolute",zIndex:35,inset:0,
            background:"rgba(0,0,0,.18)",
            opacity:isComposerFocused && keyboardInset > 100 ? 1 : 0,
            pointerEvents:"none",
            transition:"opacity 150ms ease",
          }} />

          {/* Progress bars */}
          <div style={{
            position:"absolute",zIndex:60,
            top:"calc(env(safe-area-inset-top,0px) + 7px)",
            left:10,right:10,
            display:"flex",gap:3,
            pointerEvents:"none",
            transition:"opacity 110ms ease",
            opacity:paused?0.18:1,
          }}>
            {storyImages.map((_, idx) => {
              const val = progress[idx] || 0;
              return (
                <div key={idx} style={{
                  flex:1,height:2.2,borderRadius:999,overflow:"hidden",
                  background:"rgba(255,255,255,.34)",
                }}>
                  <div style={{
                    height:"100%",borderRadius:"inherit",
                    background:"rgba(255,255,255,.96)",
                    width:`${Math.min(val,100)}%`,
                    transformOrigin:"left center",
                    transition: idx === currentIndex && !transition && !paused
                      ? "width 0.05s linear"
                      : "width 220ms cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>
              );
            })}
          </div>

          {/* Header (avatar, name, time, close) */}
          <div style={{
            position:"absolute",zIndex:60,
            top:"calc(env(safe-area-inset-top,0px) + 7px + 2px + 9px + 2px)",
            left:10,right:10,
            display:"flex",alignItems:"center",minHeight:38,
            transition:"opacity 110ms ease",
            opacity:paused?0.18:1,
          }} data-story-interactive>
            <img src={avatarUrl} alt="" style={{
              width:30,height:30,borderRadius:"50%",objectFit:"cover",flex:"0 0 auto",
              border:"1.5px solid rgba(255,255,255,.85)",
            }} />
            <span style={{
              marginLeft:9,fontFamily:font,fontSize:13.5,lineHeight:"17px",
              fontWeight:600,color:"#fff",
              textShadow:"0 1px 2px rgba(0,0,0,.4)",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
            }}>
              {displayName}
            </span>
            <span style={{
              marginLeft:6,fontFamily:font,fontSize:12.5,lineHeight:"17px",fontWeight:400,
              color:"rgba(255,255,255,.72)",
              textShadow:"0 1px 2px rgba(0,0,0,.35)",
              whiteSpace:"nowrap",flexShrink:0,
            }}>
              {timeAgo}
            </span>
            <div style={{ marginLeft:"auto",display:"flex",alignItems:"center" }}>
              <button aria-label="Cerrar" data-story-interactive
                onClick={(e)=>{e.stopPropagation();handleClose()}}
                className="story-action-button"
                style={{ pointerEvents:"auto" }}
              >
                <CloseSvg />
              </button>
            </div>
          </div>

          {/* Reaction picker overlay */}
          {reactionPickerOpen && (
            <div style={{
              position:"absolute",zIndex:65,inset:0,
              background:"rgba(0,0,0,.26)",pointerEvents:"none"
            }} />
          )}

          {/* Reaction picker */}
          <div style={{
            position:"absolute",zIndex:75,left:"50%",
            bottom:`${keyboardInset > 100 ? keyboardInset + 122 : 122}px`,
            transform:reactionPickerOpen?"translateX(-50%) translateY(0) scale(1)":"translateX(-50%) translateY(8px) scale(.96)",
            opacity:reactionPickerOpen?1:0,
            pointerEvents:reactionPickerOpen?"auto":"none",
            transition:"opacity 180ms cubic-bezier(.2,.8,.2,1), transform 180ms cubic-bezier(.2,.8,.2,1)",
            width:"min(78vw,330px)",
            display:"grid",gridTemplateColumns:"repeat(3,1fr)",rowGap:24,columnGap:28,
          }}>
            {HOLD_REACTIONS.map((emoji) => (
              <button key={emoji} data-re={emoji} aria-label={emoji} data-story-interactive
                data-active={highlightedReaction===emoji?"true":undefined}
                onClick={(e)=>{e.stopPropagation()}}
                style={{
                  width:74,height:74,display:"grid",placeItems:"center",padding:0,border:0,
                  background:"transparent",fontFamily:eFont,fontSize:58,lineHeight:1,
                  WebkitTapHighlightColor:"transparent",touchAction:"none",cursor:"pointer",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Bottom UI — floats over image, moves with keyboard */}
          <div data-story-interactive
            style={{
              position:"absolute",zIndex:60,left:0,right:0,
              bottom:keyboardInset > 100 ? keyboardInset : 0,
              transition:"bottom 170ms cubic-bezier(.2,.75,.25,1)",
            }}
            onPointerDown={(e)=>{e.preventDefault();e.stopPropagation()}}
            onPointerUp={(e)=>{e.preventDefault();e.stopPropagation()}}
            onClick={(e)=>{e.preventDefault();e.stopPropagation()}}
            onTouchStart={(e)=>{e.stopPropagation()}}
            onTouchEnd={(e)=>{e.stopPropagation()}}
          >
            {/* Quick reactions (visible when keyboard open) */}
            {isComposerFocused && keyboardInset > 100 && (
              <div style={{
                display:"flex",justifyContent:"center",gap:4,
                padding:"0 13px 8px",
                animation:"qrs 200ms cubic-bezier(.2,.75,.25,1) forwards",
              }}>
                {QUICK_REACTIONS.map((emoji) => (
                  <button key={emoji} data-story-interactive
                    onClick={(e)=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();sendReaction(emoji,r.left+r.width/2,r.top+r.height/2)}}
                    style={{
                      width:44,height:44,display:"grid",placeItems:"center",padding:0,border:0,
                      borderRadius:"50%",background:"rgba(255,255,255,.14)",
                      backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",
                      fontFamily:eFont,fontSize:22,WebkitTapHighlightColor:"transparent",
                      cursor:"pointer",pointerEvents:"auto",transition:"transform 120ms ease",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Message row — grid: [input] [heart] [send] */}
            <div style={{
              padding:"8px 13px calc(env(safe-area-inset-bottom,0px) + 10px)",
              display:"grid",
              gridTemplateColumns:"minmax(0,1fr) 40px 40px",
              alignItems:"center",gap:7,
            }}>
              {/* Message input shell */}
              <div data-story-interactive
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); if (document.activeElement !== hiddenInputRef.current) hiddenInputRef.current?.focus({ preventScroll: true }); }}
                style={{
                  height:41,minWidth:0,display:"flex",alignItems:"center",
                  padding:"0 15px",borderRadius:999,
                  border:"1px solid rgba(255,255,255,.44)",
                  background:"rgba(8,8,8,.14)",
                  backdropFilter:"blur(12px) saturate(120%)",
                  WebkitBackdropFilter:"blur(12px) saturate(120%)",
                  cursor:"text",
                  color:message?"#fff":"rgba(255,255,255,.72)",
                  fontFamily:font,fontSize:14,lineHeight:"20px",fontWeight:400,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                  transition:"border-color 150ms ease, background 150ms ease",
                }}
              >
                {message || "Enviar mensaje..."}
              </div>

              {/* Heart button */}
              <button ref={heartBtnRef} aria-label="Reaccionar" data-story-interactive
                onPointerDown={(e)=>{e.stopPropagation();handleHeartDown(e as any)}}
                onPointerUp={(e)=>{e.stopPropagation();handleHeartUp(e as any)}}
                onPointerCancel={(e)=>{e.stopPropagation();handleHeartCancel()}}
                onPointerLeave={(e)=>{e.stopPropagation();handleHeartCancel()}}
                className="story-action-button"
                style={{color:isLiked?"#ff304f":"#fff"}}
              >
                <HeartSvg filled={isLiked} />
              </button>

              {/* Send button */}
              {message.trim() && (
                <button aria-label="Enviar" data-story-interactive
                  onPointerDown={(e)=>{e.stopPropagation()}}
                  onClick={(e)=>{e.stopPropagation();handleSend()}}
                  disabled={isSending}
                  className="story-action-button"
                  style={{color:"#fff"}}
                >
                  <SendSvg />
                </button>
              )}
              {!message.trim() && (
                <div style={{width:40,height:40}} />
              )}
            </div>
          </div>

          {/* Like particles */}
          {likeParticles.map((p) => (
            <div key={p.id} style={{
              position:"absolute",left:p.x - 12,top:p.y - 12,width:24,height:24,
              color:"#ff304f",pointerEvents:"none",zIndex:80,
              animation:"lp 650ms cubic-bezier(.18,.75,.25,1) forwards",
            }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#ff304f" stroke="none" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
              </svg>
            </div>
          ))}

          {/* Floating emojis */}
          {floatingEmojis.map((fe) => (
            <div key={fe.id} style={{
              position:"absolute",zIndex:95,left:fe.x - 17,top:fe.y - 17,
              fontFamily:eFont,fontSize:34,lineHeight:1,pointerEvents:"none",
              animation:"ef 820ms cubic-bezier(.2,.74,.24,1) forwards",
            }}>
              {fe.emoji}
            </div>
          ))}

          {/* Message confirm */}
          {msgConfirm && (
            <div style={{
              position:"absolute",left:"50%",bottom:72,transform:"translateX(-50%)",
              padding:"6px 10px",borderRadius:999,color:"#fff",background:"rgba(24,24,24,.72)",
              fontFamily:font,fontSize:11,fontWeight:500,pointerEvents:"none",whiteSpace:"nowrap",
              animation:"mc 800ms ease-out forwards",
            }}>
              {msgConfirm}
            </div>
          )}

          {/* Closing overlay */}
          {closing && (
            <div style={{
              position:"absolute",inset:0,zIndex:200,background:"#000",pointerEvents:"none"
            }} />
          )}
        </div>
      </div>
    </>
  );

  return createPortal(storyContent, document.body);
}
