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
    <div
      className="overflow-hidden fade-in"
      style={{
        borderRadius: 16,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        {!imgFailed ? (
          <>
            <img
              src={girlImage}
              alt={girl.name}
              className="h-full w-full object-cover object-top transition-all duration-[250ms] group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.5), transparent)" }} />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.45rem" }}>Sin imagen</span>
          </div>
        )}
        {girl.badge && (
          <div className="absolute left-2.5 top-2.5 z-10">
            <span className="rounded-full px-2 py-0.5 text-[0.35rem] font-semibold text-white" style={{ background: "#FF2D7F", letterSpacing: "0.02em" }}>
              {girl.badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-bold text-white" style={{ fontSize: "clamp(0.85rem, 3.2vw, 1.05rem)", letterSpacing: "-0.04em", lineHeight: 1.1, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            {girl.name} <span className="font-normal" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6em" }}>{girl.age}</span>
          </h3>
          <p className="text-[0.5rem] leading-tight mt-0.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
            {girl.story}
          </p>
        </div>
        <div className="absolute right-2.5 top-2.5 z-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#30D158" }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#30D158" }} />
          </span>
        </div>
      </div>
      <div className="p-2">
        <Link
          href={`/chat/${girl.id}`}
          className="btn-pill h-7 w-full text-xs font-semibold"
        >
          Chatear
        </Link>
      </div>
    </div>
  );
}