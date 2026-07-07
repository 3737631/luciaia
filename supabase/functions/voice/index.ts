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

      const groqKey = Deno.env.get("GROQ_API_KEY");
      if (!groqKey) {
        return new Response(JSON.stringify({ error: "Missing GROQ_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const audioBinary = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
      const ext = mimeType?.includes("mp4") ? "m4a" : mimeType?.includes("webm") ? "webm" : mimeType?.includes("aac") ? "aac" : mimeType?.includes("mpeg") ? "mp3" : mimeType?.includes("wav") ? "wav" : "webm";

      const formData = new FormData();
      formData.append("file", new Blob([audioBinary], { type: mimeType || "audio/webm" }), `audio.${ext}`);
      formData.append("model", Deno.env.get("STT_MODEL") || "whisper-large-v3");
      formData.append("language", "es");
      formData.append("response_format", "json");

      const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}` },
        body: formData,
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        return new Response(JSON.stringify({ error: `Groq STT error: ${errText}` }), { status: groqRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await groqRes.json();
      const text = data.text || "";

      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "tts") {
      const { text } = body;
      if (!text) {
        return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const apiKey = Deno.env.get("OPENROUTER_API_KEY");

      // Try OpenRouter TTS first
      if (apiKey) {
        try {
          const ttsRes = await fetch("https://openrouter.ai/api/v1/audio/speech", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts-2025-12-15",
              input: text,
              voice: "nova",
              response_format: "mp3",
            }),
          });

          if (ttsRes.ok) {
            const audioBuffer = await ttsRes.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
            return new Response(JSON.stringify({ audio: base64Audio, contentType: "audio/mp3" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        } catch {}
      }

      // Fallback: Google Translate TTS (free, no key needed)
      try {
        const gttsRes = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (gttsRes.ok) {
          const audioBuffer = await gttsRes.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          return new Response(JSON.stringify({ audio: base64Audio, contentType: "audio/mpeg" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch {}

      return new Response(JSON.stringify({ error: "No TTS method available" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
