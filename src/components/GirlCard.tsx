"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function GirlCard({ girl }: { girl: Girl }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [girlImage, setGirlImage] = useState(getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground));

  function getImage() {
    const custom = getCustomization(girl.id);
    if (custom) return getGirlImage(girl.id, custom.hair, custom.pose, custom.background);
    return getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);
  }

  useEffect(() => {
    setImgFailed(false);
    setGirlImage(getImage());
  }, [girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground]);

  return (
    <div className="group character-card overflow-hidden">
      <Link href={`${basePath}/customize/${girl.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {!imgFailed ? (
            <>
              <img
                src={girlImage}
                alt={girl.name}
                className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-110"
                onError={() => setImgFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/30 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#121218]">
              <span className="text-[0.6rem] text-muted">Sin imagen</span>
            </div>
          )}
          <div className="absolute left-3 top-3 z-10">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30D158] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#30D158] shadow-[0_0_12px_rgba(48,209,88,0.8)]" />
            </span>
          </div>
          {girl.badge && (
            <div className="absolute right-3 top-3 z-10">
              <span className="rounded-full bg-[#FF3C88]/90 px-2.5 py-0.5 text-[0.5rem] font-bold text-white shadow-[0_0_16px_rgba(255,60,136,0.4)] backdrop-blur-sm">
                {girl.badge}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="font-black leading-none tracking-tighter text-white" style={{ fontSize: "clamp(20px, 5vw, 26px)", textShadow: "0 2px 12px rgba(0,0,0,0.8)", letterSpacing: "-0.02em" }}>
              {girl.name} <span className="font-bold text-white/80" style={{ fontSize: "0.7em" }}>{girl.age}</span>
            </h3>
            <p className="mt-1.5 text-xs leading-snug text-white/70 line-clamp-2 sm:text-sm" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {girl.story}
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2 p-3 sm:p-4" style={{ background: "var(--bg-card)" }}>
        <Link href={`${basePath}/chat/${girl.id}`} className="btn-primary flex h-9 flex-1 items-center justify-center text-[0.6rem] font-bold sm:text-xs">
          Chatear
        </Link>
        <Link href={`${basePath}/call/${girl.id}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#30D158]/30 bg-[#30D158]/15 text-[#30D158] transition-all hover:bg-[#30D158]/25 active:scale-90" title="Llamada">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </Link>
        <Link href={`${basePath}/call/${girl.id}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#FF3C88]/30 bg-[#FF3C88]/15 text-[#FF3C88] transition-all hover:bg-[#FF3C88]/25 active:scale-90" title="Videollamada">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </Link>
      </div>
    </div>
  );
}
