"use client";

import { useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

export default function GirlCard({ girl }: { girl: Girl }) {
  const [imgFailed, setImgFailed] = useState(false);
  const girlImage = getGirlImage(girl.id, girl.defaultHair, girl.defaultOutfit, girl.defaultBackground);

  return (
    <div className="group character-card overflow-hidden">
      <Link href={`/customize/${girl.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {!imgFailed ? (
            <img
              src={girlImage}
              alt={girl.name}
              className="h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#101018]">
              <span className="text-[0.6rem] text-muted">Sin imagen</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute left-3 right-3 top-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[0.5rem] font-medium text-green-400 border border-green-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[0.5rem] font-medium text-muted border border-white/[0.10]">+18</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="text-lg font-bold tracking-tight drop-shadow-lg sm:text-xl">{girl.name}</h3>
            <p className="text-[0.6rem] text-white/70 drop-shadow sm:text-xs">{girl.style}</p>
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-3 sm:p-4">
        <p className="text-[0.6rem] leading-relaxed text-muted line-clamp-2 sm:text-xs">{girl.personalityLabel}</p>
        <div className="flex gap-2">
          <Link href={`/chat/${girl.id}`} className="btn-primary flex h-9 flex-1 items-center justify-center text-[0.6rem] font-bold sm:text-xs">
            Chatear ahora
          </Link>
          <Link
            href={`/customize/${girl.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-muted transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.97] sm:w-10"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
