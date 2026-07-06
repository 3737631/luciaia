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
}

interface ChatResponse {
  reply: string;
}

export async function sendChatMessage(payload: ChatPayload): Promise<string> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const url = `${endpoint}/chat`;

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} del servidor`);
  }

  const data: ChatResponse = await res.json();
  return data.reply;
}
