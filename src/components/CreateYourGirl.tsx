"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { saveCustomGirl, getCustomGirls, CustomGirlData } from "@/lib/storage";

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

  let clothing = "wearing only a tiny thong bikini and revealing lingerie, high heels";
  if (words.includes("uniforme")) clothing = "wearing a tight revealing uniform";
  else if (words.includes("vestido")) clothing = "wearing a tight short dress";
  else if (words.includes("bata")) clothing = "wearing a sheer silk robe open";
  else if (words.includes("abrigo")) clothing = "wearing only a long open coat";
  else if (words.includes("desnuda") || words.includes("desnudo"))
    clothing = "nude but covered with hands or silk, no visible nipples or genitals";

  let body = "slim body, small natural breasts, toned";
  if (words.includes("tetas grandes") || words.includes("curvas") || words.includes("curvy") || words.includes("culo grande") || words.includes("nalgas grandes"))
    body = "curvy body, large breasts, big round butt";
  else if (words.includes("delgada") || words.includes("fina") || words.includes("flaca"))
    body = "very slim body, very small breasts";
  else if (words.includes("gordita") || words.includes("rellenita"))
    body = "plus size body, full thick curves";

  let pose = "full body shot, standing pose, looking at camera";
  if (words.includes("sentada") || words.includes("silla")) pose = "sitting on a chair, full body, legs crossed";
  else if (words.includes("cama") || words.includes("acostada")) pose = "lying seductively on a bed, full body";
  else if (words.includes("de rodillas")) pose = "kneeling on the floor, full body";

  return encodeURIComponent(
    `ultra realistic full body photo of a stunning breathtaking woman, ${desc}, ${clothing}, ${body}, ${pose}, hyperrealistic skin texture, professional studio photography, cinematic lighting, sharp focus, 8k, highly detailed, intimate boudoir style, natural expression`
  );
}

export default function CreateYourGirl() {
  const [girlDesc, setGirlDesc] = useState("");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);

  useEffect(() => {
    setCustomGirls(getCustomGirls());
  }, []);

  function handleCreate() {
    if (!girlDesc.trim() && !roleplayDesc.trim()) return;
    const id = generateId();
    const name = generateName(girlDesc || roleplayDesc);
    const story = roleplayDesc.trim() || `Tu nueva creación, ${name}, te espera para pasar una noche inolvidable.`;
    const prompt = buildPrompt(girlDesc || roleplayDesc);
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=640&nofeed=true&seed=${Date.now()}`;
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
        Describe a tu chica ideal y el roleplay. Se generará una imagen realista de cuerpo entero con IA.
      </p>
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <label className="mb-1.5 block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Describe a tu chica
        </label>
        <textarea
          value={girlDesc}
          onChange={(e) => setGirlDesc(e.target.value)}
          placeholder="Ej: Una enfermera de noche, pelo negro, mirada intensa, voz ronca, uniforme blanco ajustado..."
          rows={3}
          className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
        />
        <label className="mb-1.5 mt-4 block text-xs font-semibold text-white/70 uppercase tracking-wider">
          Describe el roleplay
        </label>
        <textarea
          value={roleplayDesc}
          onChange={(e) => setRoleplayDesc(e.target.value)}
          placeholder="Ej: Me tiene atado a la cama del hospital, se sienta sobre mí y me susurra que nadie va a interrumpirnos..."
          rows={3}
          className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
        />
        <button
          onClick={handleCreate}
          disabled={!girlDesc.trim() && !roleplayDesc.trim()}
          className="btn-primary mt-4 h-11 px-6 text-sm font-bold disabled:opacity-40"
        >
          Crear chica personalizada
        </button>
      </div>

      {customGirls.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-bold tracking-tight text-white" style={{ fontSize: "clamp(18px, 3vw, 24px)", letterSpacing: "-0.03em" }}>
            Tus creaciones
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {customGirls.map((girl) => (
              <CustomCard key={girl.id} data={girl} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomCard({ data }: { data: CustomGirlData }) {
  const [imgFailed, setImgFailed] = useState(false);
  const imgSrc = data.imageUrl || "";

  function handleChat() {
    localStorage.setItem("custom_scenario", JSON.stringify({ girl: data.girlDesc, roleplay: data.roleplayDesc }));
  }

  return (
    <div className="group shrink-0 character-card overflow-hidden" style={{ flex: "0 0 220px" }}>
      <Link href="/chat/luna" onClick={handleChat} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ height: 275 }}>
          {imgSrc && !imgFailed ? (
            <img
              src={imgSrc}
              alt={data.name}
              className="h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink/20 to-purple/20">
              <span className="text-[0.6rem] text-white/40">Generando...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute left-2.5 top-2.5">
            <span className="flex h-3.5 w-3.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse border-2 border-black/30" />
          </div>
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
