"use client";

interface OptionGroupProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

export function OptionGroup({ label, options, selected, onSelect }: OptionGroupProps) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-sm font-semibold text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`rounded-xl border px-4 py-2 text-sm transition-all duration-200 min-h-[44px] ${
              selected === opt.value
                ? "border-pink bg-pink/10 shadow-glowSm"
                : "border-white/10 card-surface hover:border-white/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
