const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NSCALE_MODEL = "black-forest-labs/FLUX.1-schnell";

function falSize(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 1.3) return "landscape_4_3";
  return "square_hd";
}

async function falGenerate(prompt: string, size: string, seed: number, token: string): Promise<Uint8Array> {
  const res = await fetch("https://router.huggingface.co/fal-ai/fal-ai/flux/dev", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image_size: size,
      num_inference_steps: 28,
      num_images: 1,
      seed,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal error ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const url = json?.images?.[0]?.url;
  if (!url) throw new Error("fal: no se obtuvo URL de imagen");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`fal: descarga de imagen ${img.status}`);
  return new Uint8Array(await img.arrayBuffer());
}

async function nscaleGenerate(prompt: string, width: number, height: number, seed: number, token: string): Promise<Uint8Array> {
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`nscale error ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("nscale: respuesta inesperada");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    const width = Math.min(2048, Math.max(256, Number(body.width) || 768));
    const height = Math.min(2048, Math.max(256, Number(body.height) || 1024));

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
    try {
      img = await falGenerate(prompt, falSize(width, height), seed, token);
    } catch (err) {
      console.error("fal fallback a nscale:", err);
      img = await nscaleGenerate(prompt, width, height, seed, token);
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