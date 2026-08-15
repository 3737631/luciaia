const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// @deno-types="npm:edge-tts-universal"
import { UniversalEdgeTTS } from "npm:edge-tts-universal";

const DEFAULT_VOICE = "es-MX-DaliaNeural"; // voz femenina por defecto

// Voces de Microsoft Edge TTS (gratis, sin clave, reales y diferenciadas).
// Femeninas: es-MX-DaliaNeural, es-ES-ElviraNeural, es-US-PalomaNeural,
// es-AR-ElenaNeural, es-CO-SalomeNeural, es-CL-CatalinaNeural,
// es-PE-CamilaNeural, es-PR-KarinaNeural, es-EC-AndreaNeural, es-VE-PaolaNeural
// Masculinas: es-MX-JorgeNeural, es-ES-AlvaroNeural, es-US-AlonsoNeural,
// es-AR-TomasNeural, es-CO-GonzaloNeural, es-CL-LorenzoNeural,
// es-PE-AlexNeural, es-BO-MarceloNeural, es-EC-LuisNeural, es-VE-SebastianNeural
const FEMALE_VOICES = [
  "es-MX-DaliaNeural",
  "es-ES-ElviraNeural",
  "es-US-PalomaNeural",
  "es-AR-ElenaNeural",
  "es-CO-SalomeNeural",
  "es-CL-CatalinaNeural",
  "es-PE-CamilaNeural",
  "es-PR-KarinaNeural",
  "es-EC-AndreaNeural",
  "es-VE-PaolaNeural",
];
const MALE_VOICES = [
  "es-MX-JorgeNeural",
  "es-ES-AlvaroNeural",
  "es-US-AlonsoNeural",
  "es-AR-TomasNeural",
  "es-CO-GonzaloNeural",
  "es-CL-LorenzoNeural",
  "es-PE-AlexNeural",
  "es-BO-MarceloNeural",
  "es-EC-LuisNeural",
  "es-VE-SebastianNeural",
];

// Asigna a cada personaje una voz femenina o masculina DISTINTA.
const VOICE_MAP: Record<string, string> = {
  "female-luna": "es-MX-DaliaNeural",
  "female-nia": "es-ES-ElviraNeural",
  "female-vera": "es-US-PalomaNeural",
  "female-alma": "es-AR-ElenaNeural",
  "female-kira": "es-CO-SalomeNeural",
  "female-maya": "es-CL-CatalinaNeural",
  "female-sasha": "es-PE-CamilaNeural",
  "female-yuki": "es-PR-KarinaNeural",
  "female-athena": "es-EC-AndreaNeural",
  "female-eva": "es-VE-PaolaNeural",
  "female-cora": "es-ES-ElviraNeural",
  "female-mira": "es-MX-DaliaNeural",
  "female-yumi_lib": "es-CL-CatalinaNeural",
  "female-raven": "es-US-PalomaNeural",
  "female-sky": "es-AR-ElenaNeural",
  "female-jade": "es-CO-SalomeNeural",
  "female-gemma": "es-MX-DaliaNeural",
  "female-nova": "es-PE-CamilaNeural",
  "female-lena": "es-PR-KarinaNeural",
  "female-shadow": "es-EC-AndreaNeural",
  "female-morgana": "es-VE-PaolaNeural",
  "female-roxy": "es-CL-CatalinaNeural",
  "female-iris": "es-AR-ElenaNeural",
  "female-zara": "es-US-PalomaNeural",
  "male-axel": "es-MX-JorgeNeural",
  "male-liam": "es-ES-AlvaroNeural",
};

function resolveVoice(voice?: string): string {
  if (voice && VOICE_MAP[voice]) return VOICE_MAP[voice];
  return DEFAULT_VOICE;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Ping de keep-alive (bot "Keep Supabase active"): solo genera actividad sin coste.
    if (action === "ping") {
      return new Response(JSON.stringify({ ok: true, pong: Date.now() }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
      const { text, voice } = body;
      if (!text) {
        return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const activeVoice = resolveVoice(voice);

      // Primary: Microsoft Edge TTS (free, unlimited, no key, real differentiated voices)
      try {
        // Ajustes de naturalidad: velocidad normal de conversación con tono ligeramente cálido.
        const tts = new UniversalEdgeTTS(text, activeVoice, { rate: "+0%", pitch: "+2Hz" });
        const result = await tts.synthesize();
        const audioBuffer = await result.audio.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        return new Response(JSON.stringify({ audio: base64Audio, contentType: "audio/mp3" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        console.error("[voice] Edge TTS failed", String(e));
      }

      // Secondary: ElevenLabs direct API (only if a real key is set)
      const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
      if (elevenLabsKey && elevenLabsKey.startsWith("sk_")) {
        try {
          const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeVoice}`, {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_flash_v2_5",
              voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
            }),
          });

          if (ttsRes.ok) {
            const audioBuffer = await ttsRes.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
            return new Response(JSON.stringify({ audio: base64Audio, contentType: "audio/mp3" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          console.error("[voice] ElevenLabs direct failed", ttsRes.status, await ttsRes.text());
        } catch (e) {
          console.error("[voice] ElevenLabs direct error", String(e));
        }
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
