"use client";

import Link from "next/link";
import { getGirlImage } from "@/lib/images";
import { girls } from "@/data/girls";

export default function StoriesRow() {
  return (
    <div
      className="flex gap-4 overflow-x-auto px-4 sm:gap-5 sm:px-6 lg:px-8"
      style={{
        maxWidth: 1180,
        margin: "22px auto 0",
        paddingBottom: 12,
        scrollbarWidth: "none",
      }}
    >
      {/* This is for the "new" badge dot - all new for now */}
      {girls.map((girl) => (
        <Link
          key={girl.id}
          href={`/chat/${girl.id}`}
          className="flex shrink-0 flex-col items-center text-white"
          style={{ width: 72, fontSize: 12 }}
        >
          <div
            className="relative mx-auto mb-2"
            style={{
              width: 66,
              height: 66,
              padding: 4,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff3b7f, #ff0f70, #ff7a3d)",
              boxShadow: "0 0 24px rgba(255,59,127,0.45)",
              transition: "transform 0.22s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {/* "new" dot */}
            <div
              className="absolute right-[3px] top-[3px] z-10 h-3 w-3 rounded-full border-2"
              style={{ borderColor: "#0b0b0f", background: "#ff0f70" }}
            />
            <img
              src={getGirlImage(girl.id, girl.defaultHair, girl.defaultPose, girl.defaultBackground)}
              alt={girl.name}
              className="h-full w-full rounded-full object-cover"
              style={{ border: "3px solid #0b0b0f", background: "#222" }}
            />
          </div>
          <span className="max-w-[66px] truncate text-center font-bold text-white/80">
            {girl.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
