"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { saveInteraction } from "@/lib/storyInteractionsService";

const QUICK_REACTIONS = ["😍", "😂", "😮", "😢", "🔥"];
const HOLD_REACTIONS = ["😂", "😍", "😮", "😢", "👏", "🔥"];
const HOLD_TO_OPEN_MS = 300;
const STORY_DURATION = 6000;
const PROGRESS_INTERVAL = 50;

const font = `-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif`;
const eFont = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;

function triggerHaptic(p: number | number[] = 12) {
  if ("vibrate" in navigator) try { navigator.vibrate(p); } catch {}
}

function HeartSvg({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill={filled ? "#ff304f" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function CloseSvg() {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendSvg() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

function isInteractive(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const t = el.tagName.toLowerCase();
  if (t === "input" || t === "textarea" || t === "button") return true;
  if (el.closest("[data-si]")) return true;
  return false;
}

export default function StoryViewer({ storyImage, avatarUrl, displayName, onClose }: { storyImage: string; avatarUrl: string; displayName: string; onClose: () => void }) {
  const [isLiked, setIsLiked] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [likeParticles, setLikeParticles] = useState<{ id: string; x: number; y: number }[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [msgConfirm, setMsgConfirm] = useState<string | null>(null);
  const [isPressingStory, setIsPressingStory] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [highlightedReaction, setHighlightedReaction] = useState<string | null>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [progress, setProgress] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const heartBtnRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const mountedRef = useRef(true);
  const touchRef = useRef({ x: 0, y: 0, time: 0 });
  const pressingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const heartHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartOpenedPicker = useRef(false);
  const highlightRef = useRef<string | null>(null);

  const isPaused = isPressingStory || reactionPickerOpen || isSending || closing;
  isPausedRef.current = isPaused;

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

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { handleClose(); return; }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progress timer — single bar that loops
  useEffect(() => {
    if (closing) return;
    const interval = setInterval(() => {
      if (isPausedRef.current || !mountedRef.current) return;
      setProgress((p) => {
        const next = p + (100 / (STORY_DURATION / PROGRESS_INTERVAL));
        if (next >= 100) return 0;
        return next;
      });
    }, PROGRESS_INTERVAL);
    return () => clearInterval(interval);
  }, [closing]);

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

  const handleClose = useCallback(() => {
    if (closing) return; setClosing(true);
    setTimeout(() => { if (mountedRef.current) onClose(); }, 180);
  }, [closing, onClose]);

  const sendReaction = useCallback((emoji: string, originX?: number, originY?: number) => {
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

  const handleRootDown = useCallback((e: React.PointerEvent) => {
    if (isInteractive(e.target)) return;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    touchRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    pressingTimer.current = setTimeout(() => { if (mountedRef.current) setIsPressingStory(true); }, 150);
  }, []);

  const handleRootMove = useCallback((e: React.PointerEvent) => {
    if (!touchRef.current.time) return;
    if (Math.abs(e.clientX - touchRef.current.x) > 10 || Math.abs(e.clientY - touchRef.current.y) > 10) {
      touchRef.current = { x: 0, y: 0, time: 0 };
      if (pressingTimer.current) clearTimeout(pressingTimer.current);
      if (isPressingStory) setIsPressingStory(false);
    }
  }, [isPressingStory]);

  const handleRootUp = useCallback((e: React.PointerEvent) => {
    if (isInteractive(e.target)) {
      touchRef.current = { x: 0, y: 0, time: 0 };
      if (pressingTimer.current) clearTimeout(pressingTimer.current);
      if (isPressingStory) setIsPressingStory(false);
      return;
    }
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    if (pressingTimer.current) clearTimeout(pressingTimer.current);
    if (isPressingStory) setIsPressingStory(false);
    const st = touchRef.current;
    touchRef.current = { x: 0, y: 0, time: 0 };
    if (!st.time) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    const elapsed = Date.now() - st.time;
    if (dy > 70 && absDy > absDx * 1.5) { handleClose(); return; }
    if ((absDx > 50 || absDy > 60) && absDx > absDy) { handleClose(); return; }
    if (elapsed < 400 && absDx < 15 && absDy < 15) { handleClose(); }
  }, [handleClose, isPressingStory]);

  const handleRootCancel = useCallback(() => {
    touchRef.current = { x: 0, y: 0, time: 0 };
    if (pressingTimer.current) clearTimeout(pressingTimer.current);
    if (isPressingStory) setIsPressingStory(false);
  }, [isPressingStory]);

  const storyContent = (
    <>
      <style>{`
        @keyframes lp{0%{opacity:0;transform:translate3d(0,4px,0) scale(.55)}25%{opacity:1;transform:translate3d(0,-4px,0) scale(1.12)}100%{opacity:0;transform:translate3d(0,-52px,0) scale(.78)}}
        @keyframes ef{0%{opacity:0;transform:translate3d(-50%,0,0) scale(.55) rotate(-5deg)}22%{opacity:1;transform:translate3d(-50%,-14px,0) scale(1.15) rotate(3deg)}100%{opacity:0;transform:translate3d(calc(-50% + 12px),-125px,0) scale(.84) rotate(-3deg)}}
        @keyframes mc{0%{opacity:0;transform:translateX(-50%) translateY(6px) scale(.92)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}70%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-4px) scale(.95)}}
        @keyframes hp{0%{transform:scale(1)}35%{transform:scale(1.28)}65%{transform:scale(.92)}100%{transform:scale(1)}}
        @keyframes qrs{0%{opacity:0;transform:translateY(8px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
        .story-desktop-shell{position:fixed;inset:0;z-index:9999;display:flex;justify-content:center;align-items:center;overflow:hidden;background:#000}
        .story-blurred-background{position:absolute;inset:-40px;background-position:center;background-size:cover;filter:blur(28px);transform:scale(1.08);opacity:0.55;pointer-events:none}
        .story-desktop-shell::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.38);pointer-events:none}
        .story-mobile-frame{position:relative;z-index:2;width:min(430px,calc(100vw - 32px));height:min(92dvh,860px);aspect-ratio:9/16;overflow:hidden;background:#000;border-radius:14px;box-shadow:0 20px 70px rgba(0,0,0,.55)}
        @media(max-width:767px){.story-desktop-shell{display:block}.story-blurred-background{display:none}.story-desktop-shell::after{display:none}.story-mobile-frame{width:100%;height:100dvh;max-width:none;aspect-ratio:auto;border-radius:0;box-shadow:none}}
      `}</style>

      {/* Hidden real input at TOP — iOS won't scroll the page to reveal it */}
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
          zIndex:10001,pointerEvents:"none",
        }}
      />

      <div ref={rootRef} className="story-desktop-shell"
        style={{
          fontFamily:font,WebkitFontSmoothing:"antialiased",
          WebkitTapHighlightColor:"transparent",userSelect:"none",WebkitUserSelect:"none",
          touchAction:"none",
        }}
        onPointerDown={handleRootDown}
        onPointerMove={handleRootMove}
        onPointerUp={handleRootUp}
        onPointerCancel={handleRootCancel}
      >
        <div className="story-blurred-background" style={{backgroundImage:`url(${storyImage})`}} />
        <div className="story-mobile-frame">
        {/* Single daily story image fills entire container via object-fit:cover */}
        <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden",background:"#000" }}>
          <img src={storyImage} alt="" draggable={false} className="story-image"
            style={{
              position:"absolute",top:0,left:0,right:0,bottom:0,width:"100%",height:"100%",display:"block",
              objectFit:"cover",objectPosition:"center center",
            }}
          />
        </div>

        {/* Gradient overlays */}
        <div style={{
          position:"absolute",zIndex:20,inset:"0 0 auto",height:145,
          background:"linear-gradient(to bottom,rgba(0,0,0,.62) 0%,rgba(0,0,0,.28) 54%,transparent 100%)",
          pointerEvents:"none"
        }} />
        <div style={{
          position:"absolute",zIndex:20,inset:"auto 0 0",height:200,
          background:"linear-gradient(to top,rgba(0,0,0,.58) 0%,rgba(0,0,0,.23) 52%,transparent 100%)",
          pointerEvents:"none"
        }} />

        {/* Progress bar */}
        <div style={{
          position:"absolute",zIndex:40,top:"calc(env(safe-area-inset-top,0px) + 7px)",left:10,right:10,
          height:2,borderRadius:999,overflow:"hidden",pointerEvents:"none",
          transition:"opacity 110ms ease",opacity:isPressingStory?0.18:1,
          background:"rgba(255,255,255,.34)"
        }}>
          <div style={{
            height:"100%",borderRadius:"inherit",background:"rgba(255,255,255,.96)",
            transformOrigin:"left center",width:`${Math.min(progress,100)}%`,
            transition:"width 0.05s linear"
          }} />
        </div>

        {/* Header */}
        <div style={{
          position:"absolute",zIndex:40,
          top:"calc(env(safe-area-inset-top,0px) + 7px + 2px + 9px)",left:10,right:10,
          display:"flex",alignItems:"center",minHeight:38,pointerEvents:"none",
          transition:"opacity 110ms ease",opacity:isPressingStory?0.18:1,
        }}>
          <img src={avatarUrl} alt="" style={{
            width:31,height:31,borderRadius:"50%",objectFit:"cover",flex:"0 0 auto",
            border:"1.5px solid rgba(255,255,255,.85)"
          }} />
          <span style={{
            marginLeft:8,fontFamily:font,fontSize:14,lineHeight:"17px",fontWeight:600,color:"#fff",
            textShadow:"0 1px 2px rgba(0,0,0,.35)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"
          }}>
            {displayName}
          </span>
          <span style={{
            marginLeft:6,fontFamily:font,fontSize:13,lineHeight:"17px",fontWeight:400,
            color:"rgba(255,255,255,.72)",textShadow:"0 1px 2px rgba(0,0,0,.35)",
            whiteSpace:"nowrap",flexShrink:0
          }}>
            Ahora
          </span>
          <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6 }}>
            <button aria-label="Cerrar" onClick={(e)=>{e.stopPropagation();handleClose()}}
              style={{
                pointerEvents:"auto",width:38,height:38,display:"grid",placeItems:"center",
                padding:0,border:0,background:"transparent",color:"#fff",
                WebkitTapHighlightColor:"transparent",cursor:"pointer"
              }}>
              <CloseSvg />
            </button>
          </div>
        </div>

        {/* Reaction picker overlay */}
        {reactionPickerOpen && (
          <div style={{
            position:"absolute",zIndex:55,inset:0,
            background:"rgba(0,0,0,.26)",pointerEvents:"none"
          }} />
        )}

        {/* Reaction picker */}
        <div style={{
          position:"absolute",zIndex:65,left:"50%",
          bottom:`${keyboardInset > 100 ? keyboardInset + 122 : 122}px`,
          transform:reactionPickerOpen?"translateX(-50%) translateY(0) scale(1)":"translateX(-50%) translateY(8px) scale(.96)",
          opacity:reactionPickerOpen?1:0,
          pointerEvents:reactionPickerOpen?"auto":"none",
          transition:"opacity 180ms cubic-bezier(.2,.8,.2,1), transform 180ms cubic-bezier(.2,.8,.2,1)",
          width:"min(78vw,330px)",
          display:"grid",gridTemplateColumns:"repeat(3,1fr)",rowGap:24,columnGap:28,
        }}>
          {HOLD_REACTIONS.map((emoji) => (
            <button key={emoji} data-re={emoji} aria-label={emoji}
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

        {/* Story composer — blocks all gesture propagation */}
        <div
          onPointerDown={(e)=>{e.preventDefault();e.stopPropagation()}}
          onPointerUp={(e)=>{e.preventDefault();e.stopPropagation()}}
          onClick={(e)=>{e.preventDefault();e.stopPropagation()}}
          onTouchStart={(e)=>{e.stopPropagation()}}
          onTouchEnd={(e)=>{e.stopPropagation()}}
          style={{
            position:"absolute",zIndex:50,left:0,right:0,
            bottom:`${keyboardInset > 100 ? keyboardInset : 0}px`,
            pointerEvents:"auto",
          }}>
          {/* Quick reactions */}
          {isComposerFocused && keyboardInset > 100 && (
            <div style={{
              display:"flex",justifyContent:"center",gap:4,
              padding:"0 14px 8px",
              animation:"qrs 200ms cubic-bezier(.2,.75,.25,1) forwards",
            }}>
              {QUICK_REACTIONS.map((emoji) => (
                <button key={emoji} data-si
                  onClick={(e)=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();sendReaction(emoji,r.left+r.width/2,r.top+r.height/2)}}
                  style={{
                    width:44,height:44,display:"grid",placeItems:"center",padding:0,border:0,
                    borderRadius:"50%",background:"rgba(255,255,255,.14)",
                    backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",
                    fontFamily:eFont,fontSize:22,WebkitTapHighlightColor:"transparent",
                    cursor:"pointer",pointerEvents:"auto",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input row — fake div, not a real input */}
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"8px 14px calc(env(safe-area-inset-bottom,0px) + 10px)",
            pointerEvents:"none",
          }}>
            <div
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); if (document.activeElement !== hiddenInputRef.current) hiddenInputRef.current?.focus({ preventScroll: true }); }}
              style={{
                flex:1,height:42,display:"flex",alignItems:"center",gap:4,
                padding:"0 4px 0 16px",borderRadius:999,
                border:"1px solid rgba(255,255,255,.44)",
                background:"rgba(24,24,24,.44)",
                pointerEvents:"auto",cursor:"text",
                color:message?"#fff":"rgba(255,255,255,.82)",
                fontFamily:font,fontSize:16,lineHeight:"20px",fontWeight:400,
                whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
              }}
            >
              {message || "Enviar mensaje..."}
            </div>

            {message.trim() && (
              <button aria-label="Enviar" data-si
                onPointerDown={(e)=>{e.stopPropagation()}}
                onClick={(e)=>{e.stopPropagation();handleSend()}}
                disabled={isSending}
                style={{
                  width:34,height:34,display:"grid",placeItems:"center",padding:0,border:0,
                  borderRadius:"50%",background:"#fff",
                  color:"#000",WebkitTapHighlightColor:"transparent",
                  cursor:"pointer",pointerEvents:"auto",flexShrink:0,
                }}
              >
                <SendSvg />
              </button>
            )}

            <button ref={heartBtnRef} aria-label="Reaccionar" data-si
              onPointerDown={(e)=>{e.stopPropagation();handleHeartDown(e as any)}}
              onPointerUp={(e)=>{e.stopPropagation();handleHeartUp(e as any)}}
              onPointerCancel={(e)=>{e.stopPropagation();handleHeartCancel()}}
              onPointerLeave={(e)=>{e.stopPropagation();handleHeartCancel()}}
              style={{
                width:42,height:42,display:"grid",placeItems:"center",padding:0,border:0,
                background:"transparent",color:isLiked?"#ff304f":"#fff",
                WebkitTapHighlightColor:"transparent",cursor:"pointer",pointerEvents:"auto",
              }}
            >
              <HeartSvg filled={isLiked} />
            </button>
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
