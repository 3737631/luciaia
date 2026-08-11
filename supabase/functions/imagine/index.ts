const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "black-forest-labs/FLUX.1-schnell";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    const width = Math.min(2048, Math.max(256, Number(body.width) || 768));
    const height = Math.min(2048, Math.max(256, Number(body.height) || 1024));
    const seed = Number(body.seed) || Math.floor(Math.random() * 1e9);

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

    const hf = await fetch("https://router.huggingface.co/nscale/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response_format: "b64_json",
        prompt,
        model: MODEL,
        size: `${width}x${height}`,
        seed,
      }),
    });

    if (!hf.ok) {
      const errText = await hf.text();
      return new Response(
        JSON.stringify({ error: `HF error ${hf.status}: ${errText.slice(0, 300)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await hf.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(
        JSON.stringify({ error: "Respuesta HF inesperada" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
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