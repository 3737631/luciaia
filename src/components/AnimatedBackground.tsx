"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-purple/30 blur-3xl animate-float2" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-blue/20 blur-3xl animate-float" />
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className={`absolute block rounded-full ${i % 3 === 0 ? "h-1.5 w-1.5" : "h-1 w-1"} ${i % 2 === 0 ? "bg-white/30" : "bg-pink/20"} animate-float`}
            style={{
              left: `${(i * 31 + 7) % 100}%`,
              top: `${(i * 47 + 13) % 100}%`,
              animationDuration: `${12 + (i % 8)}s`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
