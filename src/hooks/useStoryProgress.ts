"use client";

import { useRef, useEffect, useState } from "react";

export function useStoryProgress({
  paused,
  duration,
  onComplete,
  resetKey,
}: {
  paused: boolean;
  duration: number;
  onComplete: () => void;
  resetKey: number;
}) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);
  const rafRef = useRef(0);
  const pausedRef = useRef(paused);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  pausedRef.current = paused;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setProgress(0);
    startRef.current = 0;
    accumulatedRef.current = 0;
    completedRef.current = false;

    const tick = (now: number) => {
      if (completedRef.current) return;

      if (pausedRef.current) {
        if (startRef.current > 0) {
          accumulatedRef.current += now - startRef.current;
          startRef.current = 0;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (startRef.current === 0) {
        startRef.current = now;
      }

      const elapsed = accumulatedRef.current + (now - startRef.current);
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        completedRef.current = true;
        onCompleteRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      completedRef.current = true;
    };
  }, [resetKey, duration]);

  return progress;
}
