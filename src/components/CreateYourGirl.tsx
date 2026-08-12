"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { saveCustomGirl, getCustomGirls, deleteCustomGirl, CustomGirlData } from "@/lib/storage";
import { generateGirlImage } from "@/lib/chatClient";

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

function compressImage(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo procesar la imagen"));
    };
    img.src = url;
  });
}

const CONCEPTS: Array<[RegExp, string]> = [
  [/(rat[oó]n|ratoncita|mouse)/, "cute sexy anthropomorphic mouse girl with furry mouse ears, whiskers and a long thin tail"],
  [/(gata|felina)/, "sexy anthropomorphic cat girl with pointed cat ears, whiskers and a sleek tail"],
  [/(perra|canina)/, "playful anthropomorphic dog girl with fluffy dog ears and a tail"],
  [/(conej|bunny)/, "adorable anthropomorphic bunny girl with long rabbit ears and a fluffy tail"],
  [/(zorra|fox)/, "alluring anthropomorphic fox girl with fox ears and a big fluffy tail"],
  [/(loba|wolf)/, "anthropomorphic wolf girl with wolf ears and a bushy tail"],
  [/(cierva|cervatill|deer)/, "graceful anthropomorphic deer girl with small antlers"],
  [/(os[a0]\b|bear)/, "anthropomorphic bear girl with round bear ears"],
];

const FAMOUS: Array<[RegExp, string]> = [
  [/scarlett johansson/, "a stunning woman with wavy honey-blonde hair, green eyes and full lips, resembling the famous actress Scarlett Johansson"],
  [/margot robbie/, "a gorgeous woman with golden blonde hair, blue eyes and doll-like beauty, resembling the famous actress Margot Robbie"],
  [/emma watson/, "an elegant woman with chestnut brown hair, hazel eyes and refined features, resembling the famous actress Emma Watson"],
  [/megan fox/, "a striking woman with long dark hair and piercing exotic eyes, resembling the famous actress Megan Fox"],
  [/gal gadot/, "a statuesque woman with long dark hair, olive skin and a strong jawline, resembling the famous actress Gal Gadot"],
  [/zendaya/, "a glamorous woman with dark wavy hair, glowing skin and a model figure, resembling the famous actress Zendaya"],
  [/ancal?ina jolie|angelina jolie/, "a stunning woman with long dark curls, full lips and striking blue-gray eyes, resembling the famous actress Angelina Jolie"],
  [/kylie jenner/, "a glamorous woman with long dark brown hair, full lips and a curvy figure, resembling the famous influencer Kylie Jenner"],
  [/kim kardashian/, "a curvy glamorous woman with long dark hair and striking features, resembling the famous influencer Kim Kardashian"],
  [/taylor swift/, "a beautiful woman with wavy blonde hair, blue eyes and red lips, resembling the famous singer Taylor Swift"],
  [/ariana grande/, "a petite gorgeous woman with long dark hair in a high ponytail and cat-eye makeup, resembling the famous singer Ariana Grande"],
  [/beyonce/, "a stunning curvy woman with long brown waves and glowing skin, resembling the famous singer Beyonce"],
  [/demi lovato/, "a gorgeous woman with dark brown hair, almond eyes and a warm smile, resembling the famous singer Demi Lovato"],
  [/wonder woman|supergirl|diosa/, "a gorgeous athletic woman resembling a superheroine"],
];

const SETTINGS = [
  "glamorous penthouse living room at night with city skyline lights behind floor-to-ceiling windows, warm brass lamps",
  "luxury hotel suite with big windows, golden hour sunlight and elegant white linen bed",
  "sunlit bedroom with sheer white curtains, soft morning light and cozy warm tones",
  "sunlit bedroom with sheer white curtains, soft morning light and cozy warm tones",
  "dark moody boudoir with warm amber candles and fairy lights, velvet textures",
  "stylish photo studio with softbox lighting, charcoal and warm gold color grading, minimalist set",
  "summer rooftop at dusk with string lights and city skyline, cool blue hour",
  "art-deco hotel corridor with red velvet, brass lamps and dramatic lighting",
  "smoky upscale lounge corner with purple and magenta mood lighting, blurred bokeh",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildPrompt(desc: string, maxSafe = false): string {
  const words = desc.toLowerCase();
  const EXPLICIT = /(desnud|naked|nude|topless|sin ropa|sin nada|al desnudo|sin sujetador|sin bragas|sin panties|en cueros|cuerpo desnudo|porno|sexo|sexy|erot|fuck|follar|follando|masturba|polvo|corrida|penetraci|nsfw|xxx)/;
  const explicit = EXPLICIT.test(words);

  if (maxSafe) {
    return "photorealistic RAW photo of a beautiful adult woman, slim toned figure, wearing an elegant white floral summer dress, standing near a sunlit window, warm natural light, face clearly visible, looking at the camera, soft happy smile";
  }

  let subject = "beautiful adult woman";
  let famous = false;
  for (const [re, text] of FAMOUS) {
    if (re.test(words)) {
      subject = text;
      famous = true;
      break;
    }
  }
  if (!famous) {
    for (const [re, text] of CONCEPTS) {
      if (re.test(words)) {
        subject = text;
        break;
      }
    }
  }
  if (!famous && /(famos|celebr|estrella|actriz|cantante|instagram|influencer)/.test(words))
    subject = `${subject} resembling a famous celebrity`;

  let hair = "long brunette hair";
  if (/(rubia|rubio|blond|golden)/.test(words)) hair = "long blonde hair";
  else if (/(pelirroja|pelirrojo|redhead)/.test(words)) hair = "long red hair";
  else if (/(morena|moreno|brunet|casta[nñ]a|pelo oscuro)/.test(words)) hair = "long brunette hair";
  else if (/(negro|negra|pelo negro|black hair)/.test(words)) hair = "long black hair";

  const isShower = /(ducha|ba[nñ]era|bath|shower|regadera|ba[nñ]o)/.test(words);

  let clothing = "black lace bikini set with high-waist bottoms";
  if (/(enfermera|enfermero|uniforme|m[ée]dica|doctora|disfraz)/.test(words)) {
    clothing = "wearing a tight white nurse uniform, unbuttoned white medical crop top, short white skirt, white nurse cap and white stockings, stethoscope around the neck";
  } else if (/(polic[ií]a|guardia)/.test(words)) {
    clothing = "wearing a tight navy blue police uniform with cap and utility belt";
  } else if (/(camarera|mesera)/.test(words)) {
    clothing = "wearing a short black waitress uniform with white apron and bow tie";
  } else if (/(maid|doncella|criadita|mucama|criada)/.test(words)) {
    clothing = "wearing a black and white French maid outfit";
  } else if (/(profesora|maestra|secretaria|oficina|ejecutiva)/.test(words)) {
    clothing = "wearing a tight white blouse and sleek black pencil skirt, office chic";
  } else if (/(nike|sudadera|hoodie|deportiv|jogger|leggins|camiseta|chaqueta|crop top|pantal[oó]n|street)/.test(words)) {
    clothing = words.includes("nike")
      ? "wearing a black Nike tracksuit jacket open over a crop top"
      : "wearing the streetwear outfit as described";
  } else if (words.includes("uniforme")) {
    clothing = "tight white nurse uniform with unbuttoned top";
  } else if (words.includes("vestido")) {
    clothing = "tight bodycon mini dress";
  } else if (words.includes("bata")) {
    clothing = "elegant sheer silk robe loosely tied";
  } else if (words.includes("abrigo")) {
    clothing = "long open trench coat over a black lace bikini";
  } else if (words.includes("bikini") || words.includes("bañador") || words.includes("traje de baño")) {
    clothing = "tiny string bikini";
  } else if (words.includes("pijama") || words.includes("camisón")) {
    clothing = "silk baby doll nightie, lace trim";
  }

  if (explicit && !isShower) {
    clothing = "wearing a high-waist black lace bikini, elegant and covered";
  }

  let scene = "";
  if (isShower) {
    scene = "in a shower, standing under warm running water, gentle water flow, wet hair, tile wall and soft steam, ";
    clothing = "her shoulders and hips covered by creamy white soap foam, wearing a white one-piece swimsuit underneath, water droplets on her skin";
  }

  let body = "slim toned figure";
  if (/(gorda|gordita|rellenita|llenita|curvy|curvas|voluptuosa|tetas grandes|culo grande|nalgas grandes)/.test(words))
    body = "curvy plus size figure, thick full hips, big thighs, hourglass";
  else if (/(delgada|fina|flaca)/.test(words))
    body = "very slender, thin waist";

  let framing = "professional profile photo, head and shoulders portrait, face perfectly centered, equal headroom, looking directly at the camera with an alluring seductive gaze, soft subtle smile, confident flirtatious expression, candid close-up, natural casual framing, blurred everyday background";
  if (isShower)
    framing = "medium close-up, standing inside the shower, face and upper body in frame, water streams and soap foam around her, looking at the camera with an alluring seductive gaze and a subtle smile, wet bare shoulders";
  else if (words.includes("cama") || words.includes("acostada"))
    framing = "professional profile photo, lying on a bed, head and shoulders slightly angled, face centered, looking at the camera with a seductive gaze";
  else if (words.includes("espejo"))
    framing = "professional profile photo, mirror selfie, head and shoulders, face centered, looking at the camera with an alluring gaze";
  else if (/(bailando|baile|perreando|movi[eé]ndose)/.test(words))
    framing = "medium close-up, dancing, head and shoulders in frame, hips swaying, hair with natural motion, face clearly visible, looking at the camera with a sultry expression";
  else if (/(caminando|paseando|andando)/.test(words))
    framing = "medium close-up, walking toward the camera, head and shoulders in frame, face clearly visible, natural stride, looking at the camera with a confident flirtatious smile";

  let background: string;
  if (isShower)
    background = "emerald tile shower wall, soft steam, clean bathroom light";
  else if (/(playa|arena|mar|piscina|verano|tropical)/.test(words))
    background = "tropical beach at golden hour, soft warm ocean light";
  else if (/(nike|sudadera|hoodie|street|calle|urbano|neon)/.test(words))
    background = "urban street at night with neon signs, cool blue and purple lighting";
  else if (/(gimnasio|gym|yoga|deporte|entren)/.test(words))
    background = "modern gym with warm industrial lighting";
  else
    background = SETTINGS[hashString(words) % SETTINGS.length];

  const safeDesc = explicit
    ? desc
        .replace(/desnud\w*|naked|nude/gi, "")
        .replace(/topless/gi, "")
        .replace(/sin ropa/gi, "")
        .replace(/sin nada/gi, "")
        .replace(/al desnudo/gi, "")
        .replace(/sin sujetador/gi, "")
        .replace(/sin bragas/gi, "")
        .replace(/sin panties/gi, "")
        .replace(/en cueros/gi, "")
        .replace(/porno\w*/gi, "")
        .replace(/sexo\w*|sexual\w*|sexy|erot\w*/gi, "")
        .replace(/fuck|follar\w*|follando/gi, "")
        .replace(/masturb\w*/gi, "")
        .replace(/corrida\w*/gi, "")
        .replace(/penetraci\w*/gi, "")
        .replace(/polvo\w*/gi, "")
        .replace(/nsfw|xxx/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim()
    : desc;
  const head = explicit ? (safeDesc || "a gorgeous playful adult woman") : desc;
  return `photorealistic RAW photo of ${head}, a ${subject}, ${hair}, ${body}, ${clothing}. ` +
    `${scene}${framing}, background: ${background}, ` +
    `candid amateur smartphone snapshot of a real everyday woman, lightly imperfect, natural human skin with visible pores, fine skin texture and small irregularities, slight facial asymmetry, realistic proportions, coherent scenes and background details, sharp focus, soft natural lighting, shallow depth of field, photorealistic, unretouched, realistic photo quality`;
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
  const [genError, setGenError] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "own">("ai");
  const [openSection, setOpenSection] = useState<"roleplay" | "photo" | null>(null);

  useEffect(() => {
    setCustomGirls(getCustomGirls());
  }, []);

  useEffect(() => {
    if (!open) {
setGirlDesc(""); setRoleplayDesc(""); setError(""); setStep("describe"); setSelectedPersonality(""); setCurrentName(""); setGenError(""); setRefImage(null); setMode("ai"); setOpenSection(null);
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

  function handleRefUpload(e: { target: { files: FileList | null } }) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1024;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setRefImage(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handlePersonalityNext() {
    setGenError("");
    const id = generateId();
    const name = currentName;
    const story = roleplayDesc.trim() || `Tu nueva creación, ${name}, te espera para pasar una noche inolvidable.`;
    const customScenario = JSON.stringify({ girl: girlDesc.trim(), roleplay: roleplayDesc.trim() });
    localStorage.setItem("custom_scenario", customScenario);
    if (mode === "own" && refImage) {
      const newGirl: CustomGirlData = {
        id, name, age: generateAge(), story,
        description: girlDesc.trim() || name,
        girlDesc: girlDesc.trim(), roleplayDesc: roleplayDesc.trim(),
        hair: "moreno", background: "neon-room", pose: "toalla",
        personality: selectedPersonality || "atrevida",
        baseId: "luna", imageUrl: refImage,
      };
      saveCustomGirl(newGirl);
      setCustomGirls(getCustomGirls());
      setGenError("");
      setStep("done");
      return;
    }
    setStep("generating");
    const prompt = buildPrompt(girlDesc || roleplayDesc);
    let imageUrl = "";
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const p = attempt === 0 ? prompt : attempt === 1 ? buildPrompt(girlDesc || roleplayDesc, true) : buildPrompt("", true);
      try {
        const blob = await generateGirlImage({ prompt: p, width: 1024, height: 1024, image: refImage || undefined });
        imageUrl = await compressImage(blob);
        break;
      } catch (err) {
        lastErr = String((err as Error)?.message || "");
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    if (!imageUrl) {
      const moderation = /[Pp]etici[oó]n no permitida|moder|safety|blocked|policy|forbidden|nsfw/i.test(lastErr);
      setGenError(moderation ? "Vuelve a intentarlo en unos segundos." : (lastErr || "No se pudo generar la imagen. Comprueba tu conexión y pulsa Reintentar."));
      return;
    }
    const newGirl: CustomGirlData = {
      id, name, age: generateAge(), story,
      description: girlDesc.trim() || name,
      girlDesc: girlDesc.trim(), roleplayDesc: roleplayDesc.trim(),
      hair: "moreno", background: "neon-room", pose: "toalla",
      personality: selectedPersonality || "atrevida",
      baseId: "luna", imageUrl,
    };
    saveCustomGirl(newGirl);
    setCustomGirls(getCustomGirls());
    setGenError("");
    setStep("done");
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col w-full max-w-[520px] max-h-[90dvh] rounded-2xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              style={{ background: "linear-gradient(145deg, #121218, #0B0B0F)" }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {/* Fixed header */}
              <div className="shrink-0 px-6 pt-6 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center gap-2">
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
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <AnimatePresence mode="wait">
                  {step === "describe" && (
                    <motion.div key="describe" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <p className="mb-4 text-xs text-white/45">
                        {mode === "own"
                          ? "Sube tu foto y ella cobrará vida con tu rostro."
                          : "Describe cómo la imaginas y la IA la creará en segundos."}
                      </p>
                      {error && (
                        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>
                      )}

                      {/* Modo */}
                      <div className="mb-5 flex rounded-xl border border-white/[0.10] bg-white/[0.04] p-1">
                        <button onClick={() => setMode("ai")} className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${mode === "ai" ? "bg-[#FF3C88] text-white shadow-[0_0_20px_rgba(255,60,136,0.25)]" : "text-white/60 hover:text-white"}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="3"/></svg>
                          Crear con IA
                        </button>
                        <button onClick={() => { setMode("own"); setOpenSection("photo"); }} className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${mode === "own" ? "bg-[#FF3C88] text-white shadow-[0_0_20px_rgba(255,60,136,0.25)]" : "text-white/60 hover:text-white"}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                          Mi imagen
                        </button>
                      </div>

                      {/* Campo principal */}
                      <label className="mb-2 block text-[0.55rem] font-semibold text-white/50 uppercase tracking-widest">Describe tu fantasía</label>
                      <textarea value={girlDesc} onChange={(e) => { setError(""); setGirlDesc(e.target.value); }}
                        placeholder="Ej: Enfermera de noche, pelo negro, mirada intensa, uniforme blanco ajustado..."
                        rows={4}
                        className="w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#FF3C88]/50 resize-none transition-colors placeholder:text-white/20" />

                      {/* Roleplay plegable */}
                      <button type="button" onClick={() => setOpenSection(openSection === "roleplay" ? null : "roleplay")}
                        className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-white/70 transition hover:text-white">
                        <span className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Roleplay (opcional)
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSection === "roleplay" ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {openSection === "roleplay" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <textarea value={roleplayDesc} onChange={(e) => { setError(""); setRoleplayDesc(e.target.value); }}
                              placeholder="Ej: Me tiene atado a la cama del hospital, se sienta sobre mí..."
                              rows={3}
                              className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#FF3C88]/50 resize-none transition-colors placeholder:text-white/20" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Foto plegable (en "Mi imagen" siempre visible) */}
                      {mode !== "own" && (
                        <button type="button" onClick={() => setOpenSection(openSection === "photo" ? null : "photo")}
                          className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-bold text-white/70 transition hover:text-white">
                          <span className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            Foto de referencia (opcional)
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSection === "photo" ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                      )}
                      <AnimatePresence initial={false}>
                        {(mode === "own" || openSection === "photo") && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            {refImage ? (
                              <div className="relative mt-2">
                                <img src={refImage} alt="Referencia" className="h-28 w-full rounded-xl object-cover object-top" />
                                <button onClick={() => setRefImage(null)} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white">✕</button>
                              </div>
                            ) : (
                              <label className="mt-2 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.15] text-xs text-white/50 transition hover:border-[#FF3C88]/40 hover:text-white/80">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                {mode === "own" ? "Elegir una imagen" : "Subir foto para basar el personaje"}
                                <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
                              </label>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button onClick={handleDescribeNext} disabled={(!girlDesc.trim() && !roleplayDesc.trim()) || (mode === "own" && !refImage)}
                        className="btn-primary mt-5 h-11 w-full text-sm font-bold disabled:opacity-40 active:scale-95 transition-all">
                        Siguiente →
                      </button>
                    </motion.div>
                  )}

                  {step === "personality" && (
                    <motion.div key="personality" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { value: "carinosa", label: "Cariñosa", desc: "Dulce, cercana, siempre pendiente" },
                          { value: "atrevida", label: "Atrevida", desc: "Directa, juguetona, te engancha" },
                          { value: "timida", label: "Tímida", desc: "Vergonzosa pero intensa" },
                          { value: "dominante", label: "Dominante", desc: "Sabe lo que quiere, lidera" },
                        ].map((p) => (
                          <button key={p.value} onClick={() => setSelectedPersonality(p.value)}
                            className={`rounded-xl border p-3.5 text-left transition-all active:scale-95 ${
                              selectedPersonality === p.value
                                ? "border-[#FF3C88]/40 bg-[#FF3C88]/10 text-white shadow-[0_0_20px_rgba(255,60,136,0.15)]"
                                : "border-white/[0.10] bg-white/[0.04] text-white/70 hover:border-white/25"
                            }`}>
                            <p className="text-sm font-bold">{p.label}</p>
                            <p className="mt-0.5 text-[0.5rem] text-white/50">{p.desc}</p>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2.5">
                        <button onClick={() => setStep("describe")} className="h-10 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 text-sm text-white/60 transition hover:text-white active:scale-95">← Atrás</button>
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
                      {genError && (
                        <div className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
                          <p className="text-xs text-red-300">{genError}</p>
                          <button onClick={handlePersonalityNext} className="btn-primary mt-3 h-9 w-full text-xs font-bold active:scale-95 transition-all">
                            Reintentar
                          </button>
                        </div>
                      )}
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

                {/* Custom creations */}
                {customGirls.length > 0 && (
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <h4 className="mb-3 text-xs font-bold text-white/60 uppercase tracking-widest">Tus creaciones</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {customGirls.map((g) => (
                        <div key={g.id} className="group relative shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]" style={{ flex: "0 0 130px" }}>
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
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
