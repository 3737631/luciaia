"use client";

import { useState, useEffect } from "react";

const KEYBOARD_THRESHOLD = 150;

export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportTop, setViewportTop] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handle = () => {
      const vh = vv.height;
      const vt = vv.offsetTop || 0;
      const diff = window.innerHeight - vh - vt;
      const open = diff > KEYBOARD_THRESHOLD;
      const kh = open ? diff : 0;
      setViewportHeight(vh);
      setViewportTop(vt);
      setKeyboardHeight(kh);
      setIsKeyboardOpen(open);
    };

    vv.addEventListener("resize", handle);
    vv.addEventListener("scroll", handle);
    handle();
    return () => {
      vv.removeEventListener("resize", handle);
      vv.removeEventListener("scroll", handle);
    };
  }, []);

  return { viewportHeight, viewportTop, keyboardHeight, isKeyboardOpen };
}
