"use client";

import Link from "next/link";
import { Girl } from "@/data/girls";

export default function GirlCard({ girl }: { girl: Girl }) {
  return (
    <div className="group rounded-xl2 card-surface overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:border-pink/50 hover:shadow-glow">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/20">
        <img
          src={girl.image}
          alt={girl.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{girl.name}</h3>
          <p className="text-sm text-white/80 drop-shadow">{girl.style}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted mb-3">{girl.personalityLabel}</p>
        <div className="flex flex-col gap-2">
          <Link href={`/chat/${girl.id}`}>
            <button className="w-full rounded-xl gradient-btn py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95">
              Chat
            </button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/call/${girl.id}`} className="flex-1">
              <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95">
                Videollamada
              </button>
            </Link>
            <Link href={`/customize/${girl.id}`} className="flex-1">
              <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95">
                Personalizar
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
