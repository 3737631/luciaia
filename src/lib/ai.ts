export function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();

  if (/soy (menor|niñ[oa]|pequeñ[oa])|tengo (1[0-7]|8\s?años?\s?(no|menos))|menor/i.test(msg)) {
    return "Lo siento, este servicio es solo para mayores de 18 años. No puedo continuar.";
  }

  const responses = [
    `No puedo responderte ahora, el servicio de IA no está disponible. Intenta de nuevo más tarde.`,
    `Lo siento, ahora mismo no puedo procesar tu mensaje. El servicio de IA está desconectado.`,
    `Parece que el servicio de IA no responde. Vuelve a intentarlo en un momento.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
