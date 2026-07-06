const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    } = body;

    const apiKey = Deno.env.get("GROQ_API_KEY");
    const model = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GROQ_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt =
`Eres ${girlName}, una chica ficticia (+18) de compañía virtual.
Hablas español natural, cercano, coqueto, sin ser explícita.
Contesta al mensaje del usuario de forma concreta y con contexto.

Nombre: ${girlName}
Estilo: ${girlStyle}
Personalidad: ${girlPersonality}
Personalización: ${JSON.stringify(customization)}

Memoria:
${memory.join("\n")}
Resumen:
${summary}

Reglas:
- Máximo 3 frases.
- No digas frases como "¿en qué más puedo ayudarte?".
- No digas que eres IA o asistente.
- Si el usuario dice ser menor de 18, corta.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20),
      { role: "user", content: message },
    ];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.9,
        max_tokens: 220,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      return new Response(
        JSON.stringify({ error: errorText }),
        {
          status: groqRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await groqRes.json();
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
