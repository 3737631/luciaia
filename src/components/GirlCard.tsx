"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Girl } from "@/data/girls";
import { getGirlImage } from "@/lib/images";
import { getCustomization } from "@/lib/storage";

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
  }, [girl.id]);

  return (
    <div className="group overflow-hidden animate-card-fade" style={{ borderRadius: 14, background: "#15151b", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        {!imgFailed ? (
          <>
            <img
              src={girlImage}
              alt={girl.name}
              className="h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#15151b]">
            <span className="text-[0.5rem] text-[#a1a1aa]">Sin imagen</span>
          </div>
        )}
        {girl.badge && (
          <div className="absolute left-2 top-2 z-10">
            <span className="rounded-full bg-[#FF3B86]/90 px-2 py-0.5 text-[0.4rem] font-bold text-white shadow-[0_0_12px_rgba(255,59,134,0.4)]">
              {girl.badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          <h3 className="font-bold text-white" style={{ fontSize: "clamp(14px, 4vw, 18px)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
            {girl.name} <span className="font-normal text-white/60" style={{ fontSize: "0.65em" }}>{girl.age}</span>
          </h3>
          <p className="text-[0.55rem] leading-tight text-white/60 line-clamp-2 mt-0.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
            {girl.story}
          </p>
        </div>
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30D158] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30D158]" />
          </span>
        </div>
      </div>
      <div className="p-2" style={{ background: "#15151b" }}>
        <Link
          href={`/chat/${girl.id}`}
          className="btn-primary flex h-8 w-full items-center justify-center text-[0.5rem] font-bold active:scale-95"
        >
          Chatear
        </Link>
      </div>
    </div>
  );
}