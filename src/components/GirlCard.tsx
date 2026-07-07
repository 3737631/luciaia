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

export default function GirlCard({ girl }: { girl: Girl }) {
  const gradient = cardGradients[girl.id] || "from-pink-500/20 to-purple-500/10";
  const [imgFailed, setImgFailed] = useState(false);
  const girlImage = getGirlImage(girl.id, girl.defaultHair, girl.defaultOutfit, girl.defaultBackground);

  return (
    <div className="group w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-lg transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,45,180,0.12)] hover:border-white/15">
      <Link href={`/customize/${girl.id}`}>
        <div className={`relative h-52 w-full bg-gradient-to-b ${gradient} sm:h-64`}>
          {!imgFailed ? (
            <img
              src={girlImage}
              alt={girl.name}
              className="h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08030f] via-[#08030f]/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold tracking-tight drop-shadow-lg sm:text-xl">{girl.name}</h3>
            <p className="text-xs text-white/70 drop-shadow sm:text-sm">{girl.style}</p>
          </div>
        </div>
      </Link>
      <div className="space-y-2.5 p-3 sm:p-4">
        <p className="text-xs leading-relaxed text-muted/70 line-clamp-2 sm:text-sm">{girl.personalityLabel}</p>
        <div className="flex items-center gap-2">
          <Link href={`/chat/${girl.id}`} className="flex-1">
            <span className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl gradient-btn text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20 active:scale-[0.97] sm:h-11">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat
            </span>
          </Link>
          <Link href={`/call/${girl.id}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-200 hover:bg-white/10 active:scale-[0.97] sm:h-11 sm:w-11">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
          </Link>
          <Link href={`/customize/${girl.id}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-200 hover:bg-white/10 active:scale-[0.97] sm:h-11 sm:w-11">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
