const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isModerationError(err: unknown): boolean {
  return /moderation|safety|blocked|sensitive|not permitted|policy|disallow|forbidden|clear-content|nsfw/i.test(String((err as Error)?.message || err));
}

function notAllowedResponse() {
  return new Response(JSON.stringify({ error: "Petición no permitida: solo se genera contenido cubierto y elegante. Describe la ropa en lugar del desnudo explícito." }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const NSCALE_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_MODEL = "stabilityai/stable-diffusion-3-medium-diffusers";

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
  throw new Error(lastError || "fal falló");
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
  throw new Error(lastError || "nscale falló");
}

async function fetchPollinations(prompt: string, width: number, height: number, seed: number, model: string, timeoutMs: number): Promise<Uint8Array> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${Math.min(width, 1024)}&height=${Math.min(height, 1024)}&model=${model}&seed=${seed}&nologo=true`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`pollinations ${model} ${res.status}: ${text.slice(0, 200)}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

async function pollinationsGenerate(prompt: string, width: number, height: number, seed: number): Promise<Uint8Array> {
  try {
    return await fetchPollinations(prompt, width, height, seed, "flux", 90000);
  } catch (err) {
    console.error("pollinations flux falla, usa sana:", err);
    return await fetchPollinations(prompt, width, height, seed, "sana", 60000);
  }
}

async function hordePoll(id: string): Promise<Uint8Array> {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`, { headers: { "Accept": "application/json" } });
    const j = await st.json() as { done?: boolean; generations?: { img?: string; faulted?: boolean }[] };
    if (j.done) {
      const gen = j.generations?.[0];
      if (!gen) throw new Error("horde: sin resultado");
      if (gen.faulted) throw new Error("horde: imagen con fallo");
      return Uint8Array.from(atob(gen.img!), (c) => c.charCodeAt(0));
    }
  }
  throw new Error("horde: timeout 120s");
}

async function hordeGenerate(prompt: string, width: number, height: number, seed: number, apikey: string, sourceImage?: string): Promise<Uint8Array> {
  const body: Record<string, unknown> = {
    prompt,
    params: {
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      steps: 20,
      sampler_name: "k_euler",
      cfg_scale: 6,
      seed: String(seed),
    },
    nsfw: false,
    censor_nsfw: true,
    models: ["Juggernaut XL"],
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
  return await hordePoll(json.id);
}

async function realismWithFallback(prompt: string, width: number, height: number, seed: number, accountId: string, token: string): Promise<Uint8Array> {
  const hordeKey = Deno.env.get("HORDE_API_KEY") ?? "";
  if (hordeKey) {
    try {
      return await hordeGenerate(prompt, width, height, seed, hordeKey);
    } catch (errH) {
      console.error("horde falla, usa schnell:", errH);
    }
  }
  try {
    return await cloudflareWithRetry(prompt, accountId, token);
  } catch (errC) {
    console.error("schnell falla, pollinations:", errC);
    return await pollinationsGenerate(prompt, width, height, seed);
  }
}

async function cloudflareGenerate(prompt: string, accountId: string, token: string): Promise<Uint8Array> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, width: 1024, height: 1024, steps: 8 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`cf ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.success !== true) {
    throw new Error(`cf ${json.errors?.[0]?.message || "error de Cloudflare"}`);
  }
  const b64 = json.result?.image;
  if (!b64) throw new Error("cf: no se obtuvo imagen");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function cloudflareWithRetry(prompt: string, accountId: string, token: string): Promise<Uint8Array> {
  let lastErr: unknown;
  for (let i = 0; i < 6; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1500));
    try {
      return await cloudflareGenerate(prompt, accountId, token);
    } catch (err) {
      lastErr = err;
      if (isModerationError(err)) continue;
      throw err;
    }
  }
  throw lastErr;
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
  form.append("image_strength", "0.9");
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    const width = Math.min(2048, Math.max(256, Number(body.width) || 896));
    const height = Math.min(2048, Math.max(256, Number(body.height) || 1152));

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt vacío" }), {
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

    let img: Uint8Array;
    const cfAccount = Deno.env.get("CF_ACCOUNT_ID");
    const cfToken = Deno.env.get("CF_API_TOKEN");

    async function tryPollinationsThenRest() {
      try {
        img = await pollinationsGenerate(prompt, width, height, seed);
      } catch (errP) {
        console.error("pollinations falla, usa nscale:", errP);
        try {
          img = await nscaleGenerate(prompt, width, height, seed, token);
        } catch (err2) {
          console.error("nscale falla, prueba hf:", err2);
          img = await hfGenerate(prompt, width, height, token);
        }
      }
    }

    const falKey = Deno.env.get("FAL_KEY");
    if (refImage && cfAccount && cfToken) {
      try {
        img = await cloudflareRefGenerate(prompt, refImage, cfAccount, cfToken);
      } catch (errC) {
        if (isModerationError(errC)) return notAllowedResponse();
        console.error("cf-ref falla, reintento:", errC);
        try {
          img = await cloudflareRefGenerate(prompt, refImage, cfAccount, cfToken);
        } catch (errC2) {
          if (isModerationError(errC2)) return notAllowedResponse();
          console.error("cf-ref falla dos veces:", errC2);
          const hordeKey = Deno.env.get("HORDE_API_KEY") ?? "";
          if (hordeKey) {
            try {
              img = await hordeGenerate(prompt, width, height, seed, hordeKey, refImage);
            } catch (errH) {
              console.error("horde ref falla:", errH);
              return new Response(JSON.stringify({ error: "No se pudo crear con tu foto de referencia. Inténtalo de nuevo en unos segundos." }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          } else {
            return new Response(JSON.stringify({ error: "No se pudo crear con tu foto de referencia. Inténtalo de nuevo en unos segundos." }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    } else if (falKey) {
      try {
        img = await falDirectGenerate(prompt, width, height, seed, falKey);
      } catch (err) {
        console.error("fal falla:", err);
        try {
          if (cfAccount && cfToken) {
            img = await realismWithFallback(prompt, width, height, seed, cfAccount, cfToken);
          } else {
            await tryPollinationsThenRest();
          }
        } catch (errC) {
          console.error("cf falla, pollinations:", errC);
          try {
            await tryPollinationsThenRest();
          } catch (errP) {
            if (isModerationError(errC)) return notAllowedResponse();
            throw errP;
          }
        }
      }
    } else if (cfAccount && cfToken) {
      try {
        img = await realismWithFallback(prompt, width, height, seed, cfAccount, cfToken);
      } catch (errC) {
        console.error("cf falla, pollinations:", errC);
        try {
          await tryPollinationsThenRest();
        } catch (errP) {
          if (isModerationError(errC)) return notAllowedResponse();
          throw errP;
        }
      }
    } else {
      await tryPollinationsThenRest();
    }

    return new Response(img, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});