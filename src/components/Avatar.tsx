"use client";

import { useState, useEffect, useRef } from "react";
import { getGirlImage } from "@/lib/images";
import { HairOption, OutfitOption, BackgroundOption } from "@/data/girls";

interface AvatarProps {
  name: string;
  image?: string;
  accentColor: string;
  accentColorSecondary?: string;
  size?: number;
  animated?: boolean;
  talking?: boolean;
  hair?: string;
  outfit?: string;
  background?: string;
  defaultHair?: string;
  defaultOutfit?: string;
  defaultBackground?: string;
  className?: string;
}

const hairColors: Record<string, string> = {
  moreno: "#3b2a20",
  rubio: "#e8c77e",
  pelirrojo: "#b0492f",
  rosa: "#ff6fb5",
};

export default function Avatar({
  name,
  accentColor,
  accentColorSecondary = "#8b5cf6",
  size = 120,
  animated = false,
  talking = false,
  hair,
  outfit,
  background,
  defaultHair,
  defaultOutfit,
  defaultBackground,
  className = "",
}: AvatarProps) {
  const gradientId = `grad-${name}`;
  const hairColor = hairColors[hair ?? "moreno"] ?? hairColors.moreno;
  const [imgFailed, setImgFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prevSrc = useRef<string>("");

  const defaults = defaultHair && defaultOutfit && defaultBackground
    ? { hair: defaultHair as HairOption, outfit: defaultOutfit as OutfitOption, background: defaultBackground as BackgroundOption }
    : undefined;
  const imgSrc = getGirlImage(
    name,
    hair as HairOption,
    outfit as OutfitOption,
    background as BackgroundOption,
    defaults,
  );

  // Reset loading state when source changes
  useEffect(() => {
    if (imgSrc !== prevSrc.current) {
      prevSrc.current = imgSrc;
      setLoaded(false);
      setImgFailed(false);
    }
  }, [imgSrc]);

  return (
    <div
      className={`relative flex items-center justify-center ${className} ${
        animated ? "animate-breathe" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70 animate-pulseGlow"
        style={{
          background: `radial-gradient(circle, ${accentColor}, transparent 70%)`,
        }}
      />
      {!imgFailed ? (
        <div className="relative" style={{ width: size, height: size }}>
          <div
            className="absolute inset-0 rounded-full bg-[#1a1023]"
            style={{ width: size, height: size }}
          />
          <img
            src={imgSrc}
            alt={name}
            className={`relative rounded-full object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ width: size, height: size }}
            onLoad={() => setLoaded(true)}
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="relative rounded-full"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="100%" stopColor={accentColorSecondary} />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="98" fill={`url(#${gradientId})`} />
          <circle cx="100" cy="100" r="98" fill="black" opacity="0.15" />
          <ellipse cx="100" cy="120" rx="46" ry="54" fill="#1a1023" opacity="0.55" />
          <path
            d="M45 95 Q40 30 100 30 Q160 30 155 95 Q150 60 100 55 Q50 60 45 95 Z"
            fill={hairColor}
          />
          <g className={animated ? "animate-blink" : ""} style={{ transformOrigin: "center" }}>
            <ellipse cx="82" cy="112" rx="6" ry="8" fill="#f8fafc" />
            <ellipse cx="118" cy="112" rx="6" ry="8" fill="#f8fafc" />
          </g>
          <ellipse
            cx="100"
            cy="140"
            rx="10"
            ry={talking ? 6 : 3}
            fill="#f8fafc"
            className={talking ? "animate-mouthTalk" : ""}
            style={{ transformOrigin: "100px 140px" }}
          />
        </svg>
      )}
    </div>
  );
}
