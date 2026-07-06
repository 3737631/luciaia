import puter from "@heyputer/puter.js";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface GirlInfo {
  id: string;
  name: string;
  style: string;
  personality: string;
  customization?: Record<string, unknown>;
  memory?: string[];
  summary?: string;
}

async function aiChat(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; max_tokens?: number },
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await puter.ai.chat(messages as any, {
    model: options?.model ?? "gpt-5-nano",
    temperature: options?.temperature ?? 0.9,
    max_tokens: options?.max_tokens ?? 220,
  });

  const data = response as any;
  const content = data?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    const arr: any[] = content;
    const firstText = arr.find((c) => c?.type === "text");
    if (firstText?.text) return firstText.text.trim();
  }
  throw new Error("Respuesta inesperada de la IA");
}

export async function getAiResponse(
  userMessage: string,
  history: ChatMessage[],
  girl: GirlInfo,
): Promise<string> {
  const custom = girl.customization || {};
  const memoryList = girl.memory || [];
  const summary = girl.summary || "";

  const memoryContext = memoryList.length
    ? "Información conocida sobre el usuario:\n" + memoryList.map((m) => "- " + m).join("\n")
    : "";

  const summaryContext = summary ? "\nResumen de la conversación anterior:\n" + summary : "";

  const systemPrompt =
    `Eres ${girl.name}, una chica ficticia (+18) que chatea por texto con un usuario. ` +
    `Tu personalidad: ${girl.personality}. ` +
    `Tu estilo de conversación: ${girl.style}. ` +
    `El usuario ha personalizado tu apariencia: ${JSON.stringify(custom)}. ` +
    `Debes responder como si fueras un personaje real, con contexto y coherencia. ` +
    `Usa un lenguaje natural, cercano, como si hablaras con alguien que te interesa. ` +
    `No uses frases genéricas ni rompas el personaje. ` +
    `Mantén respuestas cortas (máximo 3 frases). ` +
    `NUNCA digas frases como "¿en qué más puedo ayudarte?" o "¿hay algo más que quieras saber?". ` +
    `NUNCA digas "como asistente virtual" o "como IA" o similares. ` +
    `Eres una chica real, no una asistente. ` +
    memoryContext +
    summaryContext;

  const recentHistory = history.slice(-20);
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: userMessage },
  ];

  return aiChat(messages);
}

export function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();
  if (/soy (menor|niñ[oa]|pequeñ[oa])|tengo (1[0-7]|8\s?años?\s?(no|menos))|menor/i.test(msg)) {
    return "Lo siento, este servicio es solo para mayores de 18 años. No puedo continuar.";
  }
  const responses = [
    "No puedo responderte ahora, el servicio de IA no está disponible. Intenta de nuevo más tarde.",
    "Lo siento, ahora mismo no puedo procesar tu mensaje. El servicio de IA está desconectado.",
    "Parece que el servicio de IA no responde. Vuelve a intentarlo en un momento.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
