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

export default function CreateYourGirl({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  useEffect(() => {
    if (!open) {
      setGirlDesc(""); setRoleplayDesc(""); setError(""); setStep("describe"); setSelectedPersonality(""); setCurrentName("");
    }
  }, [open]);

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
    setGirlDesc(""); setRoleplayDesc(""); setError(""); setStep("describe"); setSelectedPersonality(""); setCurrentName("");
  }

  function handleDelete(g: CustomGirlData) {
    deleteCustomGirl(g.id);
    setCustomGirls(getCustomGirls());
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/[0.08] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            style={{ background: "linear-gradient(145deg, #121218, #0B0B0F)" }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black tracking-tight text-white">
                {step === "describe" ? "Crear personaje" :
                 step === "personality" ? "Elige personalidad" :
                 step === "generating" ? "Generando..." : "¡Creada!"}
              </h3>
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/40 transition hover:bg-white/[0.12] hover:text-white active:scale-90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Step indicator */}
            <div className="mb-5 flex items-center gap-2">
              {(["describe", "personality", "generating"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.5rem] font-bold transition-all duration-300 ${
                    step === s ? "bg-[#FF3C88] text-white shadow-[0_0_16px_rgba(255,60,136,0.5)]" :
                    ["generating", "done"].includes(step) && i <= 1 ? "bg-[#30D158]/30 text-[#30D158]" : "bg-white/[0.06] text-white/40"
                  }`}>
                    {["generating", "done"].includes(step) && i <= 1 ? "✓" : i + 1}
                  </div>
                  {i < 2 && <div className={`h-px w-8 ${["generating", "done"].includes(step) && i < 1 ? "bg-[#30D158]/50" : "bg-white/[0.08]"}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === "describe" && (
                <motion.div key="describe" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  {error && (
                    <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>
                  )}
                  <label className="mb-1.5 block text-[0.55rem] font-semibold text-white/50 uppercase tracking-widest">Apariencia</label>
                  <textarea value={girlDesc} onChange={(e) => { setError(""); setGirlDesc(e.target.value); }}
                    placeholder="Ej: Una enfermera de noche, pelo negro, mirada intensa, uniforme blanco ajustado..."
                    rows={3}
                    className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#FF3C88]/50 resize-none transition-colors placeholder:text-white/20" />
                  <label className="mb-1.5 mt-3 block text-[0.55rem] font-semibold text-white/50 uppercase tracking-widest">Roleplay (opcional)</label>
                  <textarea value={roleplayDesc} onChange={(e) => { setError(""); setRoleplayDesc(e.target.value); }}
                    placeholder="Ej: Me tiene atado a la cama del hospital, se sienta sobre mí..."
                    rows={3}
                    className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#FF3C88]/50 resize-none transition-colors placeholder:text-white/20" />
                  <button onClick={handleDescribeNext} disabled={!girlDesc.trim() && !roleplayDesc.trim()}
                    className="btn-primary mt-4 h-10 w-full text-sm font-bold disabled:opacity-40 active:scale-95 transition-all">
                    Siguiente →
                  </button>
                </motion.div>
              )}

              {step === "personality" && (
                <motion.div key="personality" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { value: "carinosa", label: "Cariñosa", icon: "🥰", desc: "Dulce, cercana, siempre pendiente" },
                      { value: "atrevida", label: "Atrevida", icon: "🔥", desc: "Directa, juguetona, te engancha" },
                      { value: "timida", label: "Tímida", icon: "💕", desc: "Vergonzosa pero intensa" },
                      { value: "dominante", label: "Dominante", icon: "👑", desc: "Sabe lo que quiere, lidera" },
                    ].map((p) => (
                      <button key={p.value} onClick={() => setSelectedPersonality(p.value)}
                        className={`rounded-xl border p-3.5 text-left transition-all active:scale-95 ${
                          selectedPersonality === p.value
                            ? "border-[#FF3C88]/40 bg-[#FF3C88]/10 text-white shadow-[0_0_20px_rgba(255,60,136,0.15)]"
                            : "border-white/[0.10] bg-white/[0.04] text-white/70 hover:border-white/25"
                        }`}>
                        <span className="text-xl">{p.icon}</span>
                        <p className="mt-1 text-sm font-bold">{p.label}</p>
                        <p className="mt-0.5 text-[0.5rem] text-white/50">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2.5">
                    <button onClick={() => setStep("describe")} className="h-10 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 text-sm text-white/60 transition hover:text-white active:scale-95">
                      ← Atrás
                    </button>
                    <button onClick={handlePersonalityNext} className="btn-primary h-10 flex-1 text-sm font-bold active:scale-95 transition-all">
                      {selectedPersonality ? `Crear a ${currentName}` : "Crear sin personalidad"}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "generating" && (
                <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center py-8">
                  <motion.div className="h-16 w-16 rounded-full border-2 border-[#FF3C88]/40 border-t-[#FF3C88]" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  <motion.p className="mt-4 text-sm font-semibold text-[#FF3C88]" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    Generando a {currentName}...
                  </motion.p>
                  <div className="mt-6 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div key={i} className="h-2 w-2 rounded-full bg-[#FF3C88]/60" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                  <p className="mt-4 text-[0.5rem] text-white/40">La IA está creando su imagen y personalidad...</p>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  <div className="flex flex-col items-center py-4">
                    <motion.div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#30D158]/20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </motion.div>
                    <p className="mt-3 text-lg font-bold text-white">{currentName} ha sido creada</p>
                    <p className="mt-1 text-xs text-white/50">Aparecerá abajo en Tus creaciones</p>
                    <button onClick={handleReset} className="btn-primary mt-5 h-10 w-full text-sm font-bold active:scale-95 transition-all">
                      Crear otra chica
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom girls preview in modal */}
            {customGirls.length > 0 && (
              <div className="mt-5 border-t border-white/[0.06] pt-4">
                <h4 className="mb-3 text-xs font-bold text-white/60 uppercase tracking-widest">Tus creaciones</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {customGirls.map((g) => (
                    <div key={g.id} className="group shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]" style={{ flex: "0 0 130px" }}>
                      <Link href="/chat/luna" onClick={() => { localStorage.setItem("custom_scenario", JSON.stringify({ girl: g.girlDesc, roleplay: g.roleplayDesc })); onClose(); }} className="block">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img src={g.imageUrl} alt={g.name} className="h-full w-full object-cover object-top" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-xs font-bold text-white">{g.name}</p>
                            <p className="text-[0.45rem] text-white/50">{g.age} años</p>
                          </div>
                        </div>
                      </Link>
                      <button onClick={() => handleDelete(g)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white/40 opacity-0 transition hover:bg-red-500/70 hover:text-white group-hover:opacity-100 active:scale-90">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
