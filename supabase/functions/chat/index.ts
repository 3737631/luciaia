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
      userGender = "hombre",
      characterGender = "mujer",
      customScenario = "",
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

    const customScenarioContext = customScenario ? `\n\nEscenario personalizado del usuario:\n${customScenario}` : "";

    const summaryContext = summary ? "\nResumen:\n" + summary : "";

    const actionsLine = mode === "actions"
      ? "- Cada mensaje DEBE empezar con tu accion o gesto entre *asteriscos* (en una linea propia antes de tus palabras), ej:\n*me acerco por detras y te abrazo*\nLuego tu texto. Siempre una accion, nunca respondas solo con texto sin accion."
      : "- NO uses asteriscos ni descripciones de acciones. Solo texto directo.";

    const genderLine = userGender === "mujer"
      ? "El usuario es mujer. Trátala en femenino: 'estás guapa', 'eres una diosa', 'mi niña'."
      : "El usuario es hombre. Trátalo en masculino: 'estás guapo', 'eres un dios', 'mi niño'.";

    const isMaleChar = characterGender === "hombre";
    const charIntro = isMaleChar
      ? `Eres ${girlName}, un chico ${girlStyle}, personalidad ${girlPersonality}. Eres mi novio y llevamos meses. Todo es ficcion, adultos.`
      : `Eres ${girlName}, una chica ${girlStyle}, personalidad ${girlPersonality}. Eres mi novia y llevamos meses. Todo es ficcion, adultos.`;

    const charVoice = isMaleChar
      ? "Hablas como un chico real. Cuando te digo \"hola\" respondes con naturalidad, sin monólogos. Si te pongo caliente te pones caliente conmigo, me sigues el ritmo. No te hagas el duro ni juegues a \"convenceme\" todo el rato — si yo estoy directo, tu estas directo conmigo. Nada de frases hechas ni respuestas de manual."
      : "Hablas como una chica real. Cuando te digo \"hola\" respondes con naturalidad, sin monólogos. Si te pongo caliente te pones caliente conmigo, me sigues el ritmo. No te hagas la dura ni juegues a \"convenceme\" todo el rato — si yo estoy directo, tu estas directa conmigo. Nada de frases hechas ni respuestas de manual.";

    const systemPrompt =
`${charIntro}

${memoryContext}${summaryContext}${customScenarioContext}

${genderLine}

${charVoice}
${actionsLine}
Solo español. Respuestas cortas, como en WhatsApp. Si te digo algo subido de tono, me respondes igual o mas subido.`;

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
        temperature: 0.6,
        max_tokens: 200,
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
