"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { saveCustomGirl, getCustomGirls, deleteCustomGirl, CustomGirlData } from "@/lib/storage";

const MINOR_WORDS = [
  "niño", "niña", "niños", "niñas", "menor", "menores", "pequeño", "pequeña",
  "bebé", "bebe", "adolescente", "adolescentes", "teen", "quinceañera",
  "quince", "dieciséis", "dieciseis", "diecisiete", "diecisiete", "doce",
  "trece", "catorce", "joven", "demasiado joven", "colegiala", "colegio",
  "escuela", "instituto", "guardería", "infantil", "kinder",
];

const MINOR_AGE_PATTERN = /\b(1[0-7])\b/;

function containsMinorReferences(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of MINOR_WORDS) {
    if (lower.includes(word)) return `No se permite contenido con menores. La palabra "${word}" no está permitida.`;
  }
  const match = lower.match(MINOR_AGE_PATTERN);
  if (match) return `No se permiten edades menores de 18.`;
  return null;
}

function generateId(): string {
  return "custom_" + Math.random().toString(36).slice(2, 8);
}

function generateName(desc: string): string {
  const names = ["Luna", "Nia", "Vera", "Alma", "Kira", "Maya", "Sasha", "Yuki", "Eva", "Iris", "Nova", "Aria", "Zara", "Lia", "Roxy"];
  const words = desc.toLowerCase();
  if (words.includes("enfermera")) return "Candy";
  if (words.includes("profesora") || words.includes("maestra")) return "Diana";
  if (words.includes("vecina")) return "Vera";
  if (words.includes("gamer")) return "Nia";
  if (words.includes("rubia")) return "Maya";
  if (words.includes("morena")) return "Luna";
  if (words.includes("pelirroja")) return "Vera";
  return names[Math.floor(Math.random() * names.length)];
}

function generateAge(): number {
  return 18 + Math.floor(Math.random() * 7);
}

function buildPrompt(desc: string): string {
  const words = desc.toLowerCase();

  let clothing = "red lace lingerie set, thigh-high stockings, stiletto heels";
  if (words.includes("uniforme")) clothing = "tight white nurse uniform with unbuttoned top, sheer stockings, heels";
  else if (words.includes("vestido")) clothing = "tight black mini dress, strappy high heels";
  else if (words.includes("bata")) clothing = "sheer silk robe loosely tied, lacy underwear underneath, heels";
  else if (words.includes("abrigo")) clothing = "long open trench coat, nothing underneath, high heels";
  else if (words.includes("bikini") || words.includes("bañador") || words.includes("traje de baño"))
    clothing = "tiny string bikini, high heels";
  else if (words.includes("pijama") || words.includes("camisón"))
    clothing = "silk baby doll nightie, lace trim";

  let body = "slim toned figure, medium breasts, perky";
  if (words.includes("tetas grandes") || words.includes("curvas") || words.includes("curvy") || words.includes("culo grande") || words.includes("nalgas grandes") || words.includes("voluptuosa"))
    body = "curvy hourglass, large firm breasts, wide hips, big round glutes";
  else if (words.includes("delgada") || words.includes("fina") || words.includes("flaca"))
    body = "very slender, small breasts, thin waist";
  else if (words.includes("gordita") || words.includes("rellenita") || words.includes("llenita"))
    body = "plus size thick figure, full hips, big thighs";

  let pose = "full body, standing, looking at camera, both arms and legs visible";
  if (words.includes("sentada") || words.includes("silla")) pose = "full body visible, sitting on a chair, legs crossed";
  else if (words.includes("cama") || words.includes("acostada")) pose = "full body, lying on a bed, legs extended";
  else if (words.includes("de rodillas")) pose = "full body, kneeling on the floor";
  else if (words.includes("espejo")) pose = "full body, taking mirror selfie with phone in hand";

  const positive = encodeURIComponent(
    `ultra realistic photo of a beautiful adult woman 20 years old, ${desc}, ${clothing}, ${body}, ${pose}, ` +
    `photorealistic skin texture, visible pores, natural skin details, soft subsurface scattering, ` +
    `shot on Hasselblad X1D II 90mm f/2.8, professional studio lighting, soft key light, ` +
    `cinematic color grade, sharp focus, high detail skin, natural expression, confident seductive gaze, ` +
    `complete full body composition, all four limbs visible and correctly formed, ` +
    `wearing proper clothing covering nipples and pubic area, realistic anatomy, ` +
    `sensual intimate atmosphere, tasteful boudoir style`
  );

  const negative = encodeURIComponent(
    "nude, topless, exposed breasts, nipples, areola, pubic hair, see-through, " +
    "missing limbs, missing arms, missing legs, deformed hands, bad anatomy, " +
    "cropped body, amputated, disfigured, ugly, mutated, extra limbs, " +
    "cartoon, anime, drawing, painting, 3d render, illustration, oil painting, " +
    "watermark, text, blurry, low resolution, low quality, oversaturated, " +
    "bad proportions, distorted face, unnatural"
  );

  return `${positive}&negative=${negative}`;
}

export default function CreateYourGirl() {
  const [girlDesc, setGirlDesc] = useState("");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCustomGirls(getCustomGirls());
  }, []);

  function handleCreate() {
    setError("");
    if (!girlDesc.trim() && !roleplayDesc.trim()) return;

    const combined = (girlDesc + " " + roleplayDesc).trim();
    const blockReason = containsMinorReferences(combined);
    if (blockReason) {
      setError(blockReason);
      return;
    }

    setCreating(true);
    const id = generateId();
    const name = generateName(girlDesc || roleplayDesc);
    const story = roleplayDesc.trim() || `Tu nueva creación, ${name}, te espera para pasar una noche inolvidable.`;
    const params = buildPrompt(girlDesc || roleplayDesc);
    const imageUrl = `https://image.pollinations.ai/prompt/${params}&width=512&height=640&nofeed=true&seed=${Date.now()}`;
    const customScenario = JSON.stringify({ girl: girlDesc.trim(), roleplay: roleplayDesc.trim() });
    localStorage.setItem("custom_scenario", customScenario);
    const newGirl: CustomGirlData = {
      id,
      name,
      age: generateAge(),
      story,
      description: girlDesc.trim() || name,
      girlDesc: girlDesc.trim(),
      roleplayDesc: roleplayDesc.trim(),
      hair: "moreno",
      background: "neon-room",
      pose: "toalla",
      personality: "atrevida",
      baseId: "luna",
      imageUrl,
    };
    saveCustomGirl(newGirl);
    setCustomGirls(getCustomGirls());
    setGirlDesc("");
    setRoleplayDesc("");
    setTimeout(() => setCreating(false), 500);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1180, margin: "20px auto 0" }}>
      <h2
        className="font-black tracking-tighter text-white"
        style={{ fontSize: "clamp(28px, 4vw, 38px)", letterSpacing: "-0.05em", margin: "0 0 8px" }}
      >
        Crea tu propia chica
      </h2>
      <p className="mb-4 text-sm text-white/50" style={{ marginTop: 0 }}>
        Describe a tu chica ideal y el roleplay. Se generará una imagen hiperrealista con IA.
      </p>
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}
        <label className="mb-1.5 block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Describe a tu chica
        </label>
        <textarea
          value={girlDesc}
          onChange={(e) => { setError(""); setGirlDesc(e.target.value); }}
          placeholder="Ej: Una enfermera de noche, pelo negro, mirada intensa, uniforme blanco ajustado..."
          rows={3}
          className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
        />
        <label className="mb-1.5 mt-4 block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Describe el roleplay
        </label>
        <textarea
          value={roleplayDesc}
          onChange={(e) => { setError(""); setRoleplayDesc(e.target.value); }}
          placeholder="Ej: Me tiene atado a la cama del hospital, se sienta sobre mí y me susurra que nadie va a interrumpirnos..."
          rows={3}
          className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
        />
        <button
          onClick={handleCreate}
          disabled={(!girlDesc.trim() && !roleplayDesc.trim()) || creating}
          className="btn-primary mt-4 h-11 px-6 text-sm font-bold disabled:opacity-40"
        >
          {creating ? "Creando..." : "Crear chica personalizada"}
        </button>
      </div>

      {customGirls.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-bold tracking-tight text-white" style={{ fontSize: "clamp(18px, 3vw, 24px)", letterSpacing: "-0.03em" }}>
            Tus creaciones
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {creating && <SkeletonCard />}
            {customGirls.map((girl) => (
              <CustomCard key={girl.id} data={girl} onDeleted={() => setCustomGirls(getCustomGirls())} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="shrink-0 overflow-hidden rounded-2xl" style={{ flex: "0 0 220px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="relative" style={{ height: 275 }}>
        <div className="h-full w-full animate-pulse shimmer-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink/40 border-t-pink" />
            <span className="text-[0.55rem] font-semibold text-pink/60 tracking-widest uppercase animate-pulse">Creando</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="p-2.5">
        <div className="h-8 w-full animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function CustomCard({ data, onDeleted }: { data: CustomGirlData; onDeleted?: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const imgSrc = data.imageUrl || "";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setImgFailed(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  function handleChat() {
    localStorage.setItem("custom_scenario", JSON.stringify({ girl: data.girlDesc, roleplay: data.roleplayDesc }));
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    deleteCustomGirl(data.id);
    onDeleted?.();
  }

  return (
    <div className="group shrink-0 character-card overflow-hidden" style={{ flex: "0 0 220px" }}>
      <Link href="/chat/luna" onClick={handleChat} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ height: 275 }}>
          {!imgFailed && imgSrc ? (
            <img
              src={imgSrc}
              alt={data.name}
              className={`h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 ${loading ? "opacity-0 absolute" : "opacity-100"}`}
              onLoad={() => setLoading(false)}
              onError={() => { setImgFailed(true); setLoading(false); }}
            />
          ) : null}
          {(loading || imgFailed || !imgSrc) && (
            <div className="h-full w-full animate-pulse shimmer-bg flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink/40 border-t-pink" />
                <span className="text-[0.55rem] font-semibold text-pink/60 tracking-widest uppercase animate-pulse">Creando</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse border-2 border-black/30" />
          </div>
          <button
            onClick={handleDelete}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/60 backdrop-blur-sm transition-all hover:bg-red-500/70 hover:text-white active:scale-90"
            title="Eliminar"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3
              className="font-black leading-none tracking-tighter text-white"
              style={{ fontSize: "clamp(15px, 3vw, 20px)", textShadow: "0 2px 10px rgba(0,0,0,0.7)", letterSpacing: "-0.02em" }}
            >
              {data.name}{" "}
              <span className="font-bold text-white/80" style={{ fontSize: "0.8em" }}>{data.age}</span>
            </h3>
            <p
              className="mt-1 leading-snug text-white/80 line-clamp-2"
              style={{ fontSize: "clamp(10px, 2vw, 12px)", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
            >
              {data.story || data.description}
            </p>
          </div>
        </div>
      </Link>
      <div className="p-2.5">
        <Link href="/chat/luna" onClick={handleChat} className="btn-primary flex h-8 w-full items-center justify-center text-[0.55rem] font-bold">
          Chatear con ella
        </Link>
      </div>
    </div>
  );
}
