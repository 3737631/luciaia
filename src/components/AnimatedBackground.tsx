"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#0B0B0F" }}>
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-[0.04]" style={{ background: "#FF3B7F", filter: "blur(100px)" }} />
      <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full opacity-[0.03]" style={{ background: "#FF5A4F", filter: "blur(100px)" }} />
    </div>
  );
}