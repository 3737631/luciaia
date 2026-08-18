const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isModerationError(err: unknown): boolean {
  return /moderation|safety|blocked|sensitive|not permitted|policy|disallow|forbidden|clear-content|nsfw/i.test(String((err as Error)?.message || err));
}

function notAllowedResponse() {
  return new Response(JSON.stringify({ error: "PeticiÃ³n no permitida: solo se genera contenido cubierto y elegante. Describe la ropa en lugar del desnudo explÃ­cito." }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const NSCALE_MODEL = "black-forest-labs/FLUX.1-schnell";
// Modelo serverless gratuito de Hugging Face con gran fotorrealismo de personas (sin tarjeta).
const HF_MODEL = "SG161222/RealVisXL_V4.0";

function falSize(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 1.3) return "landscape_4_3";
  if (ratio < 0.77) return "portrait_4_3";
  return "square";
}

async function falDirectGenerate(prompt: string, width: number, height: number, seed: number, falKey: string): Promise<Uint8Array> {
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch("https://queue.fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: falSize(width, height),
        num_inference_steps: 28,
        num_images: 1,
        seed,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const url = json?.images?.[0]?.url;
      if (!url) throw new Error("fal: no se obtuvo URL de imagen");
      const img = await fetch(url);
      if (!img.ok) throw new Error(`fal: descarga de imagen ${img.status}`);
      return new Uint8Array(await img.arrayBuffer());
    }
    const text = await res.text();
    lastError = `fal ${res.status}: ${text.slice(0, 200)}`;
  }
  throw new Error(lastError || "fal fallÃ³");
}

async function nscaleGenerate(prompt: string, width: number, height: number, seed: number, token: string): Promise<Uint8Array> {
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch("https://router.huggingface.co/nscale/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        response_format: "b64_json",
        prompt,
        model: NSCALE_MODEL,
        size: `${width}x${height}`,
        seed,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (b64) return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      throw new Error("nscale: respuesta inesperada");
    }
    lastError = `nscale ${res.status}: ${(await res.text()).slice(0, 200)}`;
  }
  throw new Error(lastError || "nscale fallÃ³");
}

// Modelos de Pollinations priorizados por calidad y fotorrealismo para personas.
// Configurable por variables de entorno:
//  - POLLINATIONS_MODEL: fuerza un Ãºnico modelo (p.ej. "seedream5").
//  - POLLINATIONS_MODELS: lista ordenada separada por comas.
const DEFAULT_POLLINATIONS_MODELS = [
  "flux",
  "seedream5",
  "gpt-image-2",
  "seedream5-pro",
  "nanobanana-2",
];

function pollinationsModelList(): string[] {
  const single = Deno.env.get("POLLINATIONS_MODEL");
  if (single) return [single];
  const csv = Deno.env.get("POLLINATIONS_MODELS");
  if (csv) {
    const list = csv.split(",").map((m) => m.trim()).filter(Boolean);
    if (list.length) return list;
  }
  return DEFAULT_POLLINATIONS_MODELS;
}

async function fetchPollinations(prompt: string, width: number, height: number, seed: number, model: string, timeoutMs: number): Promise<Uint8Array> {
  // Si hay API key, se usa el endpoint gestionado; si no, el pÃºblico gratuito.
  const apiKey = Deno.env.get("POLLINATIONS_API_KEY");
  const base = apiKey ? "https://gen.pollinations.ai" : "https://image.pollinations.ai/prompt";
  const params = encodeURIComponent(prompt);
  const url = apiKey
    ? `${base}/image/${params}?model=${encodeURIComponent(model)}&width=${width}&height=${height}&seed=${seed}&safe=false&nologo=true`
    : `${base}/${params}?model=${encodeURIComponent(model)}&width=${width}&height=${height}&seed=${seed}&nologo=true`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {};
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  return fetch(url, { redirect: "follow", signal: controller.signal, headers })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`pollinations ${model} ${res.status}: ${text.slice(0, 200)}`);
      }
      return new Uint8Array(await res.arrayBuffer());
    })
    .finally(() => clearTimeout(timer));
}

// Prueba cada modelo de la lista hasta que uno responda.
async function pollinationsGenerate(prompt: string, width: number, height: number, seed: number): Promise<Uint8Array> {
  const models = pollinationsModelList();
  let lastError: string | null = null;
  // nanobanana/seedream pueden tardar mÃ¡s que "sana".
  const perModelTimeout = 90000;
  for (const model of models) {
    try {
      const out = await fetchPollinations(prompt, width, height, seed, model, perModelTimeout);
      if (out.length > 0) return out;
      throw new Error(`pollinations ${model}: imagen vacÃ­a`);
    } catch (err) {
      lastError = String((err as Error)?.message || err);
      console.error(`pollinations modelo ${model} falla:`, lastError);
    }
  }
  throw new Error(lastError || "pollinations: todos los modelos fallaron");
}

async function hordePoll(id: string, timeoutMs = 120000): Promise<Uint8Array> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`, { headers: { "Accept": "application/json" } });
    const j = await st.json() as { done?: boolean; generations?: { img?: string; faulted?: boolean }[] };
    if (j.done) {
      const gen = j.generations?.[0];
      if (!gen) throw new Error("horde: sin resultado");
      if (gen.faulted) throw new Error("horde: imagen con fallo");
      const raw = gen.img ?? "";
      // El resultado puede venir como base64 o como URL firmada (Cloudflare R2).
      if (raw.startsWith("http")) {
        const img = await fetch(raw);
        if (!img.ok) throw new Error(`horde: descarga de imagen ${img.status}`);
        return new Uint8Array(await img.arrayBuffer());
      }
      return Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    }
  }
  throw new Error(`horde: timeout ${Math.round(timeoutMs / 1000)}s`);
}

async function hordeSubmit(prompt: string, width: number, height: number, seed: number, apikey: string, sourceImage?: string): Promise<string> {
  const body: Record<string, unknown> = {
    prompt,
    params: {
      width: Math.min(width, 768),
      height: Math.min(height, 1024),
      steps: 30,
      sampler_name: "k_dpmpp_2m",
      cfg_scale: 7,
      seed: String(seed),
    },
    nsfw: false,
    censor_nsfw: true,
    // Solo modelos fotorrealistas: Juggernaut XL da fotos reales; Photon/CyberRealistic
    // también. Evitamos Pony/Deliberate (tienen tendencia anime/cartoon).
    models: ["Juggernaut XL", "Photon", "CyberRealistic", "DreamShaper", "Realistic Vision"],
  };
  if (sourceImage) {
    const b64 = sourceImage.includes(",") ? sourceImage.split(",")[1] : sourceImage;
    body.source_image = b64;
    (body.params as Record<string, unknown>).denoising_strength = 0.85;
  }
  const res = await fetch("https://stablehorde.net/api/v2/generate/async", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`horde ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = await res.json() as { id?: string };
  if (!json.id) throw new Error("horde: sin id de tarea");
  return json.id;
}

async function hordeGenerate(prompt: string, width: number, height: number, seed: number, apikey: string, sourceImage?: string): Promise<Uint8Array> {
  const id = await hordeSubmit(prompt, width, height, seed, apikey, sourceImage);
  return await hordePoll(id);
}

// Consulta el estado de un job del Horde y devuelve la imagen si ya estÃ¡ lista.
async function hordeFetch(jobId: string): Promise<{ done: boolean; bytes?: Uint8Array; error?: string }> {
  try {
    const st = await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`, { headers: { "Accept": "application/json" } });
    const j = await st.json() as { done?: boolean; generations?: { img?: string; faulted?: boolean }[] };
    if (!j.done) return { done: false };
    const gen = j.generations?.[0];
    if (!gen) return { done: true, error: "horde: sin resultado" };
    if (gen.faulted) return { done: true, error: "horde: imagen con fallo" };
    const raw = gen.img ?? "";
    if (raw.startsWith("http")) {
      const img = await fetch(raw);
      if (!img.ok) return { done: true, error: `horde: descarga ${img.status}` };
      return { done: true, bytes: new Uint8Array(await img.arrayBuffer()) };
    }
    return { done: true, bytes: Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)) };
  } catch (e) {
    return { done: true, error: String((e as Error)?.message || e) };
  }
}

async function siliconflowGenerate(prompt: string, apiKey: string, model: string): Promise<Uint8Array> {
  const body: Record<string, unknown> = { model, prompt };
  if (model === "Qwen/Qwen-Image") {
    body.image_size = "1328x1328";
    body.num_inference_steps = 50;
  } else {
    body.image_size = "1024x1024";
    body.num_inference_steps = 25;
  }
  const res = await fetch("https://api.siliconflow.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const j = await res.json() as { code?: number; message?: string; images?: { url?: string }[] };
  if (j.code && j.message) {
    if (j.code === 40001 || j.code === 401) throw new Error("siliconflow: key no vÃ¡lida");
    throw new Error(`siliconflow ${j.code}: ${j.message}`);
  }
  const url = j.images?.[0]?.url;
  if (!url) throw new Error("siliconflow: sin URL de imagen");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`siliconflow img ${img.status}`);
  return new Uint8Array(await img.arrayBuffer());
}

async function novitaGenerate(prompt: string, width: number, height: number, seed: number, apiKey: string): Promise<Uint8Array> {
  const model = Deno.env.get("NOVITA_MODEL") ?? "bytedance/seedream-4-0";
  const res = await fetch("https://api.novita.ai/v3/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt, image_size: `${width}x${height}`, seed, num_images: 1 }),
  });
  const j = await res.json() as { data?: { b64_json?: string; url?: string }[]; message?: string };
  if (!res.ok) throw new Error(`novita ${res.status}: ${String(j.message ?? "").slice(0, 200)}`);
  const out = j.data?.[0];
  if (!out) throw new Error("novita: sin imagen");
  if (out.b64_json) return Uint8Array.from(atob(out.b64_json), (c) => c.charCodeAt(0));
  const img = await fetch(out.url!);
  if (!img.ok) throw new Error(`novita img ${img.status}`);
  return new Uint8Array(await img.arrayBuffer());
}

async function apiframeGenerate(prompt: string, width: number, height: number, seed: number, apiKey: string): Promise<Uint8Array> {
  const model = Deno.env.get("APIFRAME_MODEL") ?? "seedream-4.5";
  const res = await fetch("https://api.apiframe.ai/v2/images/generate", {
    method: "POST",
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model, seedreamParams: { output_format: "jpg", seed } }),
  });
  if (!res.ok) throw new Error(`apiframe ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json() as { jobId?: string };
  const jobId = j.jobId;
  if (!jobId) throw new Error("apiframe: sin jobId");
  const deadline = Date.now() + 110000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    const st = await fetch(`https://api.apiframe.ai/v2/jobs/${jobId}`, { headers: { "X-API-Key": apiKey } });
    if (!st.ok) continue;
    const sj = await st.json() as { status?: string; result?: { images?: string[] }; error?: unknown };
    if (sj.status === "COMPLETED") {
      const url = sj.result?.images?.[0];
      if (!url) throw new Error("apiframe: sin URL de resultado");
      const img = await fetch(url);
      if (!img.ok) throw new Error(`apiframe img ${img.status}`);
      return new Uint8Array(await img.arrayBuffer());
    }
    if (sj.status === "FAILED") throw new Error(`apiframe job fallo: ${JSON.stringify(sj.error ?? sj)}`);
  }
  throw new Error("apiframe: timeout");
}

async function siliconflowRef(prompt: string, imageDataUrl: string, apiKey: string): Promise<Uint8Array> {
  const b64 = imageDataUrl.includes(",") ? imageDataUrl : `data:image/jpeg;base64,${imageDataUrl}`;
  const identityPrompt = "Use the reference image as the exact identity: the woman in the result has exactly the same face as the reference image, same facial features, same identity, keep her face identical. " + prompt;
  const body = {
    model: "black-forest-labs/FLUX.1-Kontext-dev",
    prompt: identityPrompt,
    images: [b64],
    image_size: "1024x1024",
  };
  const res = await fetch("https://api.siliconflow.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const j = await res.json() as { code?: number; message?: string; images?: { url?: string }[] };
  if (j.code && j.message) throw new Error(`siliconflow-ref ${j.code}: ${j.message}`);
  const url = j.images?.[0]?.url;
  if (!url) throw new Error("siliconflow-ref: sin URL de imagen");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`siliconflow-ref img ${img.status}`);
  return new Uint8Array(await img.arrayBuffer());
}

async function realismWithFallback(prompt: string, width: number, height: number, seed: number): Promise<{ bytes: Uint8Array; name: string }> {
  const sfKey = Deno.env.get("SILICONFLOW_API_KEY") ?? "";
  if (sfKey) {
    try {
      return { bytes: await siliconflowGenerate(prompt, sfKey, "black-forest-labs/FLUX.1-dev"), name: "sf-flux-dev" };
    } catch (errS) {
      console.error("siliconflow flux-dev falla:", errS);
      try {
        return { bytes: await siliconflowGenerate(prompt, sfKey, "Qwen/Qwen-Image"), name: "sf-qwen" };
      } catch (errQ) {
        console.error("siliconflow qwen-image falla:", errQ);
      }
    }
  }
  const hordeEnabled = Deno.env.get("HORDE_ENABLED") === "true";
  if (hordeEnabled) {
    const hordeKey = Deno.env.get("HORDE_API_KEY") ?? "";
    if (hordeKey) {
      try {
        return { bytes: await hordeGenerate(prompt, width, height, seed, hordeKey), name: "horde-juggernaut" };
      } catch (errH) {
        console.error("horde falla, usa pollinations:", errH);
      }
    }
  }
  return { bytes: await pollinationsGenerate(prompt, width, height, seed), name: "pollinations" };
}

async function cloudflareRefGenerate(prompt: string, imageDataUrl: string, accountId: string, token: string): Promise<Uint8Array> {
  const b64 = imageDataUrl.includes(",") ? imageDataUrl.split(",")[1] : imageDataUrl;
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const identityPrompt = "Use the reference photo as the exact identity: the woman in the result has exactly the same face as the person in the reference photo, same facial features, same face shape, same eyes, same nose, same mouth, her identity and face must not change at all. " + prompt;
  const form = new FormData();
  form.append("prompt", identityPrompt);
  const refBlob = new Blob([bytes], { type: "image/jpeg" });
  form.append("image", refBlob, "ref.jpg");
  form.append("image", refBlob, "ref2.jpg");
  form.append("image_strength", "1.0");
  form.append("num_steps", "25");
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-9b`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`cf-ref ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.success !== true) {
    throw new Error(`cf-ref ${json.errors?.[0]?.message || "error de Cloudflare"}`);
  }
  const out = json.result?.image;
  if (!out) throw new Error("cf-ref: no se obtuvo imagen");
  return Uint8Array.from(atob(out), (c) => c.charCodeAt(0));
}

async function hfGenerate(prompt: string, width: number, height: number, token: string): Promise<Uint8Array> {
  const res = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_MODEL}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { width, height },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`hf ${res.status}: ${text.slice(0, 200)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

function promptHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function baseHair(p: string): string {
  const w = p.toLowerCase();
  if (/(rubia|rubio|blond|golden)/.test(w)) return "long blonde hair with natural dimension and subtle root variation";
  if (/(pelirroja|pelirrojo|redhead)/.test(w)) return "long auburn hair with natural copper tones, softly layered";
  if (/(negra|negro|pelo negro|black hair)/.test(w)) return "long dark black hair with natural sheen and fine flyaways";
  if (/(morena|moreno|brunet|casta[nÃ‘]a)/.test(w)) return "natural dark brown hair, softly textured with visible strands";
  return "natural hair with visible individual strands and a few fine baby hairs around the hairline";
}

function sceneLighting(p: string): string {
  const w = p.toLowerCase();
  if (/(ducha|ba[nÃ‘]era|bath|shower)/.test(w))
    return "diffuse warm bathroom light with soft reflections on slightly wet skin and natural shadow gradients";
  if (/(playa|arena|mar|piscina|tropical|verano)/.test(w))
    return "golden-hour sunlight, warm natural tones, gentle sky reflections, believable soft shadows";
  if (/(nike|sudadera|street|calle|urbano|neon)/.test(w))
    return "city street lighting at dusk, mixed tungsten and soft neon glow, physically plausible highlights";
  if (/(cama|acostada|hotel|habitaci[oÃ“]n|boudoir|dormitorio)/.test(w))
    return "soft warm ambient light with gentle window falloff, natural shadow variation across the face and body";
  if (/(gimnasio|gym|yoga|deporte)/.test(w))
    return "overhead gym lighting, clean directional key light, believable fill and natural shadow contrast";
  return "natural soft daylight from a window, gentle directional light, believable soft shadows and physical highlight response";
}

function cameraRig(p: string, seed: number): string {
  const w = p.toLowerCase();
  if (/(espejo|selfi|mirror)/.test(w))
    return "natural smartphone-style selfie framing, slightly imperfect, realistic wide-angle near a mirror, natural perspective, full upper body visible";
  if (/(ducha|ba[nÃ‘]era|bath|shower)/.test(w))
    return "realistic full-frame photography, natural 35mm lens, three-quarter shot showing most of the body, believable shallow depth of field";
  if (/(caminando|paseando|bailando|baile)/.test(w))
    return "realistic full-frame photography, natural motion capture, 85mm lens, full-body to three-quarter framing, believable depth of field and natural perspective";
  if (/(cama|acostada|hotel|habitaci[oÃ“]n|boudoir|dormitorio)/.test(w))
    return "realistic full-frame photography, natural 50mm lens at f/2.2, three-quarter shot revealing the body naturally, soft intimate depth of field, gentle background compression, natural perspective";
  if (/(gimnasio|gym|yoga|deporte)/.test(w))
    return "realistic full-frame photography, natural 35mm lens at f/2.8, dynamic three-quarter framing, believable depth of field and natural perspective";
  const shots = [
    "realistic full-frame photography, natural 50mm lens at f/2.8, three-quarter shot showing the figure naturally, shallow depth of field, subtle background separation, natural perspective",
    "realistic full-frame photography, natural 85mm lens at f/2.5, three-quarter framing with natural body proportions, soft background compression, believable depth of field",
    "realistic full-frame photography, natural 35mm lens at f/2.8, natural near-field perspective showing most of the body, subtle depth of field",
    "realistic full-frame photography, natural 50mm lens at f/2.5, three-quarter shot with believable body proportions, creamy natural bokeh, realistic background blur, natural perspective",
  ];
  return shots[Math.abs(promptHash(w) + seed) % shots.length];
}

// VariaciÃ³n de redacciÃ³n segÃºn el personaje: evita que todos los prompts sean idÃ©nticos.
function pick<T>(seed: number, variants: T[]): T {
  return variants[Math.abs(seed) % variants.length];
}

// Convierte la descripciÃ³n en un prompt fotogrÃ¡fico estructurado y adaptado a cada personaje.
// El texto del usuario se conserva en cuanto a intenciÃ³n y rasgos; se aÃ±ade realismo en capas
// que varÃ­an con la seed para que cada creaciÃ³n tenga una redacciÃ³n propia.
function buildPhotoPrompt(userPrompt: string, seed: number): string {
  const base = userPrompt.trim();
  const lighting = sceneLighting(base);
  const camera = cameraRig(base, seed);
  const hair = baseHair(base);
  const hash = promptHash(base);

  const phys = pick(hash + seed, [
    `CaracterÃ­sticas fÃ­sicas: natural pretty adult woman, ${hair}, real ordinary facial proportions with subtle asymmetry, natural-sized eyes with realistic iris detail, naturally shaped lips of average fullness, normal soft cheekbones, natural jawline, healthy normal feminine body with believable proportions, anatomically correct hands with correctly formed fingers, aligned natural eyes, natural teeth with slight variation, natural ears, correct neck and shoulders.`,
    `CaracterÃ­sticas fÃ­sicas: attractive adult woman, ${hair}, authentic natural facial features without exaggeration, regular eyes with realistic iris detail, normal lips with natural texture, gentle natural cheekbones, natural jawline, believable feminine body proportions, natural hands with correctly formed fingers, aligned natural eyes, natural healthy teeth, natural ears, correct neck anatomy.`,
  ]);

  const skin = pick(hash + seed, [
    `Textura de piel realista: natural human skin with visible pores and fine realistic microtexture, subtle natural imperfections and faint beauty marks, small natural freckles or blemishes, natural subsurface scattering, physically plausible light response on skin, individual eyelashes and softly shaped brows with visible individual brow hairs, fine baby hairs around the hairline, moist natural eyes with detailed iris and natural surface highlights, lips with natural texture and fine creases, subtle expression lines around the eyes and mouth, slightly varied natural skin tone, healthy organic glow, real photographic skin without any plastic or wax appearance.`,
    `Textura de piel realista: authentic human skin with visible pores, fine realistic microtexture and slight natural tone variation, small natural imperfections and faint beauty marks, believable subsurface scattering, realistic skin highlights, individual eyelashes and naturally textured brows, fine baby hairs at the hairline, moist realistic eyes with detailed iris and natural highlights, naturally textured lips with fine vertical creases, faint natural expression lines, subtle facial vellus hairs, organic believable skin, no airbrushing, no plastic or doll-like smoothness.`,
  ]);

  const realism = pick(hash + seed, [
    `Realismo: photorealistic real photograph taken with a real camera, authentic photography, natural human appearance, believable anatomy, natural facial asymmetry, physically plausible materials. The image must look like an actual photo, not a CGI render: avoid plastic skin, wax skin, doll-like mannequin face, porcelain airbrushed skin, overly smooth synthetic skin, 3D render appearance, videogame character, anime, cartoon, illustration, dead doll eyes, unnatural symmetry, uncanny face.`,
    `Realismo: genuine photorealistic photograph, real-world photographic quality, natural human skin with organic texture, believable anatomy and subtle asymmetry, physically plausible lighting and shadows. Must not look like CGI, a 3D model, a videogame character, an anime or cartoon illustration: no plastic skin, no wax skin, no airbrushed porcelain skin, no doll-like mannequin face, no dead doll eyes, no unnatural symmetry.`,
  ]);

  return `${base}.

${phys}

${skin}

IluminaciÃ³n fotogrÃ¡fica: ${lighting}, natural exposure without burnt highlights, believable contrast, physically plausible light with natural shadow variation across the skin, no artificial glow.

CÃ¡mara y composiciÃ³n: ${camera}, shot on a full-frame camera, natural lens rendering, realistic shallow depth of field, subtle background separation, natural perspective, realistic color response, natural film grain, natural believable body proportions without stretching or elongation, natural framing.

${realism}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawPrompt = String(body.prompt || "").trim();
    const width = Math.min(2048, Math.max(256, Number(body.width) || 1024));
    const height = Math.min(2048, Math.max(256, Number(body.height) || 1536));
    const jobId = typeof body.jobId === "string" && body.jobId ? body.jobId.trim() : "";

    // Consulta de estado de un job asÃ­ncrono del Horde.
    if (jobId) {
      const st = await hordeFetch(jobId);
      if (st.done) {
        if (st.bytes) {
          return new Response(st.bytes, {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "image/webp",
              "Cache-Control": "no-store",
              "X-Gen-Source": "horde-juggernaut",
              "X-Gen-Rev": "v3",
            },
          });
        }
        return new Response(JSON.stringify({ status: "failed", error: st.error || "horde: sin imagen" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ status: "processing", jobId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!rawPrompt) {
      return new Response(JSON.stringify({ error: "Prompt vacÃ­o" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("HUGGINGFACE_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing HUGGINGFACE_TOKEN" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const seed = Number(body.seed) || Math.floor(Math.random() * 1e9);
    const refImage = typeof body.image === "string" ? body.image : "";
    const isAvatar = body.avatar === true;

    // Prompt fotogrÃ¡fico profesional, conservando la intenciÃ³n del usuario.
    // Para el avatar (foto de perfil circular) usamos un retrato de primer plano
    // fotorrealista con textura de piel real.
    const rawDesc = String(body.prompt || "").trim();
    const prompt = isAvatar
      ? `candid smartphone front-camera selfie photo of a real person, ${rawDesc || "a beautiful young woman"}, close-up headshot selfie where the face fills most of the square frame and is perfectly centered, face looking slightly off-center like a real selfie, natural casual selfie lighting from a window or room light, bright soft clean background behind the head, real human skin with visible pores, tiny freckles, natural blemishes, subtle redness, fine vellus hairs on the skin, slightly uneven skin tone, natural matte skin, no makeup or very light natural makeup, natural slightly asymmetrical friendly smile, hair naturally messy and not perfectly styled, shot on a smartphone camera, amateur casual unedited selfie, slight motion softness, natural sensor noise and grain, candid real-life photo taken by a person, must look like a genuine unedited phone photo of a real woman, NOT a professional photoshoot, NOT a studio beauty portrait, NOT fashion magazine, NOT anime, NOT cartoon, NOT illustration, NOT CGI render, no beauty filter, no airbrushed skin, no plastic doll face, no wax skin, no porcelain perfect skin, no perfect symmetrical face, no glowing skin, no glamour makeup, no dark background, no black background`
      : buildPhotoPrompt(rawDesc, seed);

    // El avatar se genera en cuadrado para el cÃ­rculo de perfil.
    const genWidth = Math.min(width, 1024);
    const genHeight = Math.min(height, 1024);

    // Si el Horde estÃ¡ activo y no hay foto de referencia, creamos el job de forma asÃ­ncrona:
    // respondemos con { jobId } al instante y el frontend consulta el estado despuÃ©s.
    const hordeEnabled = Deno.env.get("HORDE_ENABLED") === "true";
    const hordeKey = Deno.env.get("HORDE_API_KEY") ?? "";
    let img: Uint8Array;
    let source = "unknown";
    let debugNote = "";
    const cfAccount = Deno.env.get("CF_ACCOUNT_ID");
    const cfToken = Deno.env.get("CF_API_TOKEN");
    // Para el AVATAR (creaciÃ³n de chica) preferimos una vÃ­a rÃ¡pida sÃ­ncrona:
    // el Horde async puede tardar >15 min por falta de kudos y el frontend solo espera ~6.
    // Pollinations responde en segundos, asÃ­ que va primero en el caso avatar.
    if (isAvatar && !refImage) {
      // Avatar: priorizar fotorrealismo real. RealVisXL (HF serverless gratis)
      // da fotos realistas de personas; pollinations como respaldo rápido;
      // Horde async como última opción.
      try {
        img = await hfGenerate(prompt, genWidth, genHeight, token);
        source = "hf-realvisxl";
      } catch (errHf) {
        console.error("avatar realvisxl falla, intenta pollinations:", errHf);
        try {
          img = await pollinationsGenerate(prompt, genWidth, genHeight, seed);
          source = "pollinations";
        } catch (errPoll) {
          console.error("avatar pollinations falla, intenta horde async:", errPoll);
          if (hordeEnabled && hordeKey) {
            try {
              const jid = await hordeSubmit(prompt, genWidth, genHeight, seed, hordeKey);
              return new Response(JSON.stringify({ status: "queued", jobId: jid, source: "horde-juggernaut" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            } catch (errHorde) {
              console.error("avatar horde async falla:", errHorde);
            }
          }
        }
      }
    } else if (hordeEnabled && hordeKey && !refImage) {
      try {
        const jid = await hordeSubmit(prompt, genWidth, genHeight, seed, hordeKey);
        return new Response(JSON.stringify({ status: "queued", jobId: jid, source: "horde-juggernaut" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (errHorde) {
        console.error("horde async falla, cae a sÃ­ncrono:", errHorde);
      }
    }
    async function trySiliconThenRest() {
      // Solo generaciÃ³n con IA: sin fotos de stock (dan mal rollo).
      // AI Horde (gratis) da fotorrealismo real (Juggernaut XL). Va primero si estÃ¡ activo.
      const hordeKey = Deno.env.get("HORDE_API_KEY") ?? "";
      if (hordeKey) {
        try {
          img = await hordeGenerate(prompt, genWidth, genHeight, seed, hordeKey);
          source = "horde-juggernaut";
          return;
        } catch (errHorde) {
          console.error("horde principal falla:", errHorde);
        }
      }
      const sfKey = Deno.env.get("SILICONFLOW_API_KEY") ?? "";
      if (sfKey) {
        try {
          img = await siliconflowGenerate(prompt, sfKey, "black-forest-labs/FLUX.1-dev");
          source = "sf-flux-dev";
          return;
        } catch (errSf) {
          console.error("siliconflow flux-dev falla:", errSf);
        }
      }
      const novKey = Deno.env.get("NOVITA_API_KEY") ?? "";
      if (novKey) {
        try {
          img = await novitaGenerate(prompt, genWidth, genHeight, seed, novKey);
          source = "novita-seedream";
          return;
        } catch (errNov) {
          console.error("novita falla:", errNov);
        }
      }
      const apKeys = [
        Deno.env.get("APIFRAME_API_KEY") ?? "",
        Deno.env.get("APIFRAME_API_KEY_2") ?? "",
        Deno.env.get("APIFRAME_API_KEY_3") ?? "",
        Deno.env.get("APIFRAME_API_KEY_4") ?? "",
        Deno.env.get("APIFRAME_API_KEY_5") ?? "",
      ].filter(Boolean);
      for (const ak of apKeys) {
        try {
          img = await apiframeGenerate(prompt, genWidth, genHeight, seed, ak);
          source = "apiframe";
          return;
        } catch (errAp) {
          console.error("apiframe falla:", errAp);
        }
      }
      await tryPollinationsThenRest();
    }

    async function tryPollinationsThenRest() {
      try {
        // RealVisXL (HF serverless gratuito) suele dar mÃ¡s fotorrealismo que pollinations pÃºblico.
        img = await hfGenerate(prompt, genWidth, genHeight, token);
        source = "hf-realvisxl";
      } catch (errHf) {
        console.error("hf serverless falla, usa nscale:", errHf);
        try {
          img = await nscaleGenerate(prompt, genWidth, genHeight, seed, token);
          source = "nscale";
        } catch (errN) {
          console.error("nscale falla, usa pollinations:", errN);
          try {
            img = await pollinationsGenerate(prompt, genWidth, genHeight, seed);
            source = "pollinations";
          } catch (errP) {
            console.error("pollinations falla:", errP);
            throw errP;
          }
        }
      }
    }

    const falKey = Deno.env.get("FAL_KEY");
    if (!img) {
      // Ya se generÃ³ el avatar (pollinations), no volver a generar.
      if (refImage && cfAccount && cfToken) {
      try {
        img = await cloudflareRefGenerate(prompt, refImage, cfAccount, cfToken);
        source = "cf-flux-klein";
      } catch (errC) {
        if (isModerationError(errC)) return notAllowedResponse();
        console.error("cf-ref falla, reintento:", errC);
        try {
          img = await cloudflareRefGenerate(prompt, refImage, cfAccount, cfToken);
        } catch (errC2) {
          if (isModerationError(errC2)) return notAllowedResponse();
          console.error("cf-ref falla dos veces:", errC2);
          const sfKey = Deno.env.get("SILICONFLOW_API_KEY") ?? "";
          if (sfKey) {
            try {
              img = await siliconflowRef(prompt, refImage, sfKey);
              source = "sf-flux-kontext";
            } catch (errSF) {
              console.error("siliconflow ref falla:", errSF);
            }
          }
          if (!img) {
            const hordeEnabled = Deno.env.get("HORDE_ENABLED") === "true";
            const hordeKey = Deno.env.get("HORDE_API_KEY") ?? "";
            if (hordeEnabled && hordeKey) {
              try {
                img = await hordeGenerate(prompt, width, height, seed, hordeKey, refImage);
                source = "horde-juggernaut";
              } catch (errH) {
                console.error("horde ref falla:", errH);
              }
            }
          }
          if (!img) {
            return new Response(JSON.stringify({ error: "No se pudo crear con tu foto de referencia. IntÃ©ntalo de nuevo en unos segundos." }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    } else if (falKey) {
      try {
        img = await falDirectGenerate(prompt, genWidth, genHeight, seed, falKey);
        source = "fal-flux-dev";
      } catch (err) {
        console.error("fal falla:", err);
        await trySiliconThenRest();
      }
    } else {
      await trySiliconThenRest();
    }
    } // fin: no regenerar si el avatar ya se genero

    if (!img) {
      return new Response(JSON.stringify({ error: "No se pudo generar la imagen. IntÃ©ntalo de nuevo." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(img, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
        "X-Gen-Source": source,
        "X-Gen-Debug": debugNote,
        "X-Gen-Rev": "v3",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
