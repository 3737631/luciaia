"use client";

import { useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function GirlCard({ girl }: { girl: Girl }) {
  const [failed, setFailed] = useState(false);
  const custom = getCustomization(girl.id);
  const src = failed
    ? getGirlImage(girl.id)
    : custom
      ? getGirlImage(girl.id, custom.hair, custom.pose, custom.background)
      : getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);

  return (
    <div className="group overflow-hidden rounded-xl bg-[#12121a] border border-white/[0.06]">
      <Link href={`${basePath}/chat/${girl.id}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {failed ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-600/30 to-purple-900/40">
              <span className="text-5xl font-bold text-white/50 select-none">{girl.name.charAt(0)}</span>
            </div>
          ) : (
          <img
            src={src}
            alt={girl.name}
            className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
            onError={() => !failed && setFailed(true)}
          />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute right-2 top-2">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[0.5rem] font-semibold text-white/80 backdrop-blur-sm">
              {girl.age}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-bold text-white">{girl.name}</h3>
            <p className="mt-0.5 text-[0.55rem] text-white/60 leading-tight line-clamp-1">{girl.style}</p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-1.5 p-2.5">
        <Link
          href={`${basePath}/chat/${girl.id}`}
          className="flex flex-1 items-center justify-center rounded-lg bg-white/10 py-2 text-[0.55rem] font-semibold text-white transition hover:bg-white/15 active:scale-[0.97]"
        >
          Chatear
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition hover:border-green-500/30 hover:text-green-400 active:scale-90"
          title="Llamada"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </Link>
        <Link
          href={`${basePath}/call/${girl.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition hover:border-pink-500/30 hover:text-pink-400 active:scale-90"
          title="Videollamada"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </Link>
      </div>
    </div>
  );
}
