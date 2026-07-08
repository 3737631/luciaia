"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomGirlData } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";

export default function CustomGirlCard({ data }: { data: CustomGirlData }) {
  const [imgFailed, setImgFailed] = useState(false);
  const girlImage = getGirlImage(data.baseId || "luna", data.hair, data.pose, data.background);

  return (
    <div className="group character-card overflow-hidden">
      <Link href={`/chat/luna`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {!imgFailed ? (
            <img
              src={girlImage}
              alt={data.name}
              className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#101018]">
              <span className="text-[0.6rem] text-muted">Sin imagen</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-[0.5rem] font-medium text-green-400 border border-green-500/30">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)] animate-pulse" />
                Online
              </span>
            </div>
            <span className="rounded-full border border-pink-400/40 bg-gradient-to-r from-pink-500/40 to-purple-500/30 px-2.5 py-0.5 text-[0.5rem] font-bold tracking-wide uppercase text-pink-300">
              PERSONALIZADO
            </span>
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
              {data.name}{" "}
              <span className="font-bold text-white/90">{data.age}</span>
            </h3>
            <p
              className="mt-1.5 leading-snug text-white/85 line-clamp-2 sm:leading-snug"
              style={{
                fontSize: "clamp(12px, 3vw, 15px)",
                textShadow: "0 1px 8px rgba(0,0,0,0.6)",
              }}
            >
              {data.story || data.description}
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-1.5 p-3 sm:p-4">
        <Link href={`/chat/luna`} className="btn-primary flex h-9 flex-1 items-center justify-center text-[0.6rem] font-bold sm:text-xs">
          Chatear
        </Link>
      </div>
    </div>
  );
}
