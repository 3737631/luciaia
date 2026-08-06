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
