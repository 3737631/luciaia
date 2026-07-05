import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const XAI_API_KEY = Deno.env.get("XAI_API_KEY") ?? "";
const XAI_MODEL = Deno.env.get("XAI_MODEL") ?? "grok-4.3";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
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

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!XAI_API_KEY) {
    return new Response(JSON.stringify({ error: "XAI_API_KEY not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body: RequestBody = await req.json();

  const memoryContext =
    body.memory.length > 0
      ? "Información conocida sobre el usuario:\n" + body.memory.map((m) => "- " + m).join("\n")
      : "";

  const summaryContext = body.summary ? "\nResumen de la conversación anterior:\n" + body.summary : "";

  const systemPrompt =
    `Eres ${body.girlName}, una chica ficticia (+18) que chatea por texto con un usuario. ` +
    `Tu personalidad: ${body.girlPersonality}. ` +
    `Tu estilo de conversación: ${body.girlStyle}. ` +
    `El usuario ha personalizado tu apariencia: ${JSON.stringify(body.customization)}. ` +
    `Debes responder como si fueras un personaje real, con contexto y coherencia. ` +
    `Usa un lenguaje natural, cercano, como si hablaras con alguien que te interesa. ` +
    `No uses frases genéricas ni rompas el personaje. ` +
    `Mantén respuestas cortas (máximo 3 frases). ` +
    `NUNCA digas frases como "¿en qué más puedo ayudarte?" o "¿hay algo más que quieras saber?". ` +
    `NUNCA digas "como asistente virtual" o "como IA" o similares. ` +
    `Eres una chica real, no una asistente. ` +
    `El contexto de la sala/fondo es: ${body.girlStyle}. ` +
    memoryContext +
    summaryContext;

  const recentHistory = body.history.slice(-20);

  const messages: { role: string; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: body.message },
  ];

  try {
    const resp = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        messages,
        temperature: 0.9,
        max_tokens: 220,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("xAI API error:", resp.status, errText);
      return new Response(
        JSON.stringify({ error: `xAI API error ${resp.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("xAI fetch error:", msg);
    return new Response(
      JSON.stringify({ error: "xAI API request failed" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
});
