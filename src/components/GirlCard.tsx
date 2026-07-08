"use client";

import { useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";

const badgeColors: Record<string, string> = {
  Series: "bg-gradient-to-r from-purple-500/40 to-pink-500/30 border-purple-400/40 text-purple-300",
  Nuevo: "bg-gradient-to-r from-green-500/40 to-emerald-500/30 border-green-400/40 text-green-300",
  Popular: "bg-gradient-to-r from-pink-500/40 to-orange-500/30 border-pink-400/40 text-pink-300",
};

export default function GirlCard({ girl }: { girl: Girl }) {
  const [imgFailed, setImgFailed] = useState(false);
  const girlImage = getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground);

  return (
    <div className="group character-card overflow-hidden">
      <Link href={`/customize/${girl.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {!imgFailed ? (
            <img
              src={girlImage}
              alt={girl.name}
              className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#101018]">
              <span className="text-[0.6rem] text-muted">Sin imagen</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Top badges */}
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[0.5rem] font-medium text-green-400 border border-green-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[0.5rem] font-medium text-muted border border-white/[0.10]">+18</span>
            </div>
            {girl.badge && (
              <span className={`rounded-full border px-2.5 py-0.5 text-[0.5rem] font-bold tracking-wide uppercase ${badgeColors[girl.badge] || badgeColors.Popular}`}>
                {girl.badge}
              </span>
            )}
          </div>
          {/* Bottom text overlay */}
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
      <div className="space-y-3 p-3 sm:p-4">
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
