"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import NeonButton from "@/components/NeonButton";
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
  { value: "casual", label: "Casual" },
  { value: "fiesta", label: "Fiesta" },
  { value: "bikini-suave", label: "Bikini" },
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
      <main className="mx-auto max-w-5xl overflow-x-hidden px-4 pb-32 pt-4 sm:px-6 sm:pt-8">
        <div className="grid gap-6 sm:grid-cols-5 sm:gap-8">
          {/* Preview */}
          <div className="sm:col-span-2">
            <div className={`sticky top-20 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b ${backgroundGradients[custom.background]}`}>
              <div className="flex flex-col items-center p-6 text-center">
                <Avatar
                  name={girl.id}
                  accentColor={girl.accentColor}
                  accentColorSecondary={girl.accentColorSecondary}
                  hair={custom.hair}
                  outfit={custom.outfit}
                  background={custom.background}
                  size={200}
                  animated
                />
                <h1 className="mt-4 text-2xl font-bold">{girl.name}</h1>
                <p className="text-sm text-muted/70">{girl.style}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-5 sm:col-span-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Personaliza a {girl.name}</h2>
              <p className="text-sm text-muted/70">Ajusta su apariencia y personalidad antes de empezar.</p>
            </div>

            {/* Hair */}
            <div className="rounded-xl border border-white/[0.06] bg-[#14141c] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/50">Pelo</p>
              <div className="grid grid-cols-2 gap-2">
                {hairOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={custom.hair === opt.value}
                    onClick={() => update("hair", opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="rounded-xl border border-white/[0.06] bg-[#14141c] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/50">Escenario</p>
              <div className="grid grid-cols-2 gap-2">
                {backgroundOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={custom.background === opt.value}
                    onClick={() => update("background", opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* Outfit */}
            <div className="rounded-xl border border-white/[0.06] bg-[#14141c] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/50">Ropa</p>
              <div className="grid grid-cols-2 gap-2">
                {outfitOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={custom.outfit === opt.value}
                    onClick={() => update("outfit", opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* Personality */}
            <div className="rounded-xl border border-white/[0.06] bg-[#14141c] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted/50">Personalidad</p>
              <div className="grid grid-cols-2 gap-2">
                {personalityOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={custom.personality === opt.value}
                    onClick={() => update("personality", opt.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[#14141c]/95 backdrop-blur-lg px-4 py-4 sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <div className="mx-auto max-w-5xl sm:max-w-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <NeonButton onClick={() => router.push(`/chat/${girl.id}`)} fullWidth>
                Empezar chat gratis
              </NeonButton>
              <NeonButton
                variant="secondary"
                onClick={() => router.push(`/call/${girl.id}`)}
                fullWidth
              >
                Llamar ahora
              </NeonButton>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
