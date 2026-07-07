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

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
