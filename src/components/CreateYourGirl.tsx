"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveCustomGirl, CustomGirlData } from "@/lib/storage";
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

function Dice3D({ spinning }: { spinning: boolean }) {
  const dots = [
    [0, 0, 0, 0, 1, 0, 0, 0, 0], // 1
    [1, 0, 0, 0, 0, 0, 0, 0, 1], // 2
    [1, 0, 0, 0, 1, 0, 0, 0, 1], // 3
    [1, 0, 1, 0, 0, 0, 1, 0, 1], // 4
    [1, 0, 1, 0, 1, 0, 1, 0, 1], // 5
    [1, 0, 1, 1, 0, 1, 1, 0, 1], // 6
  ];
  return (
    <div className={`dice3d ${spinning ? "dice3d--spin" : ""}`}>
      <div className="dice3d__cube">
        {dots.map((face, i) => (
          <div key={i} className="dice3d__face" style={{ transform: faceTransform(i) }}>
            {face.map((hasDot, j) => hasDot ? <span key={j} className="dice3d__dot" /> : <span key={j} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function faceTransform(i: number): string {
  const t = 18 / 2;
  switch (i) {
    case 0: return `translateZ(${t}px)`;
    case 1: return `rotateX(90deg) translateZ(${t}px)`;
    case 2: return `rotateX(180deg) translateZ(${t}px)`;
    case 3: return `rotateX(-90deg) translateZ(${t}px)`;
    case 4: return `rotateY(90deg) translateZ(${t}px)`;
    default: return `rotateY(-90deg) translateZ(${t}px)`;
  }
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
  } else if (words.includes("chaleco")) {
    clothing = "wearing a tight fitted vest (chaleco) over bare skin, unbuttoned showing a hint of cleavage, sexy elegant look";
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

  let framing = "head and shoulders portrait, looking directly at the camera with a natural confident expression and a soft subtle smile";
  if (isShower)
    framing = "standing inside the shower, face and upper body in frame, water streams and soft foam around her, looking at the camera with a natural gaze and a subtle smile";
  else if (words.includes("cama") || words.includes("acostada"))
    framing = "lying on a bed, head and shoulders slightly angled, looking at the camera with a relaxed natural gaze";
  else if (words.includes("espejo"))
    framing = "near a mirror, head and shoulders, looking at the camera";
  else if (/(bailando|baile|perreando|movi[eé]ndose)/.test(words))
    framing = "dancing, head and shoulders in frame, hair with natural motion, face clearly visible, looking at the camera";
  else if (/(caminando|paseando|andando)/.test(words))
    framing = "walking toward the camera, head and shoulders in frame, face clearly visible, natural stride, looking at the camera";

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
  return `Realistic photo of ${head}, ${subject}, ${hair}, ${body}, ${clothing}. ${scene}${framing}. The scene is set in ${background}.`;
}

type WizardStep = "describe" | "generating" | "done";

// Prompt SEGURO para el avatar (foto de perfil). El Horde censura si detecta
// contenido explícito en el prompt, así que usamos un retrato limpio sin
// descripciones de ropa o connotaciones explícitas.
function buildAvatarPrompt(desc: string): string {
  const w = desc.toLowerCase();
  let hair = "long dark brown hair";
  if (/(rubia|rubio|blond|golden)/.test(w)) hair = "long blonde hair";
  else if (/(pelirroja|pelirrojo|redhead)/.test(w)) hair = "long red hair";
  else if (/(negra|negro|pelo negro|black hair)/.test(w)) hair = "long black hair";
  else if (/(rosa|pink hair)/.test(w)) hair = "long pink hair";
  else if (/(casta[nñ]a|morena|moreno|brunet)/.test(w)) hair = "long dark brown hair";
  let eyes = "brown eyes";
  if (/(ojos azules|blue eyes)/.test(w)) eyes = "blue eyes";
  else if (/(ojos verdes|green eyes)/.test(w)) eyes = "green eyes";
  else if (/(ojos grises|ojos claros|ojos de hielo|hielo)/.test(w)) eyes = "ice blue eyes";
  return `photorealistic casual selfie photo of a beautiful adult woman in her mid 20s with ${hair} and ${eyes}, natural smartphone photo taken with a front camera, perfectly centered square composition, the face is dead center of the image filling the frame with even margins on all sides, head and shoulders tightly centered, camera directly facing her, extremely realistic human skin rendered pixel by pixel with visible pores, fine vellus hairs, natural skin grain and micro texture, subtle skin blemishes and faint redness in cheeks, believable subsurface scattering, matte natural skin, slight natural shine on the skin, detailed iris with natural highlights, individual eyelashes, softly shaped natural brows, light natural makeup, natural smile, wearing a simple elegant black top, perfectly symmetrical clothing with both sleeves identical, proportionate normal shoulders and neck, natural human proportions, sharp focus on the eyes, soft natural window light with gentle catchlights, shallow depth of field, blurred neutral background, square profile picture crop for a circular avatar, the circle will cut the edges so the face must stay perfectly centered, no full body, no chest, no cleavage, candid real photography, must look like a real photo of a real person, raw camera photo with sensor noise and natural color grading, not CGI, no plastic skin, no wax skin, no airbrushed face, no beauty filter, no 3D render look, no anime, no illustration, no glossy skin, no skin blur, no distorted anatomy, no extra limbs, no missing sleeve, no oversized body parts, no giant hands, no deformed face`;
}

export default function CreateYourGirl({ open, onClose, onCreated, editGirl }: { open: boolean; onClose: () => void; onCreated?: () => void; editGirl?: CustomGirlData | null }) {
  const [girlDesc, setGirlDesc] = useState("");
  const [roleplayDesc, setRoleplayDesc] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<WizardStep>("describe");
  const [selectedPersonality, setSelectedPersonality] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [genError, setGenError] = useState("");
  const [diceSpin, setDiceSpin] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<"roleplay" | "photo" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
setGirlDesc(""); setRoleplayDesc(""); setError(""); setStep("describe"); setSelectedPersonality(""); setCurrentName(""); setGenError(""); setRefImage(null); setOpenSection(null);
    } else if (editGirl) {
      setGirlDesc(editGirl.girlDesc || "");
      setRoleplayDesc(editGirl.roleplayDesc || "");
      setSelectedPersonality(editGirl.personality || "");
      setCurrentName(editGirl.name || "");
      setRefImage(null);
      setStep("describe");
      setGenError("");
      setError("");
    }
  }, [open, editGirl]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo(0, 0);
      const b = document.body;
      const h = document.documentElement;
      const origB = { position: b.style.position, top: b.style.top, left: b.style.left, right: b.style.right, overflow: b.style.overflow };
      const origH = { overflow: h.style.overflow, overscrollBehavior: h.style.overscrollBehavior };
      const y = window.scrollY;
      h.style.overflow = "hidden";
      h.style.overscrollBehavior = "none";
      b.style.position = "fixed";
      b.style.top = `-${y}px`;
      b.style.left = "0";
      b.style.right = "0";
      b.style.overflow = "hidden";
      let startY = 0;
      const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
      const prevent = (e: TouchEvent) => {
        const el = scrollRef.current;
        if (!el) { e.preventDefault(); return; }
        const t = e.target as Node;
        if (!el.contains(t)) { e.preventDefault(); return; }
        const max = el.scrollHeight - el.clientHeight;
        const dy = startY - e.touches[0].clientY;
        if ((dy > 0 && el.scrollTop >= max) || (dy < 0 && el.scrollTop <= 0)) e.preventDefault();
      };
      document.addEventListener("touchstart", onStart, { passive: true });
      document.addEventListener("touchmove", prevent, { passive: false });
      return () => {
        document.removeEventListener("touchstart", onStart);
        document.removeEventListener("touchmove", prevent);
        b.style.position = origB.position;
        b.style.top = origB.top;
        b.style.left = origB.left;
        b.style.right = origB.right;
        b.style.overflow = origB.overflow;
        h.style.overflow = origH.overflow;
        h.style.overscrollBehavior = origH.overscrollBehavior;
        window.scrollTo(0, y);
      };
    }
  }, [open]);

  function handleDescribeNext() {
    setError("");
    let name = currentName.trim();
    // El nombre es obligatorio: si está vacío, la app lo asigna automáticamente.
    if (!name) name = generateName(girlDesc || roleplayDesc);
    setCurrentName(name);
    const combined = (girlDesc + " " + roleplayDesc).trim();
    const blockReason = containsMinorReferences(combined);
    if (blockReason) { setError(blockReason); return; }
    handlePersonalityNext();
  }

  function handleRefUpload(e: { target: { files: FileList | null } }) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 256;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setRefImage(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

async function handlePersonalityNext() {
    setGenError("");
    setStep("generating");
    const id = editGirl?.id || generateId();
    const name = currentName.trim();
    const story = roleplayDesc.trim() || `Tu nueva creación, ${name}, te espera para pasar una noche inolvidable.`;
    const customScenario = JSON.stringify({ girl: girlDesc.trim(), roleplay: roleplayDesc.trim() });
    localStorage.setItem("custom_scenario", customScenario);

    const newGirl: CustomGirlData = {
      id, name, age: editGirl?.age ?? generateAge(), story,
      description: girlDesc.trim() || name,
      girlDesc: girlDesc.trim(), roleplayDesc: roleplayDesc.trim(),
      hair: editGirl?.hair || "moreno", background: editGirl?.background || "neon-room", pose: editGirl?.pose || "toalla",
      personality: selectedPersonality || "atrevida",
      baseId: editGirl?.baseId || "luna",
      imageUrl: refImage || editGirl?.imageUrl || undefined,
    };

    // Sin foto: la IA crea el avatar (cuadrado 512x512) antes de navegar,
    // para que el chat siempre muestre una foto.
    if (!refImage && !editGirl?.imageUrl) {
      try {
        const prompt = buildAvatarPrompt(girlDesc || roleplayDesc);
        const blob = await generateGirlImage({ prompt, width: 1024, height: 1024, avatar: true });
        const avatarUrl = await compressImage(blob);
        newGirl.imageUrl = avatarUrl;
      } catch (err) {
        console.error("avatar IA falla:", err);
      }
    }
    saveCustomGirl(newGirl);
    setStep("done");

    if (editGirl) {
      // Edición: cerrar sin navegar.
      onCreated?.();
      onClose();
      return;
    }

    // Ir directamente al chat con la chica creada.
    router.push(`/chat/luna?custom=${id}`);
    onClose();
  }

  function handleReset() {
    setGirlDesc(""); setRoleplayDesc(""); setError(""); setStep("describe"); setSelectedPersonality(""); setCurrentName("");
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
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Header fijo: sin fondo, igual que el resto del modal */}
              <div className="-mx-5 shrink-0 px-5 pb-5 pt-[calc(3rem+env(safe-area-inset-top))] sm:pt-[calc(4rem+env(safe-area-inset-top))]">
                <div className="flex items-start justify-between">
                  <h3 className="text-[1.75rem] font-bold leading-tight tracking-tight text-white">
                    {step === "describe" ? "Diseña tu chica ideal" :
                     step === "generating" ? "Creando..." : "¡Creada!"}
                  </h3>
                  {step === "describe" && (
                    <button
                      onClick={onClose}
                      aria-label="Cerrar"
                      className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition hover:bg-white/[0.07] hover:text-white active:scale-95"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
                {step === "describe" && (
                  <p className="mt-1.5 text-sm text-white/40">Dale forma, personalidad y estilo. Sin prisas.</p>
                )}

                {/* Progress line */}
                <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: step === "describe" ? "45%" : step === "generating" ? "85%" : "100%",
                      background: "linear-gradient(135deg, #FF5798, #FF6AA5)",
                    }}
                  />
                </div>
              </div>

              {/* Body scrollable */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overscroll-contain pb-32"
                style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", touchAction: "pan-y" }}
              >

              {/* Body */}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {step === "describe" && (
                    <motion.div key="describe" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      {error && (
                        <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>
                      )}

                      {/* Campo nombre */}
                      <label className="mb-2.5 block text-[0.85rem] font-semibold tracking-wide text-white/80">Nombre de tu chica</label>
                      <div className="relative">
                        <input value={currentName} onChange={(e) => { setError(""); setCurrentName(e.target.value); }}
                          placeholder="Ej: Luna"
                          maxLength={20}
                          className="h-14 w-full rounded-2xl border border-white/[0.06] bg-white/[0.05] pl-5 pr-14 text-[1.05rem] font-medium text-white outline-none backdrop-blur-md transition-all placeholder:text-white/25 focus:border-[#FF5798]/40 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(255,87,152,0.08)]" />
                        <button
                          type="button"
                          onClick={() => {
                            setDiceSpin(true);
                            window.setTimeout(() => setDiceSpin(false), 750);
                            setCurrentName(generateName(girlDesc || roleplayDesc));
                          }}
                          title="Nombre al azar"
                          className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-white/[0.07] active:scale-90"
                        >
                          <Dice3D spinning={diceSpin} />
                        </button>
                      </div>

                      {/* Campo principal */}
                      <label className="mb-2.5 mt-7 block text-[0.85rem] font-semibold tracking-wide text-white/80">Describe cómo la imaginas</label>
                      <textarea value={girlDesc} onFocus={() => setOpenSection(null)} onChange={(e) => { setError(""); setGirlDesc(e.target.value); }}
                        placeholder="Cuéntame cómo quieres que sea..."
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-white/[0.06] bg-white/[0.05] px-5 py-4 text-[0.95rem] leading-relaxed text-white outline-none transition-all placeholder:text-white/25 focus:border-[#FF5798]/30 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(255,87,152,0.06)]" />

                      {/* Sugerencias rápidas cuando está vacío */}
                      {!girlDesc.trim() && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[
                            { label: "✨ Apariencia", hint: "de pelo largo y oscuro, ojos verdes" },
                            { label: "👗 Estilo", hint: "elegante, con un vestido negro ajustado" },
                            { label: "💫 Personalidad", hint: "dulce, coqueta y con mucha actitud" },
                          ].map((s) => (
                            <button key={s.label} type="button" onClick={() => setGirlDesc(s.hint)}
                              className="rounded-full bg-white/[0.05] px-3.5 py-2 text-[0.8rem] font-medium text-white/55 transition hover:bg-white/[0.09] hover:text-white active:scale-95">
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Roleplay desplegable */}
                      <button type="button" onClick={() => setOpenSection(openSection === "roleplay" ? null : "roleplay")}
                        className="mt-6 flex w-full items-center justify-between rounded-2xl px-1 py-2 text-[0.95rem] font-semibold text-white/90 transition hover:text-white">
                        <span className="flex items-center gap-2">
                          Roleplay
                          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-white/45">Opcional</span>
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSection === "roleplay" ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {openSection === "roleplay" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                            <div className="mt-1">
                              <p className="text-[0.8rem] text-white/40">Personalidad</p>
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                {[
                                  { value: "carinosa", label: "Cariñosa" },
                                  { value: "atrevida", label: "Atrevida" },
                                  { value: "timida", label: "Tímida" },
                                  { value: "dominante", label: "Dominante" },
                                ].map((p) => {
                                  const active = selectedPersonality === p.value;
                                  return (
                                    <button key={p.value} type="button" onClick={() => setSelectedPersonality(active ? "" : p.value)}
                                      className={`rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-all active:scale-95 ${
                                        active
                                          ? "bg-[#FF5798] text-white shadow-[0_4px_16px_rgba(255,87,152,0.35)]"
                                          : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09] hover:text-white"
                                      }`}>
                                      {p.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <textarea value={roleplayDesc} onChange={(e) => { setError(""); setRoleplayDesc(e.target.value); }}
                              placeholder="Ej: me tiene atado a la cama del hospital..."
                              rows={2}
                              className="mt-3 w-full resize-none rounded-2xl border border-white/[0.06] bg-white/[0.05] px-5 py-3.5 text-[0.9rem] text-white outline-none transition-all placeholder:text-white/25 focus:border-[#FF5798]/30 focus:bg-white/[0.08]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Foto de perfil desplegable */}
                      <button type="button" onClick={() => setOpenSection(openSection === "photo" ? null : "photo")}
                        className="mt-6 flex w-full items-center justify-between rounded-2xl px-1 py-2 text-[0.95rem] font-semibold text-white/90 transition hover:text-white">
                        <span className="flex items-center gap-2">
                          Foto de perfil
                          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-white/45">Opcional</span>
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSection === "photo" ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {openSection === "photo" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                            <div className="mt-1.5 space-y-2.5">
                              {refImage ? (
                                <div className="relative">
                                  <img src={refImage} alt="Referencia" className="h-28 w-full rounded-2xl object-cover object-top" />
                                  <button onClick={() => setRefImage(null)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white backdrop-blur-md">✕</button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-[0.8rem] text-white/40">La IA puede crearla por ti</p>
                                  <label className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-white/[0.05] text-[0.85rem] font-semibold text-white/80 transition hover:bg-white/[0.09] hover:text-white active:scale-[0.99]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                    Subir foto
                                    <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
                                  </label>
                                  <div className="flex items-center gap-3 py-0.5">
                                    <div className="h-px flex-1 bg-white/[0.07]" />
                                    <span className="text-[0.7rem] text-white/30">o</span>
                                    <div className="h-px flex-1 bg-white/[0.07]" />
                                  </div>
                                  <div className="rounded-2xl bg-white/[0.04] px-4 py-3.5">
                                    <p className="text-[0.85rem] font-semibold text-white/85">✨ Crear con IA</p>
                                    <p className="mt-1 text-[0.75rem] leading-relaxed text-white/45">La IA creará su primera foto usando la descripción de tu chica.</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button onClick={handleDescribeNext}
                        className="mt-8 h-[50px] w-full rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-[0.95rem] font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(255,47,120,0.25)] transition hover:brightness-110 active:scale-[0.99]">
                        Siguiente →
                      </button>
                    </motion.div>
                  )}

                  {step === "generating" && (
                    <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center py-16">
                      <div className="relative flex h-24 w-24 items-center justify-center">
                        <motion.div className="absolute inset-0 rounded-full bg-[#FF5798]/15 blur-2xl" animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.85, 1.15, 0.85] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
                        <motion.svg
                          width="40" height="40" viewBox="0 0 24 24" fill="#FF5798"
                          animate={{ scale: [1, 1.22, 1] }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                          style={{ originX: "50%", originY: "50%" }}
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </motion.svg>
                      </div>
                      <h4 className="mt-10 text-xl font-semibold tracking-tight text-white">Creando a {currentName}</h4>
                      <p className="mt-2 text-xs text-white/40">Estamos dando vida a tu nueva compañía... puede tardar hasta 1 minuto.</p>
                    </motion.div>
                  )}

                  {step === "done" && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                      <div className="flex flex-col items-center py-10">
                        <motion.div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#30D158]/20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </motion.div>
                        <p className="mt-3 text-lg font-bold text-white">{currentName} ha sido creada</p>
                        <p className="mt-1 text-xs text-white/50">Ya puedes chatear con ella</p>
                        <button onClick={handleReset} className="mt-6 h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-[0.95rem] font-bold text-white transition hover:brightness-110 active:scale-[0.99]">
                          Crear otra chica
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
