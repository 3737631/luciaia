"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { saveInteraction } from "@/lib/storyInteractionsService";

const QUICK_REACTIONS = ["😍", "😂", "😮", "😢", "🔥"];
const HOLD_REACTIONS = ["😂", "😍", "😮", "😢", "👏", "🔥"];
const HOLD_TO_OPEN_MS = 300;
const STORY_DURATION = 6000;
const PROGRESS_INTERVAL = 16;
const LONG_PRESS_MS = 220;
const TAP_MAX_MS = 220;
const TAP_MOVE_TOLERANCE = 10;
const DRAG_START_DISTANCE = 12;
const SWIPE_COMPLETE_DISTANCE = 0.22;
const SWIPE_VELOCITY_THRESHOLD = 0.45;
const SWIPE_DOWN_THRESHOLD = 60;
const STORY_TRANSITION_MS = 200;
const STORY_FADE_MS = 80;
const APPLE_SPRING = "cubic-bezier(.32,.72,0,1)";

const font = `-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif`;

const storyImageCache = new Map<string, Promise<boolean>>();

export function preloadAndDecodeImage(src: string): Promise<boolean> {
  if (!src) return Promise.resolve(false);
  if (storyImageCache.has(src)) return storyImageCache.get(src)!;
  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = async () => {
      try { if (typeof img.decode === "function") await img.decode(); } catch {}
      resolve(true);
    };
    img.onerror = () => { resolve(false); };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      Promise.resolve(typeof img.decode === "function" ? img.decode().catch(() => undefined) : undefined).finally(() => resolve(true));
    }
  });
  storyImageCache.set(src, promise);
  return promise;
}
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
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.4 20.4 20.85 12 3.4 3.6 10 12Z" />
    </svg>
  );
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("button, input, textarea, a, [data-story-interactive]"))
  );
}

interface GestureState {
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  longPressTriggered: boolean;
  moved: boolean;
  dragging: boolean;
  targetWasInteractive: boolean;
  axis: null | "horizontal" | "vertical";
}

function createGesture(e: React.PointerEvent): GestureState {
  return {
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    currentX: e.clientX,
    currentY: e.clientY,
    startTime: performance.now(),
    longPressTriggered: false,
    moved: false,
    dragging: false,
    targetWasInteractive: isInteractiveTarget(e.target),
    axis: null,
  };
}

export default function StoryViewer({ characters, startCharIndex, onClose, onMarkSeen }: {
  characters: Array<{ id: string; images: string[]; avatar: string; name: string }>;
  startCharIndex: number;
  onClose: () => void;
  onMarkSeen?: (id: string) => void;
}) {
  const [charIndex, setCharIndex] = useState(startCharIndex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentChar = characters[charIndex];
  const storyImages = currentChar.images;
  const len = storyImages.length;
  const hasNextStory = currentIndex < len - 1;
  const hasPrevStory = currentIndex > 0;
  const hasNextGroup = charIndex < characters.length - 1;
  const hasPrevGroup = charIndex > 0;

  const [progress, setProgress] = useState<number[]>(() =>
    storyImages.map((_, i) => i < 0 ? 100 : i === 0 ? 0 : 0)
  );
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeDirection, setCloseDirection] = useState<"down" | "right" | null>(null);
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
  const [longPressActive, setLongPressActive] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");

  const [incomingChar, setIncomingChar] = useState<{
    charIdx: number;
    storyIdx: number;
    direction: "next" | "prev";
  } | null>(null);

  const [viewerReady, setViewerReady] = useState(false);

  // Transition state: null or { type:'story'|'group', dir, fromChar, toChar, from, to }
  const [transition, setTransition] = useState<{
    type: "story" | "group";
    dir: "next" | "prev";
    fromChar: number;
    toChar: number;
    from: number;
    to: number;
  } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const heartBtnRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const mountedRef = useRef(true);
  const heartHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartOpenedPicker = useRef(false);
  const highlightRef = useRef<string | null>(null);
  const autoFiredRef = useRef(false);
  const transitionLockedRef = useRef(false);
  const closingRef = useRef(false);
  const initialLoadRef = useRef(true);
  const suppressClickRef = useRef(0);
  const gestureRef = useRef<GestureState | null>(null);
  const dragRAFRef = useRef(0);
  const progressAnimationRef = useRef(0);
  const progressStartedAtRef = useRef(0);
  const handleNextRef = useRef<() => void>(() => {});
  const progressFrozenRef = useRef(false);
  const preloadedUrlsRef = useRef(new Set<string>());

  // Snapshot for exit face during group transition
  const exitSnapshotRef = useRef<{
    charIdx: number;
    imgIdx: number;
    progress: number[];
  } | null>(null);

  // Detect reduced motion
  const prefersReducedMotionRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const h = (e: MediaQueryListEvent) => { prefersReducedMotionRef.current = e.matches; };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // Visual viewport
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

  // Time since daily post
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

  // Body lock
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

  // Preload remaining images (first story already preloaded at page mount)
  useEffect(() => {
    const urls: string[] = [];
    characters.forEach((c) => {
      if (c.avatar) urls.push(c.avatar);
      if (c.images) urls.push(...c.images);
    });
    [...new Set(urls.filter(Boolean))].forEach((u) => preloadAndDecodeImage(u));
    setViewerReady(true);
  }, [characters]);

  // Preload adjacent groups
  const preloadGroup = useCallback((idx: number) => {
    if (idx < 0 || idx >= characters.length) return;
    characters[idx].images.forEach((url) => {
      if (preloadedUrlsRef.current.has(url)) return;
      preloadedUrlsRef.current.add(url);
      if (!storyImageCache.has(url)) preloadAndDecodeImage(url);
    });
  }, [characters]);

  // Preload stories around current position
  const preloadAround = useCallback((personIdx: number, storyIdx: number) => {
    const current = characters[personIdx];
    const nextPerson = characters[personIdx + 1];
    const prevPerson = characters[personIdx - 1];
    const urls = [
      current?.images?.[storyIdx + 1],
      current?.images?.[storyIdx - 1],
      nextPerson?.images?.[0],
      prevPerson?.images?.[Math.max(0, prevPerson.images.length - 1)],
    ].filter(Boolean) as string[];
    urls.forEach((u) => { if (!storyImageCache.has(u)) preloadAndDecodeImage(u); });
  }, [characters]);

  useEffect(() => {
    if (hasNextGroup) preloadGroup(charIndex + 1);
    if (hasPrevGroup) preloadGroup(charIndex - 1);
    preloadAround(charIndex, currentIndex);
  }, [charIndex, currentIndex, hasNextGroup, hasPrevGroup, preloadGroup, preloadAround]);

  // ── Progress timer (single RAF loop) ──

  const stopProgress = useCallback(() => {
    if (progressAnimationRef.current) {
      cancelAnimationFrame(progressAnimationRef.current);
      progressAnimationRef.current = 0;
    }
  }, []);

  const startViewerClose = useCallback((dir: "down" | "right") => {
    if (closingRef.current || closing) return;
    closingRef.current = true;
    setClosing(true);
    setCloseDirection(dir);
    stopProgress();
  }, [closing, stopProgress]);

  const handleCloseEnd = useCallback(() => {
    if (!closing) return;
    onClose();
  }, [closing, onClose]);

  const startProgress = useCallback(() => {
    stopProgress();
    if (closing || progressFrozenRef.current || paused || transition) return;
    progressStartedAtRef.current = performance.now();
    setProgress((prev) => {
      const next = [...prev];
      if (next[currentIndex] === 0) return prev;
      next[currentIndex] = 0;
      return next;
    });
    const tick = (now: number) => {
      if (!mountedRef.current || progressFrozenRef.current || paused || transition || closing) {
        progressAnimationRef.current = 0;
        return;
      }
      const elapsed = now - progressStartedAtRef.current;
      const nextVal = Math.min(100, (elapsed / STORY_DURATION) * 100);
      setProgress((prev) => {
        if (prev[currentIndex] >= 100) return prev;
        const next = [...prev];
        next[currentIndex] = nextVal;
        return next;
      });
      if (nextVal < 100) {
        progressAnimationRef.current = requestAnimationFrame(tick);
      } else {
        progressAnimationRef.current = 0;
        autoFiredRef.current = true;
        setTimeout(() => { if (mountedRef.current) { autoFiredRef.current = false; handleNextRef.current(); } }, 200);
      }
    };
    progressAnimationRef.current = requestAnimationFrame(tick);
  }, [closing, paused, transition, currentIndex, stopProgress]);

  useEffect(() => {
    startProgress();
    return stopProgress;
  }, [currentIndex, startProgress, stopProgress]);

  // ── Transition functions ──

  const transitionToStory = useCallback(async (toIdx: number, dir: "next" | "prev") => {
    if (transitionLockedRef.current || closing) return;
    const nextUrl = characters[charIndex]?.images[toIdx];
    if (!nextUrl) return;
    await preloadAndDecodeImage(nextUrl);
    if (!mountedRef.current || transitionLockedRef.current || closing) return;
    transitionLockedRef.current = true;
    if (isComposerFocused) hiddenInputRef.current?.blur();
    stopProgress();

    exitSnapshotRef.current = { charIdx: charIndex, imgIdx: currentIndex, progress: [...progress] };
    setProgress((prev) => {
      const next = [...prev];
      if (dir === "next") {
        // Going forward: mark current as completed
        next[currentIndex] = 100;
      }
      // Reset target and all after it to 0
      for (let i = toIdx; i < next.length; i++) {
        next[i] = 0;
      }
      return next;
    });
    setCurrentIndex(toIdx);

    setTimeout(() => {
      if (!mountedRef.current) return;
      exitSnapshotRef.current = null;
      transitionLockedRef.current = false;
    }, STORY_FADE_MS);
  }, [closing, isComposerFocused, charIndex, currentIndex, characters, progress, stopProgress]);

  const finishCubeTransition = useCallback(() => {
    if (!incomingChar) return;
    setCharIndex(incomingChar.charIdx);
    setCurrentIndex(incomingChar.storyIdx);
    setIncomingChar(null);
    setTransition(null);
    autoFiredRef.current = false;
    transitionLockedRef.current = false;
    progressFrozenRef.current = false;
    exitSnapshotRef.current = null;
  }, [incomingChar]);

  const transitionToGroup = useCallback(async (toCharIdx: number, toIdx: number, dir: "next" | "prev") => {
    if (transition || closing || transitionLockedRef.current) return;
    if (prefersReducedMotionRef.current) {
      transitionLockedRef.current = true;
      if (isComposerFocused) hiddenInputRef.current?.blur();
      exitSnapshotRef.current = { charIdx: charIndex, imgIdx: currentIndex, progress: [...progress] };
      onMarkSeen?.(characters[charIndex].id);
      progressFrozenRef.current = true;
      setProgress(characters[toCharIdx].images.map((_, i) => i < toIdx ? 100 : i === toIdx ? 0 : 0));
      setCharIndex(toCharIdx);
      setCurrentIndex(toIdx);
      exitSnapshotRef.current = null;
      setTimeout(() => { transitionLockedRef.current = false; progressFrozenRef.current = false; }, 50);
      return;
    }

    const nextSrc = characters[toCharIdx]?.images[toIdx];
    await preloadAndDecodeImage(nextSrc);
    if (!mountedRef.current) return;

    transitionLockedRef.current = true;
    if (isComposerFocused) hiddenInputRef.current?.blur();

    exitSnapshotRef.current = { charIdx: charIndex, imgIdx: currentIndex, progress: [...progress] };
    onMarkSeen?.(characters[charIndex].id);
    progressFrozenRef.current = true;

    setTransition({ type: "group", dir, fromChar: charIndex, toChar: toCharIdx, from: currentIndex, to: toIdx });
    setProgress(characters[toCharIdx].images.map((_, i) => i < toIdx ? 100 : i === toIdx ? 0 : 0));

    setIncomingChar({ charIdx: toCharIdx, storyIdx: toIdx, direction: dir });
  }, [transition, closing, isComposerFocused, charIndex, currentIndex, characters, progress, onMarkSeen, incomingChar]);

  const handleNext = useCallback(async () => {
    if (transitionLockedRef.current) return;
    if (hasNextStory) {
      await transitionToStory(currentIndex + 1, "next");
      return;
    }
    onMarkSeen?.(characters[charIndex].id);
    if (hasNextGroup) {
      await transitionToGroup(charIndex + 1, 0, "next");
      return;
    }
    startViewerClose("down");
  }, [hasNextStory, hasNextGroup, currentIndex, charIndex, transitionToStory, transitionToGroup, startViewerClose, onMarkSeen, characters]);

  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  const handlePrevious = useCallback(async () => {
    if (transitionLockedRef.current) return;
    stopProgress();
    if (currentIndex > 0) {
      await transitionToStory(currentIndex - 1, "prev");
      return;
    }
    if (charIndex > 0) {
      const prevChar = characters[charIndex - 1];
      const lastIdx = Math.max(0, prevChar.images.length - 1);
      await transitionToGroup(charIndex - 1, lastIdx, "prev");
      return;
    }
    // First story of first character — restart progress, don't close
    transitionLockedRef.current = true;
    setProgress((prev) => { const n = [...prev]; n[0] = 0; return n; });
    progressStartedAtRef.current = performance.now();
    setTimeout(() => { transitionLockedRef.current = false; startProgress(); }, 50);
  }, [currentIndex, charIndex, characters, transitionToStory, transitionToGroup, stopProgress, startProgress]);

  // Complete a drag: launch the matching transition
  const completeDrag = useCallback((dir: "next" | "prev") => {
    if (dir === "next") {
      handleNext();
    } else {
      handlePrevious();
    }
  }, [handleNext, handlePrevious]);

  // Cancel a drag: animate back to neutral
  const cancelDrag = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    el.style.transition = `transform 180ms ${APPLE_SPRING}`;
    el.style.transform = `translate3d(0, 0, 0)`;
    setPaused(false);
    progressFrozenRef.current = false;
    setTimeout(() => {
      if (el) { el.style.transition = ""; el.style.transform = ""; }
    }, 190);
  }, []);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { startViewerClose("down"); return; }
      if (e.key === "ArrowRight") {
        e.preventDefault(); handleNext(); return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault(); handlePrevious(); return;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startViewerClose, handleNext, handlePrevious]);

  // ── Auto-advance (fallback) ──

  useEffect(() => {
    if (closing || transition || autoFiredRef.current || progressFrozenRef.current) return;
    if (progress[currentIndex] >= 100) {
      autoFiredRef.current = true;
      const t = setTimeout(() => { if (mountedRef.current) { autoFiredRef.current = false; handleNext(); } }, 200);
      return () => { clearTimeout(t); autoFiredRef.current = false; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress[currentIndex], closing, transition, currentIndex, handleNext]);

  // ── Reaction picker ──

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
    saveInteraction(`daily_${currentChar.name}`, currentChar.name, "reaction", emoji);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChar.name]);

  const handleSend = useCallback(() => {
    if (!message.trim() || isSending) return;
    setIsSending(true); triggerHaptic(10);
    saveInteraction(`daily_${currentChar.name}`, currentChar.name, "message", message.trim());
    setMessage(""); hiddenInputRef.current?.blur();
    setMsgConfirm("Mensaje enviado");
    setTimeout(() => { if (mountedRef.current) setMsgConfirm(null); }, 800);
    setTimeout(() => { if (mountedRef.current) setIsSending(false); }, 300);
  }, [message, currentChar.name, isSending]);

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

  // ── Gesture handlers ──

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isInteractiveTarget(e.target)) return;
    if (transition || closing || transitionLockedRef.current) return;

    const el = e.currentTarget as HTMLElement;
    try { el.setPointerCapture(e.pointerId); } catch {}

    const g = createGesture(e);
    gestureRef.current = g;

    // Long press timer
    const tid = window.setTimeout(() => {
      if (!mountedRef.current) return;
      const g2 = gestureRef.current;
      if (!g2 || g2.moved || g2.targetWasInteractive) return;
      g2.longPressTriggered = true;
      setLongPressActive(true);
      setPaused(true);
      progressFrozenRef.current = true;
    }, LONG_PRESS_MS);
    el.dataset.lpTimer = String(tid);

    // Reset drag transforms
    if (frameRef.current) {
      frameRef.current.style.transition = "";
      frameRef.current.style.transform = "";
    }
  }, [transition, closing]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g || g.targetWasInteractive) return;
    g.currentX = e.clientX;
    g.currentY = e.clientY;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    // Axis lock
    if (!g.axis) {
      if (Math.abs(dx) > DRAG_START_DISTANCE || Math.abs(dy) > DRAG_START_DISTANCE) {
        g.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "horizontal" : "vertical";
      } else {
        return;
      }
    }

    // Cancel long press timer on move
    if (!g.moved && (Math.abs(dx) > TAP_MOVE_TOLERANCE || Math.abs(dy) > TAP_MOVE_TOLERANCE)) {
      g.moved = true;
      const el = e.currentTarget as HTMLElement;
      const t = el.dataset.lpTimer;
      if (t) { clearTimeout(Number(t)); delete el.dataset.lpTimer; }
      if (g.longPressTriggered) {
        setPaused(false);
        progressFrozenRef.current = false;
        setLongPressActive(false);
      }
    }

    // Vertical axis: swipe to close
    if (g.axis === "vertical") {
      if (dy > 0 && !transition && !closing) {
        g.dragging = true;
        const drag = Math.min(dy, 200);
        if (frameRef.current) {
          frameRef.current.style.animation = "";
          frameRef.current.style.transition = "none";
          frameRef.current.style.transform = `translateY(${drag}px)`;
          frameRef.current.style.borderRadius = `${Math.max(0, 14 - drag / 14)}px`;
          frameRef.current.style.opacity = `${Math.max(0.4, 1 - drag / 280)}`;
        }
      }
      return;
    }

    // Horizontal axis: interactive drag
    if (g.axis === "horizontal") {
      if (!g.dragging && Math.abs(dx) > DRAG_START_DISTANCE) {
        g.dragging = true;
        setPaused(true);
        progressFrozenRef.current = true;
        // Preload adjacent group
        if (dx < 0 && hasNextGroup) preloadGroup(charIndex + 1);
        if (dx > 0 && hasPrevGroup) preloadGroup(charIndex - 1);
      }

      if (g.dragging) {
        g.moved = true;
        const width = (e.currentTarget as HTMLElement).clientWidth || window.innerWidth;

        // Apply transform directly via RAF
        if (dragRAFRef.current) cancelAnimationFrame(dragRAFRef.current);
        dragRAFRef.current = requestAnimationFrame(() => {
          const el = frameRef.current;
          if (!el) return;
          el.style.transition = "none";
          el.style.transform = `translate3d(${dx}px, 0, 0)`;
        });
      }
    }
  }, [transition, closing, hasNextGroup, hasPrevGroup, charIndex, preloadGroup]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const t = el.dataset.lpTimer;
    if (t) { clearTimeout(Number(t)); delete el.dataset.lpTimer; }

    const g = gestureRef.current;
    if (!g) return;
    try { el.releasePointerCapture(g.pointerId); } catch {}

    // Reset vertical drag transforms
    if (frameRef.current) {
      frameRef.current.style.animation = "";
      frameRef.current.style.transition = "";
      frameRef.current.style.transform = "";
      frameRef.current.style.borderRadius = "";
      frameRef.current.style.opacity = "";
    }

    // ═══ Long press: DO NOT navigate ═══
    if (g.longPressTriggered) {
      setPaused(false);
      progressFrozenRef.current = false;
      setLongPressActive(false);
      gestureRef.current = null;
      suppressClickRef.current = performance.now() + 350;
      return;
    }

    // Interactive target (button, input, etc.) — already handled by those elements
    if (g.targetWasInteractive) {
      gestureRef.current = null;
      return;
    }

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const elapsed = performance.now() - g.startTime;

    // ═══ Vertical swipe close ═══
    if (dy > SWIPE_DOWN_THRESHOLD && dy > Math.abs(dx) * 1.2) {
      if (frameRef.current) {
        frameRef.current.style.transition = `transform 160ms ${APPLE_SPRING}`;
        frameRef.current.style.transform = `translateY(${Math.max(dy + 100, 250)}px)`;
      }
      startViewerClose("down");
      gestureRef.current = null;
      return;
    }

    // ═══ Right‑edge swipe to close ═══
    if (dx > 80 && g.startX < 28 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      startViewerClose("right");
      gestureRef.current = null;
      return;
    }
    if (g.dragging && g.axis === "horizontal") {
      const width = el.clientWidth || window.innerWidth;
      const distanceProgress = Math.abs(dx) / width;
      const velocity = Math.abs(dx) / Math.max(elapsed, 1);

      if (distanceProgress >= SWIPE_COMPLETE_DISTANCE || velocity >= SWIPE_VELOCITY_THRESHOLD) {
        // Complete — no off‑screen animation, transitionToStory handles the cross‑fade
        setPaused(false);
        completeDrag(dx < 0 ? "next" : "prev");
      } else {
        // Cancel: animate back
        cancelDrag();
      }
      gestureRef.current = null;
      suppressClickRef.current = performance.now() + 350;
      return;
    }

    // ═══ Tap (only if not dragged, not long press) ═══
    if (!g.moved && elapsed < TAP_MAX_MS && performance.now() > suppressClickRef.current) {
      const rect = el.getBoundingClientRect();
      const zoneX = e.clientX - rect.left;
      const zoneW = el.clientWidth;
      if (zoneX < zoneW * 0.35) {
        handlePrevious();
      } else {
        handleNext();
      }
    }

    gestureRef.current = null;
  }, [handleNext, handlePrevious, cancelDrag]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const t = el.dataset.lpTimer;
    if (t) { clearTimeout(Number(t)); delete el.dataset.lpTimer; }
    if (gestureRef.current) {
      gestureRef.current = null;
    }
    setPaused(false);
    progressFrozenRef.current = false;
    setLongPressActive(false);
    cancelDrag();
    if (frameRef.current) {
      frameRef.current.style.transform = "";
      frameRef.current.style.borderRadius = "";
      frameRef.current.style.opacity = "";
      frameRef.current.style.transition = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: render progress bars ──

  function renderProgressBars(prog: number[], activeIdx: number, isTransitioning: boolean) {
    return (
      <div className="story-chrome" style={{
        position: "absolute", zIndex: 60,
        top: "calc(env(safe-area-inset-top,0px) + 7px)",
        left: 10, right: 10,
        display: "flex", gap: 3,
        pointerEvents: "none",
        transition: "opacity 120ms ease",
        opacity: longPressActive ? 0 : 1,
      }}>
        {prog.map((val, idx) => (
          <div key={idx} style={{
            flex: 1, height: 2.2, borderRadius: 999, overflow: "hidden",
            background: "rgba(255,255,255,.34)",
          }}>
            <div style={{
              height: "100%", borderRadius: "inherit",
              background: "rgba(255,255,255,.96)",
              width: "100%",
              willChange: "transform",
              transform: `scaleX(${Math.min(val || 0, 100) / 100})`,
              transformOrigin: "left center",
              transition: isTransitioning
                ? "none"
                : idx === activeIdx && !paused
                  ? "transform 0.05s linear"
                  : `transform 220ms ${APPLE_SPRING}`,
            }} />
          </div>
        ))}
      </div>
    );
  }

  function renderHeader(c: typeof characters[number]) {
    return (
      <div className="story-chrome" style={{
        position: "absolute", zIndex: 60,
        top: "calc(env(safe-area-inset-top,0px) + 7px + 2px + 9px + 2px)",
        left: 10, right: 10,
        display: "flex", alignItems: "center", minHeight: 38,
        transition: "opacity 120ms ease",
        opacity: longPressActive ? 0 : 1,
      }} data-story-interactive>
        <img src={c.avatar} alt="" loading="eager" fetchPriority="high" style={{
          width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flex: "0 0 auto",
          border: "1.5px solid rgba(255,255,255,.85)",
        }} />
        <span style={{
          marginLeft: 9, fontFamily: font, fontSize: 13.5, lineHeight: "17px",
          fontWeight: 600, color: "#fff",
          textShadow: "0 1px 2px rgba(0,0,0,.4)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {c.name}
        </span>
        <span style={{
          marginLeft: 6, fontFamily: font, fontSize: 12.5, lineHeight: "17px", fontWeight: 400,
          color: "rgba(255,255,255,.72)",
          textShadow: "0 1px 2px rgba(0,0,0,.35)",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {timeAgo}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <button aria-label="Cerrar" data-story-interactive
            onClick={(e) => { e.stopPropagation(); startViewerClose("down") }}
            className="story-action-button"
            style={{ pointerEvents: "auto" }}
          >
            <CloseSvg />
          </button>
        </div>
      </div>
    );
  }

  // ── Helper: render full story frame ──

  function renderFrame(ci: number, si: number, ref?: React.Ref<HTMLDivElement>, extraStyle?: React.CSSProperties, dataState?: string, snapshot?: { url: string; charIdx: number; imgIdx: number } | null) {
    const c = characters[ci];
    const imgUrl = c.images[si];
    return (
      <div ref={ref} className="story-mobile-frame"
        data-long-press={longPressActive ? "true" : undefined}
        style={{ touchAction: "none", overflow: "hidden", position: "relative", zIndex: 2, ...extraStyle }}
      >
        {/* Media layer (active / new image) */}
        <div className="story-media-layer" data-state={dataState ?? "active"} style={{ position: "absolute", inset: 0, zIndex: 2, background: "#000" }}>
          <div style={{ position: "absolute", inset: "-30px", backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(24px) brightness(0.4)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none" }} />
        </div>

        {/* Cross‑fade overlay (old image fading out) — only during story transition */}
        {snapshot && (
          <div className="story-media-layer" style={{
            position: "absolute", inset: 0, zIndex: 4, background: "#000", pointerEvents: "none",
            animation: `cf-out ${STORY_FADE_MS}ms ease-out forwards`,
          }}>
            <div style={{ position: "absolute", inset: "-30px", backgroundImage: `url(${snapshot.url})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(24px) brightness(0.4)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${snapshot.url})`, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none" }} />
          </div>
        )}

        {/* Top gradient */}
        <div className="story-chrome" style={{
          position: "absolute", zIndex: 25, inset: "0 0 auto", height: 145,
          background: "linear-gradient(to bottom,rgba(0,0,0,.64) 0%,rgba(0,0,0,.29) 55%,transparent 100%)",
          pointerEvents: "none", transition: "opacity 120ms ease", opacity: longPressActive ? 0 : 1,
        }} />

        {/* Bottom gradient */}
        <div className="story-chrome" style={{
          position: "absolute", zIndex: 30, left: 0, right: 0, bottom: 0, height: 180,
          background: "linear-gradient(to top,rgba(0,0,0,.62) 0%,rgba(0,0,0,.28) 46%,rgba(0,0,0,.08) 72%,transparent 100%)",
          pointerEvents: "none", transition: "opacity 120ms ease", opacity: longPressActive ? 0 : 1,
        }} />

        {/* Keyboard overlay */}
        <div style={{
          position: "absolute", zIndex: 35, inset: 0,
          background: "rgba(0,0,0,.18)",
          opacity: isComposerFocused && keyboardInset > 100 ? 1 : 0,
          pointerEvents: "none",
          transition: `opacity 170ms ${APPLE_SPRING}`,
        }} />

        {/* Progress bars */}
        {renderProgressBars(progress, si, !!incomingChar)}

        {/* Header */}
        {renderHeader(c)}

        {/* Bottom UI */}
        <div data-story-interactive
          className="story-chrome"
          style={{
            position: "absolute", zIndex: 60, left: 0, right: 0, touchAction: "none",
            bottom: keyboardInset > 100 ? keyboardInset : 0,
            transition: `opacity 120ms ease, bottom 200ms ${APPLE_SPRING}`,
            opacity: longPressActive ? 0 : 1,
          }}
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
          onPointerUp={(e) => { e.preventDefault(); e.stopPropagation() }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          onTouchStart={(e) => { e.preventDefault(); e.stopPropagation() }}
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          {isComposerFocused && keyboardInset > 100 && (
            <div style={{
              display: "flex", justifyContent: "center", gap: 4,
              padding: "0 13px 8px",
              animation: `qrs 220ms ${APPLE_SPRING} forwards`,
            }}>
              {QUICK_REACTIONS.map((emoji) => (
                <button key={emoji} data-story-interactive
                  onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); sendReaction(emoji, r.left + r.width / 2, r.top + r.height / 2) }}
                  style={{
                    width: 44, height: 44, display: "grid", placeItems: "center", padding: 0, border: 0,
                    borderRadius: "50%", background: "rgba(255,255,255,.14)",
                    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
                    fontFamily: eFont, fontSize: 22, WebkitTapHighlightColor: "transparent",
                    cursor: "pointer", pointerEvents: "auto", transition: `transform 160ms ${APPLE_SPRING}`,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px max(16px, env(safe-area-inset-bottom,0px))",
          }}>
            <div data-story-interactive
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); if (document.activeElement !== hiddenInputRef.current) hiddenInputRef.current?.focus({ preventScroll: true }); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
              style={{
                flex: 1, height: 41, minWidth: 0, display: "flex", alignItems: "center",
                padding: "0 15px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,.44)",
                background: "rgba(8,8,8,.14)",
                backdropFilter: "blur(12px) saturate(120%)",
                WebkitBackdropFilter: "blur(12px) saturate(120%)",
                cursor: "text", touchAction: "none",
                color: message ? "#fff" : "rgba(255,255,255,.72)",
                fontFamily: font, fontSize: 14, lineHeight: "20px", fontWeight: 400,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                transition: `border-color 180ms ${APPLE_SPRING}, background 180ms ${APPLE_SPRING}`,
              }}
            >
              {message || "Enviar mensaje..."}
            </div>
            {message.trim() && (
              <button aria-label="Enviar" data-story-interactive
                onPointerDown={(e) => { e.stopPropagation() }}
                onClick={(e) => { e.stopPropagation(); handleSend() }}
                disabled={isSending}
                className="story-action-button"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <SendSvg />
              </button>
            )}
            <button ref={heartBtnRef} aria-label="Reaccionar" data-story-interactive
              onPointerDown={(e) => { e.stopPropagation(); handleHeartDown(e as any) }}
              onPointerUp={(e) => { e.stopPropagation(); handleHeartUp(e as any) }}
              onPointerCancel={(e) => { e.stopPropagation(); handleHeartCancel() }}
              onPointerLeave={(e) => { e.stopPropagation(); handleHeartCancel() }}
              className="story-action-button"
              style={{ color: isLiked ? "#ff304f" : "#fff" }}
            >
              <HeartSvg filled={isLiked} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ──

  const storyContent = (
    <>
      <style>{`
        @keyframes lp{0%{opacity:0;transform:translate3d(0,4px,0) scale(.55)}25%{opacity:1;transform:translate3d(0,-4px,0) scale(1.12)}100%{opacity:0;transform:translate3d(0,-52px,0) scale(.78)}}
        @keyframes ef{0%{opacity:0;transform:translate3d(-50%,0,0) scale(.55) rotate(-5deg)}22%{opacity:1;transform:translate3d(-50%,-14px,0) scale(1.15) rotate(3deg)}100%{opacity:0;transform:translate3d(calc(-50% + 12px),-125px,0) scale(.84) rotate(-3deg)}}
        @keyframes mc{0%{opacity:0;transform:translateX(-50%) translateY(6px) scale(.92)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}70%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-4px) scale(.95)}}
        @keyframes hp{0%{transform:scale(1)}35%{transform:scale(1.28)}65%{transform:scale(.92)}100%{transform:scale(1)}}
        @keyframes qrs{0%{opacity:0;transform:translateY(12px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes cf-out{from{opacity:1}to{opacity:0}}
        @keyframes close-open{from{opacity:.92}to{opacity:1}}
        @keyframes close-open{from{opacity:.92}to{opacity:1}}
        .story-desktop-shell{position:fixed;inset:0;z-index:9999;display:flex;justify-content:center;align-items:center;overflow:hidden;background:#000;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;overscroll-behavior:none;height:100vh;height:100dvh;min-height:100dvh;animation:close-open 100ms ease-out both}
        .story-desktop-shell.is-closing-down{animation:none;transform:translate3d(0,105%,0);opacity:0;transition:transform 260ms cubic-bezier(.32,.72,0,1),opacity 220ms ease}
        .story-desktop-shell.is-closing-right{animation:none;transform:translate3d(105%,0,0);opacity:0;transition:transform 250ms cubic-bezier(.32,.72,0,1),opacity 210ms ease}
        @keyframes sc-left{from{transform:translateX(0) rotateY(0deg)}to{transform:translateX(-48%) rotateY(72deg)}}
        @keyframes si-right{from{transform:translateX(48%) rotateY(-72deg)}to{transform:translateX(0) rotateY(0deg)}}
        @keyframes sc-right{from{transform:translateX(0) rotateY(0deg)}to{transform:translateX(48%) rotateY(-72deg)}}
        @keyframes si-left{from{transform:translateX(-48%) rotateY(72deg)}to{transform:translateX(0) rotateY(0deg)}}
        .story-desktop-shell img{-webkit-touch-callout:none;pointer-events:none}
        .story-blurred-background{position:absolute;inset:-40px;background-position:center;background-size:cover;filter:blur(28px);transform:scale(1.08);opacity:0.55;pointer-events:none;will-change:background-image}
        .story-action-button{width:40px;height:40px;display:grid;place-items:center;padding:0;border:0;background:transparent;color:#fff;-webkit-tap-highlight-color:transparent;cursor:pointer;transition:transform 160ms ${APPLE_SPRING}}
        .story-action-button:active{transform:scale(.88)}
        .story-mobile-frame{position:relative;width:min(430px,calc(100vw - 32px));height:100vh;height:100dvh;min-height:100dvh;overflow:hidden;background:#000;border-radius:14px;box-shadow:0 20px 70px rgba(0,0,0,.55);will-change:transform}
        .story-media-layer{opacity:0;transform:translate3d(0,0,0) scale(1);background:#000}
        .story-media-layer[data-state="active"]{opacity:1;transform:translate3d(0,0,0) scale(1)}
        .story-chrome{transition:opacity 170ms ease}
        .story-perspective{position:absolute;inset:0;z-index:2;overflow:hidden;background:#000;perspective:1100px}
        .story-face{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:#000;backface-visibility:hidden;will-change:transform;transform-style:preserve-3d}
        .story-face.is-next{animation:sc-left 290ms cubic-bezier(.32,.72,0,1) both}
        .story-face--incoming.is-next{animation:si-right 290ms cubic-bezier(.32,.72,0,1) both}
        .story-face.is-prev{animation:sc-right 290ms cubic-bezier(.32,.72,0,1) both}
        .story-face--incoming.is-prev{animation:si-left 290ms cubic-bezier(.32,.72,0,1) both}
        .story-face--incoming{transform-origin:right center}
        .story-face.is-prev{transform-origin:right center}
        .story-face--incoming.is-prev{transform-origin:left center}

        @media(max-width:767px){.story-desktop-shell{display:block}.story-blurred-background{display:none}.story-mobile-frame{width:100%!important;max-width:none!important;aspect-ratio:auto!important;border-radius:0!important;box-shadow:none!important}}
      `}</style>

      {/* Hidden input */}
      <input ref={hiddenInputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setIsComposerFocused(true)}
        onBlur={() => { setIsComposerFocused(false); setKeyboardInset(0); }}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        inputMode="text" autoComplete="off"
        style={{
          position: "fixed", top: 1, left: 1, width: 2, height: 2,
          opacity: 0.01, fontSize: 16, border: 0, padding: 0, margin: 0,
          zIndex: 10001, pointerEvents: "none",
        }}
      />

      <div ref={rootRef} className={"story-desktop-shell" + (closeDirection === "down" ? " is-closing-down" : closeDirection === "right" ? " is-closing-right" : "")}
        style={{ fontFamily: font, WebkitFontSmoothing: "antialiased" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        onTransitionEnd={handleCloseEnd}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.38)", pointerEvents: "none", zIndex: 1 }} />

        {/* Blurred background behind the frame */}
        {!incomingChar && (
          <div className="story-blurred-background" style={{ backgroundImage: `url(${currentChar.images[currentIndex]})` }} />
        )}

        {incomingChar ? (
          /* ── CUBE TRANSITION: two faces ── */
          <div className="story-perspective">
            <div className={"story-face" + (incomingChar.direction === "next" ? " is-next" : " is-prev")}
              onAnimationEnd={(e) => { if (e.animationName === "sc-left" || e.animationName === "sc-right") finishCubeTransition(); }}
            >
              {renderFrame(charIndex, currentIndex)}
            </div>
            <div className={"story-face story-face--incoming" + (incomingChar.direction === "next" ? " is-next" : " is-prev")}
              onAnimationEnd={(e) => { if (e.animationName === "si-right" || e.animationName === "si-left") finishCubeTransition(); }}
            >
              {renderFrame(incomingChar.charIdx, incomingChar.storyIdx)}
            </div>
          </div>
        ) : (
          /* ── NORMAL: single frame with optional cross‑fade overlay ── */
          (() => {
            const snap = exitSnapshotRef.current;
            const snapUrl = snap ? characters[snap.charIdx]?.images[snap.imgIdx] ?? "" : null;
            return renderFrame(charIndex, currentIndex, frameRef,
              undefined, undefined,
              snap && snapUrl ? { url: snapUrl, charIdx: snap.charIdx, imgIdx: snap.imgIdx } : null
            );
          })()
        )}

        {/* ═══ SHARED OVERLAYS ═══ */}
        {reactionPickerOpen && (
          <div style={{ position: "absolute", zIndex: 65, inset: 0, background: "rgba(0,0,0,.26)", pointerEvents: "none" }} />
        )}
        <div style={{
          position: "absolute", zIndex: 75, left: "50%",
          bottom: `${keyboardInset > 100 ? keyboardInset + 122 : 122}px`,
          transform: reactionPickerOpen ? "translateX(-50%) translateY(0) scale(1)" : "translateX(-50%) translateY(8px) scale(.96)",
          opacity: reactionPickerOpen ? 1 : 0,
          pointerEvents: reactionPickerOpen ? "auto" : "none",
          transition: `opacity 200ms ${APPLE_SPRING}, transform 200ms ${APPLE_SPRING}`,
          width: "min(78vw,330px)",
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", rowGap: 24, columnGap: 28,
        }}>
          {HOLD_REACTIONS.map((emoji) => (
            <button key={emoji} data-re={emoji} aria-label={emoji} data-story-interactive
              data-active={highlightedReaction === emoji ? "true" : undefined}
              onClick={(e) => { e.stopPropagation() }}
              style={{
                width: 74, height: 74, display: "grid", placeItems: "center", padding: 0, border: 0,
                background: "transparent", fontFamily: eFont, fontSize: 58, lineHeight: 1,
                WebkitTapHighlightColor: "transparent", touchAction: "none", cursor: "pointer",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
        {likeParticles.map((p) => (
          <div key={p.id} style={{
            position: "absolute", left: p.x - 12, top: p.y - 12, width: 24, height: 24,
            color: "#ff304f", pointerEvents: "none", zIndex: 80,
            animation: "lp 650ms cubic-bezier(.18,.75,.25,1) forwards",
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#ff304f" stroke="none" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
          </div>
        ))}
        {floatingEmojis.map((fe) => (
          <div key={fe.id} style={{
            position: "absolute", zIndex: 95, left: fe.x - 17, top: fe.y - 17,
            fontFamily: eFont, fontSize: 34, lineHeight: 1, pointerEvents: "none",
            animation: "ef 820ms cubic-bezier(.2,.74,.24,1) forwards",
          }}>
            {fe.emoji}
          </div>
        ))}
        {msgConfirm && (
          <div style={{
            position: "absolute", left: "50%", bottom: 72, transform: "translateX(-50%)",
            padding: "6px 10px", borderRadius: 999, color: "#fff", background: "rgba(24,24,24,.72)",
            fontFamily: font, fontSize: 11, fontWeight: 500, pointerEvents: "none", whiteSpace: "nowrap",
            animation: "mc 800ms ease-out forwards",
          }}>
            {msgConfirm}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(storyContent, document.body);
}
