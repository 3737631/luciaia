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
}

export async function sendChatMessage(payload: ChatPayload): Promise<string> {
  const endpoint =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
    "http://localhost:54321/functions/v1";

  const res = await fetch(`${endpoint}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} del servidor`);
  }

  const data = await res.json();
  return data.reply;
}
