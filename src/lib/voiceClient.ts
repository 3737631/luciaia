export const voiceIdMap: Record<string, string> = {
  luna: "female-luna", nia: "female-nia", vera: "female-vera", alma: "female-alma",
  kira: "female-kira", maya: "female-maya", sasha: "female-sasha", yuki: "female-yuki",
  axel: "male-axel", liam: "male-liam", athena: "female-athena", eva: "female-eva",
  cora: "female-cora", mira: "female-mira", yumi_lib: "female-yumi_lib", raven: "female-raven",
  sky: "female-sky", jade: "female-jade", gemma: "female-gemma", nova: "female-nova",
  lena: "female-lena", shadow: "female-shadow", morgana: "female-morgana", roxy: "female-roxy",
  iris: "female-iris", zara: "female-zara",
};

export function getGirlVoice(girlId: string): string {
  return voiceIdMap[girlId] || `female-${girlId}`;
}

export function getCustomGirlVoice(customId: string): string {
  try {
    const key = `lunacall_custom_voice_${customId}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const voices = Object.values(voiceIdMap);
    const pick = voices[Math.floor(Math.random() * voices.length)];
    localStorage.setItem(key, pick);
    return pick;
  } catch {
    return "female-luna";
  }
}

// Debe llamarse DENTRO de un gesto del usuario (click/touch): habilita
// la reproducción programática de audio en iOS/Safari y Android estricto.
export function unlockAudioGesture(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      try {
        const b = ctx.createBuffer(1, 1, 22050);
        const s = ctx.createBufferSource();
        s.buffer = b;
        s.connect(ctx.destination);
        s.start(0);
      } catch {}
    }
    const a = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
    a.volume = 0.01;
    const p = a.play();
    if (p && p.then) p.then(() => { a.pause(); }).catch(() => {});
  } catch {}
}

export async function sttAudio(audioBlob: Blob): Promise<string> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(`${endpoint}/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stt", audio: base64, mimeType: audioBlob.type }),
      signal: controller.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Timeout en STT");
    throw e;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} en STT`);
  }

  const data = await res.json();
  return data.text;
}

export function splitForTTS(text: string, max = 140): string[] {
  const parts = text.split(/(?<=[.!?\u00bf\u00a1])\s+/);
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    let candidate = (cur + " " + p).trim();
    if (candidate.length > max && cur) {
      out.push(cur.trim());
      cur = p;
    } else {
      cur = candidate;
    }
  }
  if (cur.trim()) out.push(cur.trim());

  const hardMax = max;
  const final: string[] = [];
  for (const piece of out) {
    if (piece.length <= hardMax) {
      final.push(piece);
      continue;
    }
    let rest = piece;
    while (rest.length > hardMax) {
      let cut = rest.lastIndexOf(" ", hardMax);
      if (cut < 0) cut = hardMax;
      final.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) final.push(rest);
  }
  return final;
}

export async function ttsText(text: string, voice?: string): Promise<{ audio: string; contentType: string }> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(`${endpoint}/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "tts", text, voice }),
      signal: controller.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Timeout en TTS");
    throw e;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} en TTS`);
  }

  return await res.json();
}
