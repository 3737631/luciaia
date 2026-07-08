"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomGirlData, deleteCustomGirl } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";

const accentColors: Record<string, string> = {
  luna: "#ff2d95", nia: "#38bdf8", vera: "#8b5cf6", alma: "#ff7a45",
  kira: "#a78bfa", maya: "#ec4899", sasha: "#d97706", yuki: "#f472b6",
};

export default function CustomGirlCard({ data, onDelete }: { data: CustomGirlData; onDelete?: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const imgSrc = data.imageUrl || getGirlImage(data.baseId || "luna", data.hair, data.pose, data.background);
  const accent = accentColors[data.baseId] || "#ff2d95";

  function handleClick() {
    localStorage.setItem(
      "custom_scenario",
      JSON.stringify({ girl: data.girlDesc, roleplay: data.roleplayDesc }),
    );
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    deleteCustomGirl(data.id);
    onDelete?.();
  }

  return (
    <div className="group character-card overflow-hidden">
      <Link href={`/chat/luna`} onClick={handleClick} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {!imgFailed ? (
            <img
              src={imgSrc}
              alt={data.name}
              className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#16161d] to-[#0b0b0f] p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${accent}22` }}>
                <span className="text-3xl font-black" style={{ color: accent }}>{data.name[0]}</span>
              </div>
              <p className="text-[0.55rem] leading-tight text-white/40 line-clamp-3">{data.girlDesc || data.description}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute left-2 right-2 top-2 z-10 flex items-start justify-between">
            <span className="flex h-4 w-4 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-pulse border-2 border-black/30" />
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-pink-400/40 bg-gradient-to-r from-pink-500/40 to-purple-500/30 px-2 py-0.5 text-[0.5rem] font-bold tracking-wide uppercase text-pink-300">
                CREADA
              </span>
              <button
                onClick={handleDelete}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/30 border border-red-400/40 text-red-300 hover:bg-red-500/50 hover:text-red-200 transition-all active:scale-90 shadow-lg"
                title="Eliminar"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5">
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
        <Link href={`/chat/luna`} onClick={handleClick} className="btn-primary flex h-9 flex-1 items-center justify-center text-[0.6rem] font-bold sm:text-xs">
          Chatear
        </Link>
      </div>
    </div>
  );
}
