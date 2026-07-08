/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#08030f",
        purple: "#8b5cf6",
        pink: "#d91a6a",
        rose: "#b8145a",
        blue: "#38bdf8",
        ink: "#f8fafc",
        muted: "#a1a1aa",
      },
      borderRadius: {
        xl2: "24px",
        xl3: "32px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 45, 149, 0.25), 0 0 80px rgba(139, 92, 246, 0.15)",
        glowSm: "0 0 20px rgba(255, 45, 149, 0.35)",
        glass: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
        card: "0 4px 24px rgba(0,0,0,0.3)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -30px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.015)" },
        },
        blink: {
          "0%, 96%, 100%": { transform: "scaleY(1)" },
          "98%": { transform: "scaleY(0.1)" },
        },
        mouthTalk: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        modalIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        float2: "float 11s ease-in-out infinite reverse",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        blink: "blink 5s ease-in-out infinite",
        mouthTalk: "mouthTalk 0.3s ease-in-out infinite",
        fadeUp: "fadeUp 0.4s ease-out both",
        modalIn: "modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
