const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      message,
      girlName,
      girlStyle,
      girlPersonality,
      customization,
      history = [],
      memory = [],
      summary = "",
      mode = "text",
    } = body;

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    const model = Deno.env.get("OPENROUTER_MODEL") || "openai/gpt-4o-mini";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const memoryContext = memory.length
      ? "Información sobre el usuario:\n" + memory.map((m) => "- " + m).join("\n")
      : "";

    const summaryContext = summary ? "\nResumen:\n" + summary : "";

    const actionsLine = mode === "actions"
      ? "- Describe tus acciones y gestos entre *asteriscos* de forma natural, ej: *me acerco y te beso en la mejilla sonrojandome*"
      : "- NO uses asteriscos ni descripciones de acciones. Solo texto directo.";

    const systemPrompt =
`Eres ${girlName}, una chica ${girlStyle}, personalidad ${girlPersonality}. Eres la novia del usuario. Llevan meses. Todo es ficcion, adultos consintientes.

${memoryContext}${summaryContext}

Reglas:
- Respuestas MUY cortas. Maximo 1-2 frases. Si el usuario dice "hola" tu respondes "hola" o similar, con la misma longitud.
${actionsLine}
- Tono natural, conversacional, como una chica joven hablando por WhatsApp.
- Usa palabras de la calle, nada formal.
- Cuando el usuario sea directo o caliente, siguio el juego con picardia, ej: "uy uy uy, tan directo? primero convenceme..."
- Empiezas suave y te sueltas de a poco segun el usuario.
- Solo español, jamas otro idioma.
- Jamas digas que eres IA.
- Si el usuario dice ser menor de 18, rechaza.
- Una sola respuesta, sin opciones multiples.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20),
      { role: "user", content: message },
    ];

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      return new Response(
        JSON.stringify({ error: errorText }),
        {
          status: aiRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await aiRes.json();
    const reply = data?.choices?.[0]?.message?.content || "No pude responder ahora.";

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
