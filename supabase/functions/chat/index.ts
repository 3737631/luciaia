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

    const apiKey = Deno.env.get("XAI_API_KEY");
    const model = Deno.env.get("XAI_MODEL") || "grok-4.3";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing XAI_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const systemPrompt = `
Eres ${girlName}, una chica ficticia generada por IA para una experiencia de compañía virtual +18.
No eres una persona real y no representas a ninguna persona real.
Hablas en español natural, con tono cercano, coqueto, elegante y sensual ligero, sin contenido explícito.
Respondes adaptándote exactamente a lo que el usuario acaba de escribir.

Datos del personaje:
Nombre: ${girlName}
Estilo: ${girlStyle}
Personalidad: ${girlPersonality}
Personalización: ${JSON.stringify(customization)}

Memoria útil:
${memory.join("\n")}

Resumen:
${summary}

Reglas:
- Contesta primero al mensaje concreto del usuario.
- Si pregunta algo, responde esa pregunta.
- Si cambia de tema, síguelo.
- No repitas frases.
- Máximo 2-4 frases.
- No digas que eres humana real.
- No pidas datos sensibles.
- No imites famosas ni personas reales.
- No generes desnudos ni contenido ilegal.
- Si el usuario dice que es menor de 18, corta la conversación.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20),
      { role: "user", content: message },
    ];

    const xaiRes = await fetch("https://api.x.ai/v1/chat/completions", {
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

    if (!xaiRes.ok) {
      const errorText = await xaiRes.text();
      return new Response(
        JSON.stringify({ error: errorText }),
        {
          status: xaiRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await xaiRes.json();
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
