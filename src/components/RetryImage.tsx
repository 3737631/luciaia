"use client";

import { useState, useEffect, useRef } from "react";

const MAX_RETRIES = 5;
const BASE_DELAY = 2000;

export default function RetryImage({
  src,
  alt,
  accent,
  onLoad,
  style,
  imgStyle,
}: {
  src: string;
  alt: string;
  accent: string;
  onLoad?: () => void;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const tryLoad = () => {
    const img = new Image();
    img.onload = () => {
      setLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(1.5, retriesRef.current);
        retriesRef.current++;
        timerRef.current = setTimeout(tryLoad, delay);
      } else {
        setFailed(true);
      }
    };
    img.src = src;
  };

  useEffect(() => {
    tryLoad();
    return () => clearTimeout(timerRef.current);
  }, [src]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: accent,
        ...style,
      }}
    >
      {loaded && (
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            animation: "retryFadeIn 0.4s ease-out",
            ...imgStyle,
          }}
        />
      )}
      {!loaded && !failed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.15)",
              borderTopColor: "#fff",
              animation: "retrySpin 0.8s linear infinite",
            }}
          />
        </div>
      )}
      {failed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: 11,
          }}
        >
          Sin imagen
        </div>
      )}
      <style>{`
        @keyframes retryFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes retrySpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
