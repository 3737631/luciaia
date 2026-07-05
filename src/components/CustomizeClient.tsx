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

const backgroundOptions = [
  { value: "neon-room", label: "Habitación neón" },
  { value: "beach-night", label: "Playa de noche" },
  { value: "studio", label: "Estudio moderno" },
  { value: "car-night", label: "Coche nocturno" },
];

const outfitOptions = [
  { value: "elegante", label: "Elegante" },
  { value: "casual", label: "Casual ajustada" },
  { value: "fiesta", label: "Fiesta" },
  { value: "bikini-suave", label: "Bikini suave (no explícito)" },
];

const personalityOptions = [
  { value: "carinosa", label: "Cariñosa" },
  { value: "timida", label: "Tímida" },
  { value: "atrevida", label: "Atrevida" },
  { value: "dominante", label: "Dominante suave" },
];

const backgroundGradients: Record<string, string> = {
  "neon-room": "from-pink/25 via-purple/20 to-transparent",
  "beach-night": "from-blue/25 via-purple/15 to-transparent",
  studio: "from-purple/25 via-white/5 to-transparent",
  "car-night": "from-purple/30 via-pink/10 to-transparent",
};

export default function CustomizeClient({ girl }: { girl: Girl }) {
  const router = useRouter();
  const [custom, setCustom] = useState<Customization>({
    hair: girl.defaultHair,
    background: girl.defaultBackground,
    outfit: girl.defaultOutfit,
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
            size={140}
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
            label="Fondo"
            options={backgroundOptions}
            selected={custom.background}
            onSelect={(v) => update("background", v)}
          />
          <OptionGroup
            label="Ropa"
            options={outfitOptions}
            selected={custom.outfit}
            onSelect={(v) => update("outfit", v)}
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
