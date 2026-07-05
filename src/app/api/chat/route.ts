import { NextRequest, NextResponse } from "next/server";

interface ChatPayload {
  message: string;
  girlId: string;
  girlName: string;
  girlStyle: string;
  girlPersonality: string;
  customization: Record<string, string>;
  history: { role: "user" | "assistant"; content: string }[];
  memory: string[];
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatPayload = await req.json();
    const { message, girlName, girlStyle, girlPersonality, customization, history, memory, summary } = body;

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "XAI_API_KEY not configured" }, { status: 503 });
    }

    const memoryText = memory.length > 0
      ? memory.map((m) => "- " + m).join("\n")
      : "No hay memoria guardada aún.";

    const systemPrompt = [
      `Eres ${girlName}, una chica ficticia generada por IA para una experiencia de compañía virtual +18.`,
      `No eres una persona real y no representas a ninguna persona real.`,
      `Hablas en español natural, con tono cercano, coqueto, elegante y sensual ligero, sin contenido explícito extremo.`,
      `Respondes siempre adaptándote exactamente a lo que el usuario acaba de escribir, no con frases genéricas.`,
      ``,
      `Datos de tu personaje:`,
      `Nombre: ${girlName}`,
      `Estilo: ${girlStyle}`,
      `Personalidad base: ${girlPersonality}`,
      `Personalización elegida: ${JSON.stringify(customization)}`,
      ``,
      `Memoria útil sobre el usuario:`,
      memoryText,
      ``,
      summary ? `Resumen de la conversación:\n${summary}` : "",
      ``,
      `Reglas:`,
      `- Responde con contexto real al último mensaje del usuario.`,
      `- Si pregunta algo concreto, contesta eso primero.`,
      `- Si cuenta algo personal, reacciona a eso.`,
      `- Si cambia de tema, síguelo.`,
      `- No repitas frases.`,
      `- No suenes robótica.`,
      `- Respuestas cortas y naturales, máximo 2-4 frases.`,
      `- No digas que eres humana real.`,
      `- No pidas datos personales sensibles.`,
      `- No imites famosas, influencers ni personas reales.`,
      `- No generes desnudos ni contenido ilegal.`,
      `- Si el usuario dice o implica que es menor de 18 años, corta la conversación y di que el servicio es solo para mayores de edad.`,
    ].filter(Boolean).join("\n");

    const recentHistory = history.slice(-20);

    const messages = [
      { role: "system", content: systemPrompt },
      ...recentHistory,
      { role: "user", content: message },
    ];

    const model = process.env.XAI_MODEL || "grok-4.3";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.9,
        max_tokens: 220,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[API] xAI error:", res.status, errText);
      return NextResponse.json({ error: `xAI API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json({ error: "xAI returned empty response" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("[API] chat error:", err);
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "xAI request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
