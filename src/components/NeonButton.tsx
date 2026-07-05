"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

export default function NeonButton({
  children,
  variant = "primary",
  fullWidth,
  className = "",
  ...props
}: NeonButtonProps) {
  const base =
    "min-h-[48px] rounded-2xl px-6 font-semibold transition-all duration-200 ease-out active:scale-95 hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100";

  const variants: Record<string, string> = {
    primary: "gradient-btn text-white shadow-glowSm hover:shadow-glow",
    secondary:
      "card-surface text-ink hover:border-pink/50",
    ghost: "text-muted hover:text-ink",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
