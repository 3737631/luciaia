const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "stt") {
      const { audio, mimeType } = body;
      if (!audio) {
        return new Response(JSON.stringify({ error: "Missing audio" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const hfToken = Deno.env.get("HUGGINGFACE_TOKEN") || Deno.env.get("HF_TOKEN");
      if (!hfToken) {
        return new Response(JSON.stringify({ error: "Missing HUGGINGFACE_TOKEN" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const audioBinary = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
      const model = Deno.env.get("STT_MODEL") || "openai/whisper-large-v3";
      const contentType = mimeType || "audio/webm";

      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": contentType,
        },
        body: audioBinary,
      });

      if (!hfRes.ok) {
        const errText = await hfRes.text();
        return new Response(JSON.stringify({ error: `HF STT error: ${errText}` }), { status: hfRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const hfData = await hfRes.json();
      const text = hfData.text || "";

      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "tts") {
      const { text } = body;
      if (!text) {
        return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const hfToken = Deno.env.get("HUGGINGFACE_TOKEN") || Deno.env.get("HF_TOKEN");
      if (!hfToken) {
        return new Response(JSON.stringify({ error: "Missing HUGGINGFACE_TOKEN" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const model = Deno.env.get("TTS_MODEL") || "facebook/mms-tts-spa";

      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (!hfRes.ok) {
        const errText = await hfRes.text();
        return new Response(JSON.stringify({ error: `HF TTS error: ${errText}` }), { status: hfRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const audioBuffer = await hfRes.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(JSON.stringify({ audio: base64Audio, contentType: hfRes.headers.get("content-type") || "audio/flac" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
