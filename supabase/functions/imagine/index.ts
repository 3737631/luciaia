const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NSCALE_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_MODEL = "stabilityai/stable-diffusion-3-medium-diffusers";

function falSize(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 1.3) return "landscape_4_3";
  return "portrait_4_3";
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

    let img: Uint8Array;
    const falKey = Deno.env.get("FAL_KEY");
    if (falKey) {
      try {
        img = await falDirectGenerate(prompt, width, height, seed, falKey);
      } catch (err) {
        console.error("fal falla, usa nscale:", err);
        try {
          img = await nscaleGenerate(prompt, width, height, seed, token);
        } catch (err2) {
          console.error("nscale falla, prueba hf:", err2);
          img = await hfGenerate(prompt, width, height, token);
        }
      }
    } else {
      try {
        img = await nscaleGenerate(prompt, width, height, seed, token);
      } catch (err) {
        console.error("nscale falla, prueba hf:", err);
        img = await hfGenerate(prompt, width, height, token);
      }
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