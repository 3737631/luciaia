import { ChatMessage } from "./memory";

interface ChatPayload {
  message: string;
  girlId: string;
  girlName: string;
  girlStyle: string;
  girlPersonality: string;
  customization: Record<string, unknown>;
  history: ChatMessage[];
  memory: string[];
  summary: string;
  mode?: "text" | "actions";
  userGender?: "hombre" | "mujer";
  characterGender?: "hombre" | "mujer";
  customScenario?: string;
}

export async function sendChatMessage(payload: ChatPayload): Promise<string> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(`${endpoint}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("El servidor tarda demasiado");
    throw e;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} del servidor`);
  }

  const data = await res.json();
  return data.reply;
}

export async function generateGirlImage(payload: {
  prompt: string;
  width: number;
  height: number;
  image?: string;
  jobId?: string;
  avatar?: boolean;
}): Promise<Blob> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const res = await fetch(`${endpoint}/imagine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} del servidor`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json().catch(() => null);
    if (data?.status === "queued" && data.jobId) {
      return await pollGirlImage(data.jobId, data.source);
    }
    if (data?.status === "processing") {
      throw new Error("Job en proceso");
    }
    throw new Error(data?.error || "No se pudo generar la imagen");
  }

  return res.blob();
}

async function pollGirlImage(jobId: string, source?: string): Promise<Blob> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const deadline = Date.now() + 6 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await fetch(`${endpoint}/imagine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error ${res.status} del servidor`);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json().catch(() => null);
      if (data?.status === "failed") {
        throw new Error(data.error || "No se pudo generar la imagen");
      }
      continue;
    }
    return res.blob();
  }
  throw new Error("El servidor está tardando demasiado. Vuelve a intentarlo.");
}
