"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-purple/30 blur-3xl animate-float2" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-blue/20 blur-3xl animate-float" />
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-white/40 animate-float"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDuration: `${6 + (i % 5)}s`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
