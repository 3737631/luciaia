"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";
import { OptionGroup } from "@/components/CustomizationPanel";
import { Girl } from "@/data/girls";
import { Customization, getCustomization, saveCustomization } from "@/lib/storage";
import { getGirlImage } from "@/lib/images";

const maleIds = new Set(["axel", "liam"]);
const animeIds = new Set(["sakura", "yumi", "rin"]);

const girlHair = [
  { value: "moreno", label: "Moreno" },
  { value: "rubio", label: "Rubio" },
  { value: "pelirrojo", label: "Pelirrojo" },
  { value: "rosa", label: "Rosa neón" },
];

const maleHair = [
  { value: "cafe", label: "Castaño" },
  { value: "negro", label: "Negro" },
  { value: "moreno", label: "Moreno" },
  { value: "rubio", label: "Rubio" },
];

const animeHair = [
  { value: "rosa", label: "Rosa" },
  { value: "azul", label: "Azul" },
  { value: "verde", label: "Verde" },
  { value: "pelirrojo", label: "Pelirrojo" },
  { value: "rubio", label: "Rubio" },
  { value: "negro", label: "Negro" },
  { value: "blanco", label: "Blanco" },
];

const girlPose = [
  { value: "toalla", label: "Toalla mojada" },
  { value: "estrellas", label: "Pegatinas de estrellas" },
  { value: "tanga", label: "Tanga y nalgas" },
  { value: "bata", label: "Bata abierta" },
];

const malePose = [
  { value: "ropa", label: "Ropa de gimnasio" },
  { value: "casual", label: "Casual" },
  { value: "toalla", label: "Toalla" },
  { value: "bata", label: "Bata" },
];

const animePose = [
  { value: "bata", label: "Uniforme" },
  { value: "tanga", label: "Vestido" },
  { value: "ropa", label: "Ropa casual" },
  { value: "casual", label: "Invierno" },
];

const girlPersonality = [
  { value: "carinosa", label: "Cariñosa" },
  { value: "timida", label: "Tímida" },
  { value: "atrevida", label: "Atrevida" },
  { value: "dominante", label: "Dominante" },
];

const malePersonality = [
  { value: "carinosa", label: "Cariñoso" },
  { value: "timida", label: "Tímido" },
  { value: "atrevida", label: "Atrevido" },
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
  const isMale = maleIds.has(girl.id);
  const isAnime = animeIds.has(girl.id);

  const hairOptions = isAnime ? animeHair : isMale ? maleHair : girlHair;
  const poseOptions = isAnime ? animePose : isMale ? malePose : girlPose;
  const personalityOptions = isMale ? malePersonality : girlPersonality;

  const [custom, setCustom] = useState<Customization>({
    hair: girl.defaultHair,
    background: girl.defaultBackground,
    pose: girl.defaultPose,
    personality: girl.personality,
  });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const prevKey = useRef("");

  const imgKey = `${custom.hair}-${custom.pose}-${custom.background}`;

  useEffect(() => {
    if (imgKey !== prevKey.current) {
      prevKey.current = imgKey;
      setImgLoaded(false);
      setImgFailed(false);
    }
  }, [imgKey]);

  const imgSrc = getGirlImage(girl.id, custom.hair, custom.pose, custom.background);

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
          <p className="mb-6 text-muted text-sm">{isMale ? "Personalízalo antes de empezar." : "Personalízala antes de empezar."}</p>
          <div className="relative mx-auto flex items-center justify-center overflow-hidden rounded-2xl"
            style={{ width: 220, height: 280 }}>
            {!imgLoaded && !imgFailed && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1023]">
                <svg className="h-8 w-8 animate-spin text-pink/60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
              </div>
            )}
            {imgFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-[#1a1023] text-muted/60 text-sm px-4 text-center">
                Generando imagen...
                <svg className="ml-2 h-4 w-4 animate-spin text-pink/60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <img
                key={imgKey}
                src={imgSrc}
                alt={`${girl.name} ${custom.hair} ${custom.pose}`}
                className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => { setImgFailed(true); setImgLoaded(false); }}
              />
            )}
          </div>
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
          <Link href={isAnime ? "/anime" : isMale ? "/chicos" : "/girls"} className="text-center text-sm text-muted hover:text-ink mt-2">
            {isAnime ? "Volver a anime" : isMale ? "Volver a chicos" : "Volver a chicas"}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
