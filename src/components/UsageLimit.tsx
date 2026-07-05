"use client";

interface UsageLimitProps {
  label: string;
  used: number;
  limit: number;
  premium?: boolean;
}

export default function UsageLimit({ label, used, limit, premium }: UsageLimitProps) {
  const remaining = Math.max(limit - used, 0);
  const pct = Math.min((used / limit) * 100, 100);

  if (premium) {
    return (
      <span className="rounded-full border border-pink/40 px-3 py-1 text-xs text-pink">
        ✨ Premium activo
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span>
        {label}: {remaining}/{limit}
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full gradient-btn transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
