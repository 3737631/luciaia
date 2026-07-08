"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

type WizardStep = "describe" | "personality" | "generating" | "done";

export default function CreateYourGirl() {
  const [girlDesc, setGirlDesc] = useState("");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [customGirls, setCustomGirls] = useState<CustomGirlData[]>([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState<WizardStep>("describe");
  const [selectedPersonality, setSelectedPersonality] = useState("");
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    setCustomGirls(getCustomGirls());
  }, []);

  function handleDescribeNext() {
    setError("");
    if (!girlDesc.trim() && !roleplayDesc.trim()) return;
    const combined = (girlDesc + " " + roleplayDesc).trim();
    const blockReason = containsMinorReferences(combined);
    if (blockReason) { setError(blockReason); return; }
    setCurrentName(generateName(girlDesc || roleplayDesc));
    setStep("personality");
  }

  function handlePersonalityNext() {
    setStep("generating");
    const id = generateId();
    const name = currentName;
    const story = roleplayDesc.trim() || `Tu nueva creación, ${name}, te espera para pasar una noche inolvidable.`;
    const params = buildPrompt(girlDesc || roleplayDesc);
    const imageUrl = `https://image.pollinations.ai/prompt/${params}&width=512&height=640&nofeed=true&seed=${Date.now()}`;
    const customScenario = JSON.stringify({ girl: girlDesc.trim(), roleplay: roleplayDesc.trim() });
    localStorage.setItem("custom_scenario", customScenario);
    const newGirl: CustomGirlData = {
      id, name, age: generateAge(), story,
      description: girlDesc.trim() || name,
      girlDesc: girlDesc.trim(), roleplayDesc: roleplayDesc.trim(),
      hair: "moreno", background: "neon-room", pose: "toalla",
      personality: selectedPersonality || "atrevida",
      baseId: "luna", imageUrl,
    };
    setTimeout(() => {
      saveCustomGirl(newGirl);
      setCustomGirls(getCustomGirls());
      setStep("done");
    }, 2000);
  }

  function handleReset() {
    setGirlDesc("");
    setRoleplayDesc("");
    setError("");
    setStep("describe");
    setSelectedPersonality("");
    setCurrentName("");
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
        Asistente paso a paso para crear tu chica ideal.
      </p>

      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {(["describe", "personality", "generating"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.55rem] font-bold transition-all duration-300 ${
                step === s ? "bg-pink text-white shadow-[0_0_16px_rgba(255,59,127,0.5)]" :
                ["generating", "done"].includes(step) && i <= 1 ? "bg-green-500/30 text-green-400" : "bg-white/[0.06] text-white/40"
              }`}>
                {["generating", "done"].includes(step) && i <= 1 ? "✓" : i + 1}
              </div>
              {i < 2 && <div className={`h-px w-8 sm:w-12 ${["generating", "done"].includes(step) && i < 1 ? "bg-green-500/50" : "bg-white/[0.08]"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "describe" && (
            <motion.div key="describe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>
              )}
              <p className="mb-4 text-sm font-semibold text-white/80">Paso 1: Describe a tu chica</p>
              <label className="mb-1.5 block text-xs font-semibold text-white/70 uppercase tracking-wider">Apariencia</label>
              <textarea
                value={girlDesc}
                onChange={(e) => { setError(""); setGirlDesc(e.target.value); }}
                placeholder="Ej: Una enfermera de noche, pelo negro, mirada intensa, uniforme blanco ajustado..."
                rows={3}
                className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
              />
              <label className="mb-1.5 mt-4 block text-xs font-semibold text-white/70 uppercase tracking-wider">Roleplay (opcional)</label>
              <textarea
                value={roleplayDesc}
                onChange={(e) => { setError(""); setRoleplayDesc(e.target.value); }}
                placeholder="Ej: Me tiene atado a la cama del hospital, se sienta sobre mí..."
                rows={3}
                className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink/50 resize-none transition-colors placeholder:text-white/25"
              />
              <button
                onClick={handleDescribeNext}
                disabled={!girlDesc.trim() && !roleplayDesc.trim()}
                className="btn-primary mt-4 h-11 px-6 text-sm font-bold disabled:opacity-40 active:scale-95 transition-all"
              >
                Siguiente →
              </button>
            </motion.div>
          )}

          {step === "personality" && (
            <motion.div key="personality" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <p className="mb-3 text-sm font-semibold text-white/80">Paso 2: Elige su personalidad</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "carinosa", label: "Cariñosa", icon: "🥰", desc: "Dulce, cercana, siempre pendiente de ti" },
                  { value: "atrevida", label: "Atrevida", icon: "🔥", desc: "Directa, juguetona, te mantiene enganchado" },
                  { value: "timida", label: "Tímida", icon: "💕", desc: "Se abre poco a poco, vergonzosa pero intensa" },
                  { value: "dominante", label: "Dominante", icon: "👑", desc: "Sabe lo que quiere, lleva la conversación" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPersonality(p.value)}
                    className={`rounded-xl border p-4 text-left transition-all active:scale-95 ${
                      selectedPersonality === p.value
                        ? "border-pink/40 bg-pink/10 text-white shadow-[0_0_20px_rgba(255,59,127,0.15)]"
                        : "border-white/[0.10] bg-white/[0.04] text-white/70 hover:border-white/25"
                    }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <p className="mt-1 text-sm font-bold">{p.label}</p>
                    <p className="mt-0.5 text-[0.55rem] text-white/50">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => setStep("describe")} className="h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] px-5 text-sm text-white/60 transition hover:text-white active:scale-95">
                  ← Atrás
                </button>
                <button
                  onClick={handlePersonalityNext}
                  className="btn-primary h-11 flex-1 text-sm font-bold active:scale-95 transition-all"
                >
                  {selectedPersonality ? `Crear a ${currentName}` : "Crear sin personalidad"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "generating" && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center py-8">
              <motion.div
                className="h-16 w-16 rounded-full border-2 border-pink/40 border-t-pink"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className="mt-4 text-sm font-semibold text-pink"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Generando a {currentName}...
              </motion.p>
              <motion.div className="mt-6 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-pink/60"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
              <p className="mt-4 text-[0.55rem] text-white/40">La IA está creando su imagen y personalidad...</p>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col items-center py-4">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
                <p className="mt-3 text-lg font-bold text-white">{currentName} ha sido creada</p>
                <p className="mt-1 text-xs text-white/50">Aparecerá en la sección Tus creaciones</p>
                <button onClick={handleReset} className="btn-primary mt-5 h-10 px-6 text-sm font-bold active:scale-95 transition-all">
                  Crear otra chica
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {customGirls.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-bold tracking-tight text-white" style={{ fontSize: "clamp(18px, 3vw, 24px)", letterSpacing: "-0.03em" }}>
            Tus creaciones
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {customGirls.map((girl) => (
              <CustomCard key={girl.id} data={girl} onDeleted={() => setCustomGirls(getCustomGirls())} />
            ))}
          </div>
        </div>
      )}
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
            <h3 className="font-black leading-none tracking-tighter text-white" style={{ fontSize: "clamp(15px, 3vw, 20px)", textShadow: "0 2px 10px rgba(0,0,0,0.7)", letterSpacing: "-0.02em" }}>
              {data.name}{" "}
              <span className="font-bold text-white/80" style={{ fontSize: "0.8em" }}>{data.age}</span>
            </h3>
            <p className="mt-1 leading-snug text-white/80 line-clamp-2" style={{ fontSize: "clamp(10px, 2vw, 12px)", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              {data.story || data.description}
            </p>
          </div>
        </div>
      </Link>
      <div className="p-2.5">
        <Link href="/chat/luna" onClick={handleChat} className="btn-primary flex h-8 w-full items-center justify-center text-[0.55rem] font-bold active:scale-95 transition-all">
          Chatear con ella
        </Link>
      </div>
    </div>
  );
}
