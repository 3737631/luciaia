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
      className="overflow-hidden fade-in group"
      style={{
        borderRadius: 14,
        background: "#17171D",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "all 200ms ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
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
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.55), transparent)" }} />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: "#17171D" }}>
            <span style={{ color: "#71717A", fontSize: "0.5rem" }}>Sin imagen</span>
          </div>
        )}
        {girl.badge && (
          <div className="absolute left-2 top-2 z-10">
            <span
              className="rounded-full font-semibold text-white"
              style={{
                background: "#FF3B7F",
                fontSize: "clamp(0.35rem, 0.8vw, 0.45rem)",
                padding: "2px 7px",
                height: 18,
                lineHeight: "14px",
              }}
            >
              {girl.badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          <h3
            className="text-white font-extrabold tracking-tight"
            style={{
              fontSize: "clamp(0.8rem, 2.5vw, 1.05rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            {girl.name}
            <span className="font-normal" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6em" }}> {girl.age}</span>
          </h3>
          <p
            className="leading-tight mt-0.5 line-clamp-2"
            style={{
              fontSize: "clamp(0.45rem, 1.2vw, 0.55rem)",
              color: "#C4C4CC",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            {girl.story}
          </p>
        </div>
        <div className="absolute right-2 top-2 z-10">
          <span className="relative flex" style={{ width: "clamp(6px, 0.8vw, 8px)", height: "clamp(6px, 0.8vw, 8px)" }}>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#22C55E" }} />
            <span className="relative inline-flex h-full w-full rounded-full" style={{ background: "#22C55E" }} />
          </span>
        </div>
      </div>
      <div className="p-2" style={{ background: "#17171D" }}>
        <Link
          href={`/chat/${girl.id}`}
          className="btn-pill w-full"
          style={{ height: "clamp(26px, 3vw, 30px)", fontSize: "clamp(0.5rem, 1vw, 0.6rem)" }}
        >
          Chatear
        </Link>
      </div>
    </div>
  );
}