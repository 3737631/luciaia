"use client";

import { useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
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

const CROP_VIEW = 264;
const CROP_SAVE = 700;

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
      const size = 900;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
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

type WizardStep = "describe" | "personality" | "generating" | "done";

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
  const bits: string[] = [];
  if (/(pecas|freckles|pequitas|pecoso)/.test(w)) bits.push("with visible freckles scattered across her nose and cheeks");
  if (/(gafas|anteojos|lentes|glasses)/.test(w)) bits.push("wearing stylish modern eyeglasses");
  if (/(lunar|beauty mark)/.test(w)) bits.push("with a small beauty mark on her cheek");
  if (/(gorro|gorra|sombrero|beanie|cap|buff)/.test(w)) bits.push("wearing a cute baseball cap on her head");
  if (/(pendientes|aretes|aritos|earrings)/.test(w)) bits.push("wearing small elegant earrings");
  if (/(piercing|piercings)/.test(w)) bits.push("with a subtle nose piercing");
  if (/(enfermera|enfermero|m[ée]dica|doctora|uniforme|uniformes)/.test(w)) bits.push("wearing a white nurse cap and a clean white nurse uniform collar");
  else if (/(polic[ií]a|guardia)/.test(w)) bits.push("wearing a navy blue police cap");
  else if (/(camarera|mesera|mesera)/.test(w)) bits.push("wearing a black waitress top with a white apron");
  else if (/(maid|doncella|criadita|mucama|criada)/.test(w)) bits.push("wearing a white and black maid headband");
  else if (/(profesora|maestra|secretaria|oficina|ejecutiva)/.test(w)) bits.push("wearing a smart white blouse");
  const extra = bits.length ? bits.join(", ") + ", " : "";
  return `photorealistic professional portrait photo of a beautiful adult woman in her mid 20s with ${hair} and ${eyes}, ${extra}perfect headshot centered exactly in the middle of the frame, the face fills 70% of the image, even margins on all sides, camera directly facing her, bright clean soft studio lighting in light pastel tones, bright luminous background, no dark background, no black background, no shadows behind the subject, extremely realistic human skin rendered pixel by pixel with visible pores, fine vellus hairs, natural skin grain and micro texture, subtle skin blemishes and faint redness in cheeks, believable subsurface scattering, matte natural skin, slight natural shine on the skin, detailed iris with natural highlights, individual eyelashes, softly shaped natural brows, light natural makeup, natural friendly smile, wearing a simple elegant neutral top, perfectly symmetrical clothing with both sleeves identical, proportionate normal shoulders and neck, natural human proportions, sharp focus on the eyes, soft natural window light with gentle catchlights, shallow depth of field, square profile picture crop for a circular avatar, the circle will cut the edges so the face must stay perfectly centered, no full body, no chest, no cleavage, candid real photography, must look like a real photo of a real person, raw camera photo with sensor noise and natural color grading, high resolution, crisp details, not CGI, no plastic skin, no wax skin, no airbrushed face, no beauty filter, no 3D render look, no anime, no illustration, no glossy skin, no skin blur, no distorted anatomy, no extra limbs, no missing sleeve, no oversized body parts, no giant hands, no deformed face`;
}

export default function CreateYourGirl({ open, onClose, onCreated, editGirl, backgroundImage }: { open: boolean; onClose: () => void; onCreated?: () => void; editGirl?: CustomGirlData | null; backgroundImage?: string | null }) {
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
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImg, setCropImg] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const cropViewRef = useRef<HTMLDivElement>(null);
  const cropElRef = useRef<HTMLImageElement | null>(null);
  const cropNat = useRef({ w: 0, h: 0 });
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef(0);
  const rawRefImg = useRef<string | null>(null);
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
      const origH = { overflow: h.style.overflow, overscrollBehavior: h.style.overscrollBehavior, position: h.style.position };
      const origB = { overflow: b.style.overflow, position: b.style.position };
      h.style.overflow = "hidden";
      h.style.overscrollBehavior = "none";
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
        b.style.overflow = origB.overflow;
        b.style.position = origB.position;
        h.style.overflow = origH.overflow;
        h.style.overscrollBehavior = origH.overscrollBehavior;
        h.style.position = origH.position;
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
        openCrop(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function openCrop(dataUrl: string) {
    const el = new Image();
    el.onload = () => {
      cropNat.current = { w: el.naturalWidth, h: el.naturalHeight };
      cropElRef.current = el;
      setCropImg(dataUrl);
      setCropScale(CROP_VIEW / Math.min(el.naturalWidth, el.naturalHeight));
      setCropOffset({ x: 0, y: 0 });
      setCropOpen(true);
    };
    el.src = dataUrl;
  }

  function clampScale(s: number): number {
    const { w, h } = cropNat.current;
    const minS = w && h ? CROP_VIEW / Math.min(w, h) : 0.4;
    return Math.min(6, Math.max(minS, s));
  }

  function cropZoomBy(f: number) {
    setCropScale((s) => clampScale(s * f));
  }

  function acceptCrop() {
    const el = cropElRef.current;
    if (!el) return;
    const { w, h } = cropNat.current;
    const scale = clampScale(cropScale);
    const iw = w * scale;
    const ih = h * scale;
    let sx = (iw / 2 - CROP_VIEW / 2 - cropOffset.x) / scale;
    let sy = (ih / 2 - CROP_VIEW / 2 - cropOffset.y) / scale;
    const size = CROP_VIEW / scale;
    sx = Math.max(0, Math.min(sx, w - size));
    sy = Math.max(0, Math.min(sy, h - size));
    const canvas = document.createElement("canvas");
    canvas.width = CROP_SAVE;
    canvas.height = CROP_SAVE;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(el, sx, sy, size, size, 0, 0, CROP_SAVE, CROP_SAVE);
    rawRefImg.current = cropImg;
    setRefImage(canvas.toDataURL("image/jpeg", 0.9));
    setCropOpen(false);
    requestAnimationFrame(() => {
      siguienteRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  useEffect(() => {
    if (!cropOpen) return;
    const el = cropViewRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      cropZoomBy(ev.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [cropOpen]);

  function onCropPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDistRef.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function onCropPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    if (pointers.current.size === 1) {
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setCropOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const nd = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistRef.current > 0 && nd > 0) {
        setCropScale((s) => clampScale(s * (nd / pinchDistRef.current)));
      }
      pinchDistRef.current = nd;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
  }

  function onCropPointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDistRef.current = 0;
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
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md md:z-[150] md:bg-black/60 md:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {backgroundImage && (
              <div className="hidden md:block" style={{ position: "absolute", inset: "-40px", backgroundImage: `url(${backgroundImage})`, backgroundPosition: "center", backgroundSize: "cover", filter: "blur(28px)", transform: "scale(1.08)", opacity: 0.55, pointerEvents: "none" }} />
            )}
          </motion.div>
          <motion.div
            className="fixed inset-x-0 bottom-0 top-[88px] z-40 flex flex-col md:top-0 md:z-[150]"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 220, damping: 32 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          >
            <motion.div
              className="mx-auto flex w-full max-w-[480px] flex-1 flex-col min-h-0 px-5 md:max-w-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Header fijo: sin fondo, igual que el resto del modal */}
              <div className="-mx-5 shrink-0 px-5 pb-4 pt-6">
                <h3 className="text-[1.4rem] font-bold leading-tight tracking-tight text-white">
                  {step === "describe" ? "Diseña tu chica ideal" :
                   step === "personality" ? "Elige personalidad" :
                   step === "generating" ? "Creando..." : "¡Creada!"}
                </h3>

                {/* Progress line */}
                <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: step === "describe" ? "33%" : step === "personality" ? "66%" : "100%",
                      background: "linear-gradient(135deg, #FF5798, #FF6AA5)",
                    }}
                  />
                </div>
              </div>

              {/* Body scrollable */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overscroll-contain pb-32 min-h-0"
                style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", touchAction: "pan-y" }}
              >

              {/* Body */}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {step === "describe" && (
                    <motion.div key="describe" initial={{ opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14, scale: 0.99 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                      {error && (
                        <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</div>
                      )}

                      {/* Campo nombre */}
                      <label className="mb-2 block text-sm font-semibold text-white/85">Nombre de tu chica</label>
                      <div className="relative">
                        <input value={currentName} onChange={(e) => { setError(""); setCurrentName(e.target.value); }}
                          placeholder="Ej: Luna"
                          maxLength={20}
                          className="h-12 w-full rounded-2xl border border-white/[0.06] bg-white/[0.06] pl-4 pr-12 text-[0.95rem] text-white outline-none backdrop-blur-md transition-colors placeholder:text-white/25 focus:border-[#FF5798]/40 focus:bg-white/[0.09]" />
                        <button
                          type="button"
                          onClick={() => {
                            setDiceSpin(true);
                            window.setTimeout(() => setDiceSpin(false), 750);
                            setCurrentName(generateName(girlDesc || roleplayDesc));
                          }}
                          title="Nombre al azar"
                          className="absolute right-5 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center p-0.5 transition hover:scale-110 active:scale-95"
                        >
                          <Dice3D spinning={diceSpin} />
                        </button>
                      </div>

                      {/* Campo principal */}
                      <label className="mb-2 mt-6 block text-sm font-semibold text-white/85">Describe tu fantasía</label>
                      <textarea value={girlDesc} onFocus={() => setOpenSection(null)} onChange={(e) => { setError(""); setGirlDesc(e.target.value); }}
                        placeholder="Ej: chica de pelo negro, uniforme blanco ajustado, mirada intensa..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.08] px-4 py-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/[0.12] focus:bg-white/[0.11]" />

                      {/* Roleplay */}
                      <button type="button" onClick={() => setOpenSection(openSection === "roleplay" ? null : "roleplay")}
                        className="mt-6 flex w-full items-center justify-between rounded-xl py-2 text-[0.95rem] font-semibold text-white/90 transition hover:text-white">
                        <span className="relative">
                          Roleplay
                          {!roleplayDesc.trim() && <span className="ml-2 align-middle text-[0.6rem] font-normal text-white/40">opcional</span>}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openSection === "roleplay" ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {openSection === "roleplay" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <textarea value={roleplayDesc} onChange={(e) => { setError(""); setRoleplayDesc(e.target.value); }}
                              placeholder="Ej: me tiene atado a la cama del hospital..."
                              rows={2}
                              className="mt-2 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.08] px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/[0.12] focus:bg-white/[0.11]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Foto opcional */}
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="min-w-0 text-[0.95rem] font-semibold text-white/90">
                          Foto de perfil
                          <span className="ml-2 align-middle text-[0.6rem] font-normal text-white/40">
                            {refImage ? "pulsa la foto para ajustarla" : "opcional, si no la IA la crea"}
                          </span>
                        </span>
                        {refImage ? (
                          <button type="button" onClick={() => openCrop(rawRefImg.current || refImage)} title="Ajustar foto" className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/[0.12] p-0 transition hover:brightness-110 active:scale-95">
                            <img src={refImage} alt="Foto de perfil" className="pointer-events-none block h-full w-full object-cover object-center" />
                          </button>
                        ) : (
                          <label title="Subir foto" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/[0.22] bg-white/[0.16] text-white transition hover:bg-white/[0.25] hover:border-white/[0.32] active:scale-90">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                            <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
                          </label>
                        )}
                      </div>

                      <button ref={siguienteRef} onClick={handleDescribeNext}
                        className="mt-7 h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-[0.95rem] font-bold text-white transition hover:brightness-110 active:scale-[0.99]">
                        Siguiente →
                      </button>
                    </motion.div>
                  )}

                  {step === "personality" && (
                    <motion.div key="personality" initial={{ opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14, scale: 0.99 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                      <button onClick={() => setStep("describe")} className="flex items-center gap-1.5 py-1 text-xs font-medium text-white/40 transition hover:text-white active:scale-95">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Atrás
                      </button>

                      <div className="mt-2">
                        {[
                          { value: "carinosa", label: "Cariñosa", desc: "Dulce, cercana, siempre pendiente" },
                          { value: "atrevida", label: "Atrevida", desc: "Directa, juguetona, te engancha" },
                          { value: "timida", label: "Tímida", desc: "Vergonzosa pero intensa" },
                          { value: "dominante", label: "Dominante", desc: "Sabe lo que quiere, lidera" },
                        ].map((p) => {
                          const active = selectedPersonality === p.value;
                          return (
                            <button key={p.value} onClick={() => setSelectedPersonality(p.value)}
                              className="group flex w-full items-center gap-4 py-4 text-left transition active:scale-[0.99]">
                              <span className="relative flex h-4 w-4 items-center justify-center">
                                <span
                                  className={`block h-4 w-4 rounded-full transition-all duration-200 ${active ? "bg-[#FF5798] shadow-[0_0_12px_rgba(255,87,152,0.45)]" : "border-2 border-white/20 bg-transparent group-hover:border-white/40"}`}
                                />
                              </span>
                              <span className="flex-1">
                                <span className={`block text-lg font-semibold leading-tight tracking-tight transition-colors ${active ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>{p.label}</span>
                                <span className={`block text-[0.7rem] transition-colors ${active ? "text-white/45" : "text-white/30 group-hover:text-white/45"}`}>{p.desc}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-8 flex flex-col items-center gap-4">
                        <button onClick={handlePersonalityNext} className="h-12 w-full max-w-[320px] rounded-full bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-[0.95rem] font-bold text-white transition hover:brightness-110 active:scale-[0.99]">
                          Continuar →
                        </button>
                        <button onClick={handlePersonalityNext} className="text-xs font-medium text-white/40 transition hover:text-white/70 active:scale-95">
                          Sin personalidad
                        </button>
                      </div>
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

              {/* Salir */}
              <button onClick={onClose} className="mx-auto mt-2 flex w-full items-center justify-center py-3 text-sm font-medium text-white/40 transition hover:text-white active:scale-95">
                Salir
              </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Editor de recorte circular */}
          {cropOpen && cropImg && (
            <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 px-6 py-8" onClick={() => setCropOpen(false)}>
              <div className="flex min-h-full items-center justify-center">
                <div className="my-auto w-full max-w-[300px]" onClick={(e) => e.stopPropagation()}>
                  <div
                    ref={cropViewRef}
                    className="relative mx-auto touch-none select-none overflow-hidden rounded-full"
                    style={{ width: CROP_VIEW, height: CROP_VIEW, border: "2px solid rgba(255,255,255,0.3)", boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 8px 30px rgba(0,0,0,0.5)" }}
                    onPointerDown={onCropPointerDown}
                    onPointerMove={onCropPointerMove}
                    onPointerUp={onCropPointerEnd}
                    onPointerCancel={onCropPointerEnd}
                  >
                    {(() => {
                      const iw = cropNat.current.w * cropScale;
                      const ih = cropNat.current.h * cropScale;
                      return (
                        <img
                          src={cropImg}
                          alt=""
                          draggable={false}
                          className="pointer-events-none select-none"
                          onLoad={(e) => {
                            if (!cropNat.current.w) {
                              const el = e.currentTarget;
                              if (el.naturalWidth > 0) {
                                cropNat.current = { w: el.naturalWidth, h: el.naturalHeight };
                                setCropScale(CROP_VIEW / Math.min(el.naturalWidth, el.naturalHeight));
                              }
                            }
                          }}
                          style={{ position: "absolute", left: CROP_VIEW / 2 - iw / 2 + cropOffset.x, top: CROP_VIEW / 2 - ih / 2 + cropOffset.y, width: iw, height: ih, maxWidth: "none" }}
                        />
                      );
                    })()}
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-5">
                    <button onClick={() => cropZoomBy(1 / 1.25)} aria-label="Alejar" title="Alejar" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.24] bg-white/[0.16] text-white transition hover:bg-white/[0.26] hover:border-white/[0.36] active:scale-90">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M8 11h6"/></svg>
                    </button>
                    <button onClick={() => cropZoomBy(1.25)} aria-label="Acercar" title="Acercar" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.24] bg-white/[0.16] text-white transition hover:bg-white/[0.26] hover:border-white/[0.36] active:scale-90">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M8 11h6M11 8v6"/></svg>
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-2.5">
                    <label title="Subir otra foto" className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/[0.2] bg-white/[0.16] text-white transition hover:bg-white/[0.24] hover:border-white/[0.3] active:scale-90">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                      <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
                    </label>
                    <button type="button" onClick={() => { setCropOpen(false); setRefImage(null); }} title="Quitar foto" className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#ff2f78]/45 bg-[#ff2f78]/25 text-[#ff9dbe] transition hover:bg-[#ff2f78]/45 hover:text-white active:scale-90">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                    <button onClick={acceptCrop} className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-[#ff2f78] to-[#ff4c91] text-sm font-bold text-white shadow-[0_8px_28px_rgba(255,47,120,0.5)] ring-1 ring-white/25 transition hover:brightness-110 active:scale-[0.98]">Aceptar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
