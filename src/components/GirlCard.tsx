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
    <div className="girl-card">
      <div className={`relative aspect-[4/3] w-full bg-gradient-to-b ${gradient} overflow-hidden`}>
        {!imgFailed ? (
          <img
            src={girlImage}
            alt={girl.name}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            onError={() => setImgFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08030f] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-pink-300 border border-pink-500/30">
              IA ficticia
            </span>
            <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[0.6rem] text-green-300 border border-green-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Online
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{girl.name}</h3>
            <p className="text-xs text-muted">{girl.style}</p>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className={`chip ${personalityColors[girl.personality] || "bg-white/10"}`}>
            {personalities[Math.floor(Math.random() * personalities.length)]}
          </span>
          <span className="chip">+18</span>
        </div>
        <p className="mb-3 text-xs text-muted leading-relaxed">{girl.personalityLabel}</p>
        <div className="flex flex-col gap-2">
          <Link href={`/chat/${girl.id}`}>
            <button className="w-full rounded-xl gradient-btn py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat ahora
            </button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/call/${girl.id}`} className="flex-1">
              <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Videollamada
              </button>
            </Link>
            <Link href={`/customize/${girl.id}`} className="flex-1">
              <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Personalizar
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
