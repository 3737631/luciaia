const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// @deno-types="npm:edge-tts-universal"
import { UniversalEdgeTTS } from "npm:edge-tts-universal";

const DEFAULT_VOICE = "hpp4J3VqNfWAUOO0d1Us"; // Bella

const VOICE_MAP: Record<string, string> = {
  "female-luna": "hpp4J3VqNfWAUOO0d1Us", // Bella
  "female-nia": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "female-vera": "Xb7hH8MSUJpSbSDYk0k2", // Alice
  "female-alma": "FGY2WhTYpPnrIDTdsKH5", // Laura
  "female-kira": "pFZP5JQG7iQjIQuC4Bku", // Lily
  "female-maya": "cgSgspJ2msm6clMCkdW9", // Jessica
  "female-sasha": "XrExE9yKIg1WjnnlVkGX", // Matilda
  "female-yuki": "hpp4J3VqNfWAUOO0d1Us", // Bella
  "male-axel": "pNInz6obpgDQGcFmaJgB", // Adam
  "male-liam": "TX3LPaxmHKxFdv7VOQHJ", // Liam
  "female-athena": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "female-eva": "Xb7hH8MSUJpSbSDYk0k2", // Alice
  "female-cora": "FGY2WhTYpPnrIDTdsKH5", // Laura
  "female-mira": "pFZP5JQG7iQjIQuC4Bku", // Lily
  "female-yumi_lib": "cgSgspJ2msm6clMCkdW9", // Jessica
  "female-raven": "XrExE9yKIg1WjnnlVkGX", // Matilda
  "female-sky": "hpp4J3VqNfWAUOO0d1Us", // Bella
  "female-jade": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "female-gemma": "Xb7hH8MSUJpSbSDYk0k2", // Alice
  "female-nova": "FGY2WhTYpPnrIDTdsKH5", // Laura
  "female-lena": "pFZP5JQG7iQjIQuC4Bku", // Lily
  "female-shadow": "cgSgspJ2msm6clMCkdW9", // Jessica
  "female-morgana": "XrExE9yKIg1WjnnlVkGX", // Matilda
  "female-roxy": "hpp4J3VqNfWAUOO0d1Us", // Bella
  "female-iris": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "female-zara": "Xb7hH8MSUJpSbSDYk0k2", // Alice
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

      const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");

      // Primary: ElevenLabs direct API (real voices)
      if (elevenLabsKey) {
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

      // Fallback: Microsoft Edge TTS (free, unlimited, no key needed)
      try {
        const tts = new UniversalEdgeTTS(text, activeVoice);
        const result = await tts.synthesize();
        const audioBuffer = await result.audio.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        return new Response(JSON.stringify({ audio: base64Audio, contentType: "audio/mp3" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        console.error("[voice] Edge TTS failed", String(e));
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
