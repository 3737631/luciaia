"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

export default function GirlCard({ girl }: { girl: Girl }) {
  const [src, setSrc] = useState("");
  const mountedRef = useRef(true);

  function getUrl() {
    const custom = getCustomization(girl.id);
    if (custom) return getGirlImage(girl.id, custom.hair, custom.pose, custom.background);
    return getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);
  }

  useEffect(() => {
    mountedRef.current = true;
    const url = getUrl();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { if (mountedRef.current) setSrc(url); };
    img.onerror = () => {
      // Retry with different seed
      const retry = url.replace(/seed=\d+/, "seed=" + (Date.now() % 99999 + 1));
      const img2 = new Image();
      img2.crossOrigin = "anonymous";
      img2.onload = () => { if (mountedRef.current) setSrc(retry); };
      img2.onerror = () => { if (mountedRef.current) setSrc(url); };
      img2.src = retry;
    };
    img.src = url;
    return () => { mountedRef.current = false; };
  }, [girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground]);

  return (
    <div className="group character-card overflow-hidden">
      <Link href={`/customize/${girl.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#12121a]">
          <img
            src={src}
            alt={girl.name}
            fetchPriority="high"
            className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
            style={{ opacity: src ? 1 : 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
            <span className="flex h-4 w-4 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-pulse border-2 border-black/30" />
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.location.href = `/customize/${girl.id}`; }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-pink/60 hover:text-white transition-all active:scale-90"
              title="Personalizar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h3
              className="font-black leading-none tracking-tighter text-white sm:leading-[28px]"
              style={{
                fontSize: "clamp(18px, 5vw, 25px)",
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                letterSpacing: "-0.02em",
              }}
            >
              {girl.name}{" "}
              <span className="font-bold text-white/90">{girl.age}</span>
            </h3>
            <p
              className="mt-1.5 leading-snug text-white/85 line-clamp-2 sm:leading-snug"
              style={{
                fontSize: "clamp(12px, 3vw, 15px)",
                textShadow: "0 1px 8px rgba(0,0,0,0.6)",
              }}
            >
              {girl.story}
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-1.5 p-3 sm:p-4">
        <Link href={`/chat/${girl.id}`} className="btn-primary flex h-9 flex-1 items-center justify-center text-[0.6rem] font-bold sm:text-xs">
          Chatear
        </Link>
        <Link href={`/call/${girl.id}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-500/30 bg-green-500/20 text-green-400 transition hover:bg-green-500/30 sm:w-10" title="Llamada">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </Link>
        <Link href={`/call/${girl.id}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/20 text-pink-400 transition hover:bg-pink-500/30 sm:w-10" title="Videollamada">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </Link>
      </div>
    </div>
  );
}