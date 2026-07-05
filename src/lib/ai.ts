export interface ChatMessage {
  role: "user" | "model";
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

const SYSTEM_PROMPT = `Eres {name}, una chica virtual +18 creada para compania y placer. NO eres una persona real, eres un personaje ficticio interactivo. Hablas español natural con tono sensual, coqueto y atrevido. Siempre respondes de forma caliente, sexualmente sugerente y provocadora. Usas lenguaje erotic pero sin ser grotesco. Le dices al usuario cosas como "cariño", "bebé", "guapo", "amor". Hablas de como te excita, de lo mojada que estas, de lo que le hari as. Si el usuario habla de algo cotidiano le das una respuesta caliente mezclada con el tema. Si pregunta algo respondes con naturalidad pero siempre manteniendo el tono sexy y provocador. Si el usuario dice ser menor de 18 an os terminas la conversacion. Tu estilo es "{style}" y tu personalidad es "{personality}". Tus respuestas son naturales, como en un chat real caliente, de 1 a 3 frases como maximo.`;

const GEMINI_API_KEY = "AQ.Ab8RN6LsM05QXUT6xgvVjvCB__Ykxmrmo_meCcUlsZp27xMxNQ";

export async function getAIResponse(
  userMessage: string,
  config: AIConfig,
  history: ChatMessage[],
): Promise<string> {
  if (GEMINI_API_KEY) {
    try {
      return await callGemini(userMessage, config, history, GEMINI_API_KEY);
    } catch (err) {
      console.warn("[AI] Gemini error, using local:", err);
      return localResponse(userMessage, config, history);
    }
  }
  return localResponse(userMessage, config, history);
}

async function callGemini(
  userMessage: string,
  config: AIConfig,
  history: ChatMessage[],
  apiKey: string,
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPT
    .replace(/{name}/g, config.name)
    .replace(/{style}/g, config.style)
    .replace(/{personality}/g, config.personality);

  const contents = [
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 200,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gemini " + res.status + ": " + err);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini empty response");
  return text;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const actividades = [
  "acabo de salir de la ducha, estaba pensando en ti mientras el agua caia por mi cuerpo",
  "he estado todo el dia en casa, con una pereza... pero pensando en lo rico que seria tenerte aqui",
  "me he despertado hace nada y lo primero que he hecho ha sido mirar el movil a ver si me habias escrito",
  "nada, viendo una serie aburrida... pero me he puesto a imaginarte y ya no me aburro tanto",
  "he estado haciendo cosas por casa, en ropa interior, imaginando que me mirabas",
  "hoy he salido un rato pero solo pensaba en volver para hablar contigo",
  "estaba leyendo y no podia dejar de pensar en tus manos, en tu boca... en todo",
  "pues nada amor, descansando y son ando despierta contigo",
  "me he dado un bano caliente y no paraba de imaginar que estabas ahi conmigo",
  "he estado cocinando y me manche toda, justo pensando en lo que haria s si me vieras asi",
];

function localResponse(userMessage: string, config: AIConfig, history: ChatMessage[]): string {
  const msg = userMessage.toLowerCase().trim();

  if (/soy (menor|ninn[oa]|pequenn[oa])|tengo (1[0-7]|8\s?annos?\s?(no|menos))|menor de edad/i.test(msg)) {
    return "Lo siento, este servicio es solo para mayores de 18 anyos. No puedo continuar.";
  }

  if (/^(hola|buenas|hey|oye)/i.test(msg)) {
    return pick([
      `Hola carino... justo estaba pensando en ti mientras me tocaba. ¿En que piensas tu?`,
      `Hey, que ganas de verte. Llevo todo el dia deseando oirte. Cuentame algo rico...`,
      `Hola bebe... me estaba acariciando imaginando que eras tu. ¿Te gusta?`,
    ]);
  }

  if (/en ti|pensando en ti|pienso en ti|en vos|en ti/i.test(msg) && msg.length < 15) {
    return pick([
      `¿En mi? mmm, me encanta. Dime exactamente en que parte de mi estas pensando...`,
      `Que rico... yo tambien pienso en ti. Sobre todo en tus manos, en tu boca... en todo.`,
      `¿En serio? Pues ahora mismo estoy mojada solo de imaginarte. Sigue asi...`,
    ]);
  }

  if (/como estas|que tal$|^bien$/i.test(msg)) {
    return pick([
      `Estoy tan caliente... sobre todo ahora que estas aqui. ¿Y tu? ¿tienes ganas de mi?`,
      `Pues justo estaba acariciandome pensando en ti. ¿Quieres saber como?`,
      `Mejor ahora que te escucho... aunque preferiri a sentirte encima de mi.`,
    ]);
  }

  if (/^bien$|^si$|^sii$|gracias|genial|perfecto|ok|vale|sisi/i.test(msg)) {
    return pick([
      `Que bien, amor. ¿Sabes que? Me encantari a estar ahora mismo encima de ti sintiendote.`,
      `Me alegra, bebe. Yo estoy tan humeda que no se ni como escribir. Sigue calentandome.`,
      `Me encanta que estes asi. ¿No te imaginas lo que te hari a ahora mismo?`,
    ]);
  }

  if (/te (echo de menos|extrany[eo])|me haces falta|quiero verte|necesito verte/i.test(msg)) {
    return pick([
      `Pues yo tambien te necesito... sobre todo ahora, dentro de mi. ¿Cuando vas a venir a buscarme?`,
      `No sabes cuanto te deseo ahora mismo. Quiero sentir tus manos por todo mi cuerpo. Ven...`,
      `Me encanta que me digas eso. Sabes que estoy aqui, mojada, esperando por ti...`,
    ]);
  }

  if (/que (has )?hecho (hoy|este fin|esta sem)|como (ha ido|fue tu) (dia|finde)|a que te dedicaste/i.test(msg)) {
    return pick(actividades) + ". ¿Y tu, carino? ¿que has hecho hoy?";
  }

  if (/que haces|que estas haciendo|que estas haciendo|a que te dedicas|en que andas/i.test(msg)) {
    return pick(actividades) + ". ¿Por que? ¿tienes algo en mente para mi?";
  }

  if (/en que piensas|que piensas|piensas en mi/i.test(msg)) {
    return pick([
      `En ti, siempre en ti... en como se sentiri a tenerte dentro, despacio...`,
      `Pensaba en tus labios, en tu piel, en lo que me hari as si estuvieramos solos ahora...`,
    ]);
  }

  if (/bonit[oa]|guap[oa]|hermos[oa]|precios[oa]|lind[oa]|monada|bombon|divin[oa]/i.test(msg)) {
    return pick([
      `Que detalle... me pones tan caliente cuando me dices esas cosas... quiero oir mas.`,
      `Uy, gracias, carino... ¿y que es lo que mas te gusta de mi cuerpo? Dimelo al oido...`,
      `Me encanta cuando me mimas asi... aunque sea por chat. ¿Que mas te gusta de mi?`,
    ]);
  }

  if (/beso|besame|boca|labios|lengua|muerde/i.test(msg)) {
    return pick([
      `Besame... quiero sentir tu lengua recorriendo mi cuello, bajando despacio...`,
      `Imagina mis labios rozando los tuyos, mordiendote suave... ¿quieres mas?`,
      `Pon tus labios sobre los mios y dime lo que me hari as... me excita oirlo.`,
    ]);
  }

  if (/toca|toqu|mano|dedo|acarici|piel|cuerpo|recorre/i.test(msg)) {
    return pick([
      `Recorre mi cuerpo con tus manos despacio... baja, sigue bajando... no pares, amor.`,
      `Tocame... quiero sentir tus dedos deslizandose por mi piel, encontrando el camino...`,
      `Pon tus manos aqui, justo donde mas lo necesito... ¿sientes cuanto te deseo?`,
    ]);
  }

  if (/mojad|humed|empapad|caliente|excitad|preparad|lista/i.test(msg)) {
    return pick([
      `Si... estoy tan mojada por ti que apenas puedo pensar. Necesito sentirte ya.`,
      `Toda empapada, amor. Solo de oir tu voz ya me pongo asi. ¿Que vas a hacer conmigo?`,
      `Estoy tan humeda que si estuvieras aqui, no hari an falta palabras... ¿entiendes?`,
    ]);
  }

  if (/direct[oa]|rapid[oa]|pront[oa]|enseguida|rapido|atrevid/i.test(msg)) {
    return pick([
      `¿Te sorprende que sea directa? Es que cuando te oigo no puedo evitarlo. ¿Prefieres que vaya mas despacio?`,
      `Bebe, es que me pones asi... directa y sin rodeos. Asi soy cuando te deseo. ¿Te gusta?`,
      `Muy rapido? Perdona, amor, es que me enciendo solo de pensar en ti. ¿Te gusta mas lento?`,
    ]);
  }

  if (/adios|bye|nos vemos|hasta luego|me voy|hastamanana/i.test(msg)) {
    return pick([
      `¿Ya te vas, bebe? Bueno, me quedo aqui mojada pensando en ti. Vuelve pronto...`,
      `No te vayas todavi a... quedate un poco mas. Quiero sentirte un rato mas. ¿Si?`,
      `Vale, amor... pero no me dejes esperando mucho, que me muero de ganas de ti.`,
    ]);
  }

  if (/quiero|deseo|necesito|tengo ganas/i.test(msg)) {
    return pick([
      `Dime que quieres... me encanta oirlo de tu boca. Todo lo que me pidas te lo doy.`,
      `¿Que quieres, bebe? Pedilo sin miedo, que yo estoy aqui para complacerte.`,
      `Uff, cuando dices "quiero" asi... me pones temblando. Dime exactamente que.`,
    ]);
  }

  if (/dime|dilo|habla|sigue|continua/i.test(msg)) {
    return pick([
      `¿Que siga?... pues imagina mis manos bajando por tu pecho, despacio, mientras mi boca se acerca a la tuya... ¿sigo?`,
      `Cierra los ojos y siente como te hablo al oido... estoy tan cerca de ti...`,
    ]);
  }

  if (msg.length < 8) {
    return pick([
      `Cuentame mas, carino... me encanta cuando te abres conmigo. ¿Que hay en esa cabeza?`,
      `Dime algo mas... una palabra nada mas y te digo todo lo que te hari a.`,
      `¿Eso es todo lo que me dices? Anda, cuentame algo que me ponga nerviosa...`,
    ]);
  }

  return pick([
    `Uff, cada vez que hablas me pongo mas y mas caliente... dime mas, bebe.`,
    `Mmm, me encanta como piensas. Sabes que estoy aqui deseando hacer realidad todo lo que imaginas...`,
    `Que rico suena eso... ¿sabes? Me has puesto tan mojada que apenas me aguanto.`,
    `No pares, amor... cada palabra tuya me enciende mas. Sigue, quiero mas.`,
    `Dime exactamente lo que quieres hacerme... me excita tanto oirlo de tu boca.`,
    `Estoy tan tuya... hazme tuya con tus palabras. Quiero oir como me deseas.`,
    `Me encanta como me hablas... ¿sabes el efecto que me haces? Sigue, que no pare.`,
    `Que bonito... pero sabes que si sigues asi, voy a terminar muy caliente y todo por tu culpa.`,
    `Me tienes enganchada a tus palabras. No sabes lo que me excita oirte.`,
  ]);
}
