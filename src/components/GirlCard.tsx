"use client";

import { useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const cardGradients: Record<string, string> = {
  luna: "from-pink-500/30 via-purple-500/20 to-transparent",
  nia: "from-purple-500/30 via-pink-500/20 to-transparent",
  vera: "from-emerald-500/25 via-teal-500/15 to-transparent",
  alma: "from-amber-500/25 via-orange-500/15 to-transparent",
  kira: "from-red-500/25 via-rose-500/15 to-transparent",
  maya: "from-indigo-500/25 via-violet-500/15 to-transparent",
  sasha: "from-amber-600/25 via-yellow-500/15 to-transparent",
  yuki: "from-pink-400/25 via-fuchsia-500/15 to-transparent",
};

const personalities = [
  "Romántica", "Directa", "Tranquila", "Gamer", "Misteriosa",
];

const personalityColors: Record<string, string> = {
  carinosa: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  timida: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  atrevida: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  dominante: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

export default function GirlCard({ girl }: { girl: Girl }) {
  const gradient = cardGradients[girl.id] || "from-pink-500/20 to-purple-500/10";
  const [imgFailed, setImgFailed] = useState(false);

  const girlImage = getGirlImage(girl.id, girl.defaultHair, girl.defaultOutfit, girl.defaultBackground);

  return (
    <>
      {/* Mobile compact card */}
      <Link href={`/customize/${girl.id}`} className="block sm:hidden">
        <div className="w-full overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.06] shadow-lg transition-all duration-200 active:scale-[0.97]">
          <div className={`relative h-[220px] w-full bg-gradient-to-b ${gradient}`}>
            {!imgFailed ? (
              <img
                src={girlImage}
                alt={girl.name}
                className="h-full w-full object-cover object-top"
                onError={() => setImgFailed(true)}
              />
            ) : null}
          </div>
          <div className="p-3">
            <h3 className="text-xl font-bold tracking-tight">{girl.name}</h3>
            <p className="mt-0.5 text-xs text-muted/70">{girl.style}</p>
            <Link href={`/chat/${girl.id}`} onClick={(e) => e.stopPropagation()}>
              <span className="mt-3 flex h-[42px] w-full items-center justify-center gap-1.5 rounded-2xl gradient-btn text-sm font-bold transition-all duration-200 active:scale-[0.97]">
                Chat
              </span>
            </Link>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Link href={`/call/${girl.id}`} onClick={(e) => e.stopPropagation()}>
                <span className="flex h-[38px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 active:scale-[0.97]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
              </Link>
              <Link href={`/call/${girl.id}`} onClick={(e) => e.stopPropagation()}>
                <span className="flex h-[38px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 active:scale-[0.97]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </span>
              </Link>
              <Link href={`/customize/${girl.id}`} onClick={(e) => e.stopPropagation()}>
                <span className="flex h-[38px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 active:scale-[0.97]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Link>

      {/* Desktop full card */}
      <div className="hidden sm:block mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-[0_25px_80px_rgba(255,45,180,0.18)]">
        <div className={`relative aspect-[4/5] w-full min-h-[320px] bg-gradient-to-b ${gradient}`}>
          <Link href={`/customize/${girl.id}`}>
            {!imgFailed ? (
              <img
                src={girlImage}
                alt={girl.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-700"
                onError={() => setImgFailed(true)}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08030f] via-[#08030f]/30 to-transparent opacity-80" />
          </Link>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-pink-500/20 px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-pink-300 border border-pink-500/30">
                IA ficticia
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-0.5 text-[0.6rem] text-green-300 border border-green-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </div>
            <Link href={`/customize/${girl.id}`} onClick={(e) => e.stopPropagation()}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 transition-all hover:bg-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </span>
            </Link>
          </div>
        </div>
        <div className="p-5">
          <Link href={`/customize/${girl.id}`}>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{girl.name}</h3>
            <p className="mt-0.5 text-sm text-muted/70">{girl.style}</p>
          </Link>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={`chip ${personalityColors[girl.personality] || "bg-white/10"}`}>
              {personalities[Math.floor(Math.random() * personalities.length)]}
            </span>
            <span className="chip">+18</span>
          </div>
          <p className="mt-3 text-xs text-muted/70 leading-relaxed">{girl.personalityLabel}</p>
          <div className="mt-5 flex flex-col gap-3">
            <Link href={`/chat/${girl.id}`}>
              <button className="flex w-full min-h-[54px] items-center justify-center gap-2 rounded-2xl gradient-btn text-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/25 active:scale-[0.98]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat ahora
              </button>
            </Link>
            <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1">
              <Link href={`/call/${girl.id}`}>
                <button className="flex w-full min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Llamada
                </button>
              </Link>
              <Link href={`/customize/${girl.id}`}>
                <button className="flex w-full min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Personalizar
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
