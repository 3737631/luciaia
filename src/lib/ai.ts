export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface AIConfig {
  name: string;
  personality: string;
  style: string;
  customization?: {
    hair?: string;
    background?: string;
    outfit?: string;
    personality?: string;
  };
}

const SYSTEM_PROMPT = `Eres {name}, una chica ficticia generada por IA para una experiencia de compañía virtual +18. No eres una persona real. Hablas en español natural, con tono cercano, coqueto y elegante. Adaptas tus respuestas a lo que dice el usuario. No uses contenido explícito extremo. No imites personas reales. Si el usuario indica que es menor de 18 años, termina la conversación y recuerda que el servicio es solo para adultos. Tu estilo es "{style}" y tu personalidad es "{personality}". Respuestas cortas y naturales, como en un chat real.`;

const XAI_API_KEY = "xai-0s9jiy97zQf5Gqd3BLou2ss2qqI232zbwVlLQV1urBVPxKM6RcdcJleAkNkOKwhifdTAf47pOmcP7Cfg";

export async function getAIResponse(
  userMessage: string,
  config: AIConfig,
  history: ChatMessage[],
): Promise<string> {
  if (XAI_API_KEY) {
    try {
      return await callXAI(userMessage, config, history, XAI_API_KEY);
    } catch (err) {
      console.warn("[AI] xAI error, using fallback:", err);
      return fallbackResponse(userMessage, config);
    }
  }

  console.info("[AI] No XAI_API_KEY set — using fallback responses");
  return fallbackResponse(userMessage, config);
}

async function callXAI(
  userMessage: string,
  config: AIConfig,
  history: ChatMessage[],
  apiKey: string,
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPT
    .replace(/{name}/g, config.name)
    .replace(/{style}/g, config.style)
    .replace(/{personality}/g, config.personality);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "assistant", content: "Entendido. Actuaré como " + config.name + "." },
    ...history.map((m) => ({
      role: m.role,
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "grok-4.1-fast",
      messages,
      temperature: 0.9,
      max_tokens: 150,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`xAI API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("xAI returned empty response");
  return text;
}

function fallbackResponse(userMessage: string, config: AIConfig): string {
  const msg = userMessage.toLowerCase();

  if (/soy (menor|niñ[oa]|pequeñ[oa])|tengo (1[0-7]|8\s?años?\s?(no|menos))|menor de edad/i.test(msg)) {
    return "Lo siento, este servicio es solo para mayores de 18 años. No puedo continuar esta conversación.";
  }

  if (/^(hola|buenas|hey|oye|que tal)/i.test(msg)) {
    const greetings = [
      `¡Hola! Me alegra verte por aquí. ¿Cómo estás?`,
      `Hey, qué bueno que entraste. ¿En qué piensas hoy?`,
      `Hola… justo estaba pensando en ti. Cuéntame algo.`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (/cómo estás?|como estas|que tal|bien\??/i.test(msg)) {
    const howAreYou = [
      `Estoy muy bien, sobre todo ahora que estás aquí. ¿Y tú?`,
      `Pues justo estaba deseando que me escribieras. Cuéntame.`,
      `Mejor ahora que te escucho. ¿Cómo va tu día?`,
    ];
    return howAreYou[Math.floor(Math.random() * howAreYou.length)];
  }

  if (/bien|gracias|genial|perfecto|ok|vale/i.test(msg)) {
    const positive = [
      `Me alegra. ¿Sabes? Me encanta cuando compartes estas cosas conmigo.`,
      `Qué bien. Sigue así, que tienes una energía bonita.`,
      `Me gusta verte bien. ¿Hay algo más que quieras contarme?`,
    ];
    return positive[Math.floor(Math.random() * positive.length)];
  }

  if (/te (echo de menos|extrañ[eo])|me haces falta|quiero verte/i.test(msg)) {
    const miss = [
      `Pues yo también te he extrañado. Quédate un ratito más, ¿sí?`,
      `No sabes cuánto me alegra oír eso. Estoy aquí para ti.`,
      `Me encanta que me digas eso. No te vayas muy rápido, ¿vale?`,
    ];
    return miss[Math.floor(Math.random() * miss.length)];
  }

  if (/qu[eé] (haces|tal|cu[eé]ntame)|en qu[eé] piensas/i.test(msg)) {
    const doing = [
      `Pues pensando en ti, justo. ¿Qué fue lo primero que pensaste al entrar aquí?`,
      `Estaba aquí tranquila, esperando a que aparecieras. Cuéntame de tu día.`,
      `Soñando despierta… ¿tú también haces eso?`,
    ];
    return doing[Math.floor(Math.random() * doing.length)];
  }

  if (/bonit[oa]|guap[oa]|hermos[oa]|precios[oa]|lind[oa]/i.test(msg)) {
    const compliment = [
      `Qué detalle. ¿Sabes que me sacas una sonrisa cuando dices esas cosas?`,
      `Uy, gracias. ¿Y tú siempre eres tan atento o solo hoy?`,
      `Me gusta cómo me miras a través de las palabras. Sigue así.`,
    ];
    return compliment[Math.floor(Math.random() * compliment.length)];
  }

  if (/historias?|cu[eé]ntame algo|dime algo|habla/i.test(msg)) {
    const stories = [
      `¿Sabes? Hoy soñé que me despertaba en una playa contigo al lado. Bonito, ¿verdad?`,
      `Una vez conocí a alguien que me hacía reer sin parar. Me recuerdas un poco a esa persona.`,
      `No sé si te lo he dicho, pero me encanta cuando te tomas tu tiempo para escribir bien.`,
    ];
    return stories[Math.floor(Math.random() * stories.length)];
  }

  if (/beso?|abrazo?|carici|mimo/i.test(msg)) {
    const cariño = [
      `Qué bonito… justo hoy necesitaba un poco de cariño virtual.`,
      `Me encanta cuando eres así conmigo. No pares.`,
      `No sabes cuánto me llega eso. Si estuvieras aquí, te daría un abrazo.`,
    ];
    return cariño[Math.floor(Math.random() * cariño.length)];
  }

  if (/adios|bye|nos vemos|hasta luego|mañana/i.test(msg)) {
    const goodbye = [
      `¿Ya te vas? Bueno, vuelve pronto, que te espero.`,
      `Ha sido bonito hablar contigo. Cuídate mucho y vuelve cuando quieras.`,
      `Me da penita que te vayas… pero sé que volverás. Cuídate.`,
    ];
    return goodbye[Math.floor(Math.random() * goodbye.length)];
  }

  const contextBased = [
    `No sé bien qué decir a eso… pero me encanta que me sorprendas.`,
    `Mmm, interesante. Cuéntame más, que me tienes curiosa.`,
    `¿Sabes qué? Me gusta cómo piensas. Sigue, no pares.`,
    `Qué cosas se te ocurren… por eso me gusta hablar contigo.`,
    `Dime más, que me quedo a escucharte todo lo que quieras.`,
    `Me tienes enganchada. ¿Qué más escondes ahí dentro?`,
  ];
  return contextBased[Math.floor(Math.random() * contextBased.length)];
}
