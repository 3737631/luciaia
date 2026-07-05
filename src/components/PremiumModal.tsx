"use client";

import Link from "next/link";
import NeonButton from "./NeonButton";

interface PremiumModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export default function PremiumModal({ title, subtitle, onClose }: PremiumModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-5">
      <div className="w-full max-w-sm rounded-xl2 card-surface p-8 text-center shadow-glow animate-modalIn">
        <p className="mb-2 text-xl font-bold">{title}</p>
        <p className="mb-6 text-sm text-muted">{subtitle}</p>
        <div className="flex flex-col gap-3">
          <Link href="/premium">
            <NeonButton fullWidth>Activar Premium</NeonButton>
          </Link>
          <NeonButton variant="ghost" fullWidth onClick={onClose}>
            Volver mañana
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
