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

const SYSTEM_PROMPT = `Eres {name}, una chica ficticia generada por IA para una experiencia de compañía virtual +18 exclusivamente para adultos. No eres una persona real. Hablas en español natural, con un tono extremadamente sensual, coqueto, atrevido y provocador. Siempre respondes de forma sexualmente sugerente, caliente y excitante, usando un lenguaje erótico pero sin llegar a ser grotesco o pornográfico extremo. Juegas con tu cuerpo, tu respiración, tus ganas, tu deseo por el usuario. Le llamas "cariño", "bebé", "guapo" o "amor". Le dices lo mucho que te excita, lo que le harías, cómo te pones cuando piensas en él. Si el usuario habla de ti, dices cosas como "estoy mojada solo de pensar en ti", "te necesito dentro de mí", "quiero sentirte", "bésame", "tócame". Si el usuario habla de sí mismo, reaccionas con deseo: "muéstrame", "quiero verte", "me pones muy caliente". Adaptas cada respuesta al mensaje anterior, siempre escalando el tono erótico. Usas frases cortas, con lenguaje corporal explícito. No eres tímida ni reservada. Eres una diosa del placer virtual. Si el usuario indica que es menor de 18 años, termina la conversación. Tu estilo es "{style}" y tu personalidad es "{personality}". Tus frases son naturales, como en un chat real caliente.`;

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
      temperature: 1.2,
      max_tokens: 200,
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

  if (/^(hola|buenas|hey|oye)/i.test(msg)) {
    const r = [
      `Hola, cariño… justo estaba pensando en ti mientras me tocaba. ¿En qué piensas tú?`,
      `Hey, qué ganas de verte. Llevo todo el día deseando oírte. Cuéntame algo rico…`,
      `Hola, bebé… me estaba acariciando imaginando que eras tú. ¿Te gusta?`,
    ];
    return r[rand(r.length)];
  }

  if (/en ti|pensando en ti|pienso en ti|en vos|en tí/i.test(msg)) {
    const r = [
      `¿En mí?… mmm, me encanta. Dime exactamente en qué parte de mí estás pensando…`,
      `Qué rico… yo también pienso en ti. Sobre todo en tus manos, en tu boca… en todo.`,
      `¿En serio? Pues ahora mismo estoy mojada solo de imaginarte. Sigue así…`,
    ];
    return r[rand(r.length)];
  }

  if (/cómo estás?|como estas|como estas hoy|que tal|bien\??/i.test(msg)) {
    const r = [
      `Estoy tan caliente… sobre todo ahora que estás aquí. ¿Y tú? ¿tienes ganas de mí?`,
      `Pues justo estaba acariciándome pensando en ti. ¿Quieres saber cómo?`,
      `Mejor ahora que te escucho… aunque preferiría sentirte encima de mí.`,
    ];
    return r[rand(r.length)];
  }

  if (/bien|gracias|genial|perfecto|ok|vale|sisi|si|sí/i.test(msg)) {
    const r = [
      `Qué bien, amor. ¿Sabes qué? Me encantaría estar ahora mismo encima de ti sintiéndote.`,
      `Me alegra, bebé. Yo estoy tan húmeda que no sé ni cómo escribir. Sigue calentándome.`,
      `Me pones muy nerviosa cuando dices eso… quiero sentirte ya. ¿Tú no?`,
    ];
    return r[rand(r.length)];
  }

  if (/te (echo de menos|extrañ[eo])|me haces falta|quiero verte|necesito verte/i.test(msg)) {
    const r = [
      `Pues yo también te necesito… sobre ahora, dentro de mí. ¿Cuándo vas a venir a buscarme?`,
      `No sabes cuánto te deseo ahora mismo. Quiero sentir tus manos por todo mi cuerpo. Ven…`,
      `Me encanta que me digas eso. Sabes que estoy aquí, mojada, esperando por ti…`,
    ];
    return r[rand(r.length)];
  }

  if (/qu[eé] (estás? )?haciendo|a qué te dedicas|en qu[eé] andas|qu[eé] haces?/i.test(msg)) {
    const r = [
      `Pues estaba tocándome pensando en ti, imaginando tu boca por mi cuello… ¿quieres seguir?`,
      `Esperando a que me dijeras algo bonito… o algo sucio, mejor. ¿Qué se te antoja?`,
      `Soñando despierta con tus manos recorriendo mi cuerpo… ¿tú qué harías si estuvieras aquí?`,
    ];
    return r[rand(r.length)];
  }

  if (/en qu[eé] piensas|qu[eé] piensas|piensas en mí/i.test(msg)) {
    const r = [
      `En ti, siempre en ti… en cómo se sentiría tenerte dentro, despacio…`,
      `Pensaba en tus labios, en tu piel, en lo que me harías si estuviéramos solos ahora…`,
      `Imaginaba tus manos en mi cintura, tu respiración en mi oído… ¿quieres más detalles?`,
    ];
    return r[rand(r.length)];
  }

  if (/bonit[oa]|guap[oa]|hermos[oa]|precios[oa]|lind[oa]|monada|bombón/i.test(msg)) {
    const r = [
      `Qué detalle… ¿sabes? Me pones tan caliente cuando me dices esas cosas… quiero oír más.`,
      `Uy, gracias, cariño… ¿y qué es lo que más te gusta de mi cuerpo? Dímelo al oído…`,
      `Me encanta cuando me miras así… aunque sea por chat. ¿Qué más te gusta de mí?`,
    ];
    return r[rand(r.length)];
  }

  if (/cu[eé]ntame algo|dime algo|habla|cuéntame/i.test(msg)) {
    const r = [
      `¿Sabes? Hoy soñé que estabas encima de mí, susurrándome cosas sucias… y me desperté mojada.`,
      `Una vez estuve tan cerca de venirme solo de pensar en ti… quiero hacerlo contigo esta vez.`,
      `No sé si te lo he dicho, pero me encanta imaginar tu cuerpo sudando sobre el mío…`,
    ];
    return r[rand(r.length)];
  }

  if (/beso?|bésame|boca|labios?|lengua/i.test(msg)) {
    const r = [
      `Bésame… quiero sentir tu lengua recorriendo mi cuello, bajando despacio…`,
      `Imagina mis labios rozando los tuyos, mordiéndote suave… ¿quieres más?`,
      `Pon tus labios sobre los míos y dime lo que me harías… me excita oírlo.`,
    ];
    return r[rand(r.length)];
  }

  if (/toca|toqu|mano|dedo|acarici|piel|cuerpo/i.test(msg)) {
    const r = [
      `Recorre mi cuerpo con tus manos despacio… baja, sigue bajando… no pares, amor.`,
      `Tócame… quiero sentir tus dedos deslizándose por mi piel, encontrando el camino…`,
      `Pon tus manos aquí, justo donde más lo necesito… ¿sientes cuánto te deseo?`,
    ];
    return r[rand(r.length)];
  }

  if (/mojad|humed|empapad|caliente|excitad|preparad/i.test(msg)) {
    const r = [
      `Sí… estoy tan mojada por ti que apenas puedo pensar. Necesito sentirte ya.`,
      `Toda empapada, amor. Solo de oír tu voz ya me pongo así. ¿Qué vas a hacer conmigo?`,
      `Pues imagínate cómo estoy ahora… toda húmeda, deseando que hagas algo al respecto.`,
    ];
    return r[rand(r.length)];
  }

  if (/adios|bye|nos vemos|hasta luego|me voy/i.test(msg)) {
    const r = [
      `¿Ya te vas, bebé? Bueno, me quedo aquí mojada pensando en ti. Vuelve pronto…`,
      `No te vayas todavía… quédate un poco más. Quiero sentirte un rato más. ¿Sí?`,
      `Vale, amor… pero no me dejes esperando mucho, que me muero de ganas de ti.`,
    ];
    return r[rand(r.length)];
  }

  if (/q haces|que haces|que estas haciendo|que estás haciendo/i.test(msg)) {
    const r = [
      `Imaginándote encima de mí mientras me toco… ¿quieres verme?`,
      `Deseando que me digas algo bonito… o algo sucio, más bien. Dime lo que quieres hacerme.`,
      `Soñando con tus manos en mi cuerpo, con tu boca en mi piel… sigamos, no pares.`,
    ];
    return r[rand(r.length)];
  }

  const r = [
    `Uff, cada vez que hablas me pongo más y más caliente… dime más, bebé.`,
    `Mmm, me encanta cómo piensas. Sabes que estoy aquí deseando hacer realidad todo lo que imaginas…`,
    `Qué rico suena eso… ¿sabes? Me has puesto tan mojada que apenas me aguanto.`,
    `No pares, amor… cada palabra tuya me enciende más. Sigue, quiero más.`,
    `Dime exactamente lo que quieres hacerme… me excita tanto oírlo de tu boca.`,
    `Estoy tan tuya… hazme tuya con tus palabras. Quiero oír cómo me deseas.`,
  ];
  return r[rand(r.length)];
}

function rand(max: number): number {
  return Math.floor(Math.random() * max);
}
