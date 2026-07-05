"use client";

import Link from "next/link";
import { Girl } from "@/data/girls";
import Avatar from "./Avatar";
import NeonButton from "./NeonButton";

export default function GirlCard({ girl }: { girl: Girl }) {
  return (
    <div className="group rounded-xl2 card-surface p-5 transition-all duration-200 hover:-translate-y-1.5 hover:border-pink/50 hover:shadow-glow">
      <div className="flex flex-col items-center text-center">
        <Avatar
          name={girl.id}
          accentColor={girl.accentColor}
          accentColorSecondary={girl.accentColorSecondary}
          hair={girl.defaultHair}
          size={100}
        />
        <h3 className="mt-4 text-lg font-bold">{girl.name}</h3>
        <p className="text-sm text-muted">{girl.style}</p>
        <p className="mt-2 text-sm">{girl.personalityLabel}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-white/10 px-2 py-1">
            💬 Chat
          </span>
          <span className="rounded-full border border-white/10 px-2 py-1">
            🎙️ Voz
          </span>
          <span className="rounded-full border border-white/10 px-2 py-1">
            📞 Llamada simulada
          </span>
        </div>
        <div className="mt-5 flex w-full flex-col gap-2">
          <Link href={`/customize/${girl.id}`} className="w-full">
            <NeonButton fullWidth>Personalizar</NeonButton>
          </Link>
          <div className="flex gap-2">
            <Link href={`/chat/${girl.id}`} className="w-1/2">
              <NeonButton variant="secondary" fullWidth>
                💬 Chat
              </NeonButton>
            </Link>
            <Link href={`/call/${girl.id}`} className="w-1/2">
              <NeonButton variant="secondary" fullWidth>
                📞 Llamada
              </NeonButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
