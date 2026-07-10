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
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const prevSrc = useRef<string>("");

  const imgSrc = getGirlImage(
    name,
    !usedFallback ? (hair as HairOption) : undefined,
    !usedFallback ? (pose as PoseOption) : undefined,
    !usedFallback ? (background as BackgroundOption) : undefined,
  );

  useEffect(() => {
    if (imgSrc !== prevSrc.current) {
      prevSrc.current = imgSrc;
      setLoaded(false);
      setFailed(false);
      setUsedFallback(false);
    }
  }, [imgSrc]);

  function handleError() {
    if (!usedFallback) {
      setUsedFallback(true);
      setLoaded(false);
    } else {
      setFailed(true);
      setLoaded(true);
    }
  }

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
        {!failed && (
          <img
            src={imgSrc}
            alt={name}
            className={`relative rounded-full object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ width: size, height: size }}
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
        )}
        {failed && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColorSecondary}33)` }}
          >
            <span className="text-lg font-bold text-white/30 select-none" style={{ fontSize: size * 0.35 }}>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
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
    </div>
  );
}
