"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import NeonButton from "@/components/NeonButton";
import { OptionGroup } from "@/components/CustomizationPanel";
import { Girl } from "@/data/girls";
import { Customization, getCustomization, saveCustomization } from "@/lib/storage";

const hairOptions = [
  { value: "moreno", label: "Moreno" },
  { value: "rubio", label: "Rubio" },
  { value: "pelirrojo", label: "Pelirrojo" },
  { value: "rosa", label: "Rosa neón" },
];

const poseOptions = [
  { value: "toalla", label: "Toalla mojada" },
  { value: "estrellas", label: "Pegatinas de estrellas" },
  { value: "tanga", label: "Tanga y nalgas" },
  { value: "bata", label: "Bata abierta" },
];

const personalityOptions = [
  { value: "carinosa", label: "Cariñosa" },
  { value: "timida", label: "Tímida" },
  { value: "atrevida", label: "Atrevida" },
  { value: "dominante", label: "Dominante" },
];

const backgroundGradients: Record<string, string> = {
  "neon-room": "from-pink/25 via-purple/20 to-transparent",
  "beach-night": "from-blue/25 via-purple/15 to-transparent",
  studio: "from-purple/25 via-white/5 to-transparent",
  "car-night": "from-purple/30 via-pink/10 to-transparent",
};

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[44px] ${
        selected
          ? "border-pink bg-pink/10 text-white shadow-[0_0_20px_rgba(255,45,152,0.15)]"
          : "border-white/10 bg-white/[0.04] text-muted hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function CustomizeClient({ girl }: { girl: Girl }) {
  const router = useRouter();
  const [custom, setCustom] = useState<Customization>({
    hair: girl.defaultHair,
    background: girl.defaultBackground,
    pose: girl.defaultPose,
    personality: girl.personality,
  });

  useEffect(() => {
    const existing = getCustomization(girl.id);
    if (existing) setCustom(existing);
  }, [girl.id]);

  function update(field: keyof Customization, value: string) {
    const updated = { ...custom, [field]: value };
    setCustom(updated);
    saveCustomization(girl.id, updated);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div
          className={`rounded-xl2 card-surface p-8 mb-8 text-center bg-gradient-to-b ${backgroundGradients[custom.background]}`}
        >
          <h1 className="text-2xl font-bold">{girl.name}</h1>
          <p className="mb-6 text-muted text-sm">Personalízala antes de empezar.</p>
          <Avatar
            name={girl.id}
            accentColor={girl.accentColor}
            accentColorSecondary={girl.accentColorSecondary}
            hair={custom.hair}
            pose={custom.pose}
            background={custom.background}
            size={180}
            animated
          />
        </div>

        <div className="rounded-xl2 card-surface p-6">
          <OptionGroup
            label="Pelo"
            options={hairOptions}
            selected={custom.hair}
            onSelect={(v) => update("hair", v)}
          />
          <OptionGroup
            label="Poses y cuerpo"
            options={poseOptions}
            selected={custom.pose}
            onSelect={(v) => update("pose", v)}
          />
          <OptionGroup
            label="Personalidad"
            options={personalityOptions}
            selected={custom.personality}
            onSelect={(v) => update("personality", v)}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <NeonButton onClick={() => router.push(`/chat/${girl.id}`)} fullWidth>
            Empezar chat gratis
          </NeonButton>
          <NeonButton
            variant="secondary"
            onClick={() => router.push(`/call/${girl.id}`)}
            fullWidth
          >
            Probar videollamada
          </NeonButton>
          <Link href="/girls" className="text-center text-sm text-muted hover:text-ink mt-2">
            Volver a chicas
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
