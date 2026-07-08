"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getGirlImage } from "@/lib/images";
import { HairOption, PoseOption, BackgroundOption } from "@/data/girls";

interface AvatarProps {
  name: string;
  accentColor: string;
  accentColorSecondary?: string;
  size?: number;
  animated?: boolean;
  talking?: boolean;
  hair?: string;
  pose?: string;
  background?: string;
  className?: string;
}

const hairColors: Record<string, string> = {
  moreno: "#3b2a20",
  rubio: "#e8c77e",
  pelirrojo: "#b0492f",
  rosa: "#ff6fb5",
  azul: "#4a90d9",
  verde: "#4caf50",
  cafe: "#6d4c2a",
  negro: "#1a1a1a",
  blanco: "#e8e0d4",
};

export default function Avatar({
  name,
  accentColor,
  accentColorSecondary = "#8b5cf6",
  size = 120,
  animated = false,
  talking = false,
  hair,
  pose,
  background,
  className = "",
}: AvatarProps) {
  const gradientId = `grad-${name}`;
  const hairColor = hairColors[hair ?? "moreno"] ?? hairColors.moreno;
  const [imgFailed, setImgFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prevSrc = useRef<string>("");

  const imgSrc = getGirlImage(
    name,
    hair as HairOption,
    pose as PoseOption,
    background as BackgroundOption,
  );

  useEffect(() => {
    if (imgSrc !== prevSrc.current) {
      prevSrc.current = imgSrc;
      setLoaded(false);
      setImgFailed(false);
    }
  }, [imgSrc]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{
          background: `radial-gradient(circle, ${accentColor}, transparent 70%)`,
        }}
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
      />
      {!imgFailed ? (
        <motion.div
          className="relative"
          style={{ width: size, height: size }}
          animate={
            animated
              ? {
                  scale: [1, 1.006, 1],
                  ...(talking
                    ? { rotate: [0, 0.4, -0.4, 0], y: [0, -1, 1, 0] }
                    : {}),
                }
              : undefined
          }
          transition={
            animated
              ? {
                  scale: { duration: 4, ease: "easeInOut", repeat: Infinity },
                  rotate: { duration: 1.5, ease: "easeInOut", repeat: Infinity },
                  y: { duration: 1.5, ease: "easeInOut", repeat: Infinity },
                }
              : undefined
          }
        >
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
          {animated && (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: "50%",
                height: "6%",
                top: "32%",
                background:
                  "radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(1px)",
              }}
              animate={{ opacity: [0, 0, 0, 0, 0.85, 0, 0, 0, 0] }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                times: [0, 0.9, 0.94, 0.97, 0.98, 0.99, 1, 1, 1],
              }}
            />
          )}
        </motion.div>
      ) : (
        <motion.svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="relative rounded-full"
          animate={
            animated
              ? {
                  scale: [1, 1.015, 1],
                  ...(talking
                    ? { rotate: [0, 0.5, -0.5, 0] }
                    : {}),
                }
              : undefined
          }
          transition={
            animated
              ? {
                  scale: { duration: 4, ease: "easeInOut", repeat: Infinity },
                  rotate: { duration: 1.5, ease: "easeInOut", repeat: Infinity },
                }
              : undefined
          }
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
          <g style={{ transformOrigin: "center" }}>
            <ellipse cx="82" cy="112" rx="6" ry="8" fill="#f8fafc" />
            <ellipse cx="118" cy="112" rx="6" ry="8" fill="#f8fafc" />
          </g>
          <motion.ellipse
            cx="100"
            cy="140"
            rx="10"
            ry={talking ? 6 : 3}
            fill="#f8fafc"
            style={{ transformOrigin: "100px 140px" }}
            animate={
              talking
                ? { ry: [3, 8, 3] }
                : { ry: 3 }
            }
            transition={
              talking
                ? { duration: 0.3, ease: "easeInOut", repeat: Infinity }
                : undefined
            }
          />
        </motion.svg>
      )}
    </div>
  );
}
