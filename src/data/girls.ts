export type HairOption = "moreno" | "rubio" | "pelirrojo" | "rosa";
export type BackgroundOption = "neon-room" | "beach-night" | "studio" | "car-night";
export type OutfitOption = "elegante" | "casual" | "fiesta" | "bikini-suave";
export type PersonalityOption = "carinosa" | "timida" | "atrevida" | "dominante";

export interface Girl {
  id: string;
  name: string;
  style: string;
  personality: PersonalityOption;
  personalityLabel: string;
  accentColor: string;
  accentColorSecondary: string;
  description: string;
  defaultHair: HairOption;
  defaultBackground: BackgroundOption;
  defaultOutfit: OutfitOption;
  voiceLineExamples: string[];
  image: string;
}

export const girls: Girl[] = [
  {
    id: "luna",
    name: "Luna",
    style: "Coqueta elegante",
    personality: "atrevida",
    personalityLabel: "Cariñosa y atrevida",
    accentColor: "#ff2d95",
    accentColorSecondary: "#8b5cf6",
    description: "Le encanta la conversación cercana y un poco de coqueteo elegante.",
    defaultHair: "moreno",
    defaultBackground: "neon-room",
    defaultOutfit: "elegante",
    voiceLineExamples: [
      "Me gusta que hayas vuelto.",
      "Cuéntame algo de ti.",
      "Me encanta cuando me escribes así.",
    ],
    image: "/girls/luna.jpg",
  },
  {
    id: "nia",
    name: "Nia",
    style: "Gamer",
    personality: "atrevida",
    personalityLabel: "Divertida y directa",
    accentColor: "#38bdf8",
    accentColorSecondary: "#8b5cf6",
    description: "Directa, competitiva y con un sentido del humor muy suyo.",
    defaultHair: "rosa",
    defaultBackground: "neon-room",
    defaultOutfit: "casual",
    voiceLineExamples: [
      "Has entrado rápido… eso me gusta.",
      "Me gusta tu energía.",
      "¿Jugamos o hablamos primero?",
    ],
    image: "/girls/nia.jpg",
  },
  {
    id: "vera",
    name: "Vera",
    style: "Misteriosa",
    personality: "dominante",
    personalityLabel: "Intensa y tranquila",
    accentColor: "#8b5cf6",
    accentColorSecondary: "#38bdf8",
    description: "Habla poco, pero cada frase pesa. Le gusta llevar la conversación.",
    defaultHair: "pelirrojo",
    defaultBackground: "studio",
    defaultOutfit: "elegante",
    voiceLineExamples: [
      "Relájate, yo llevo la conversación.",
      "Me gusta cuando prestas atención.",
      "Hoy vas a hacerme caso, ¿no?",
    ],
    image: "/girls/vera.jpg",
  },
  {
    id: "alma",
    name: "Alma",
    style: "Latina elegante",
    personality: "carinosa",
    personalityLabel: "Cercana y dulce",
    accentColor: "#ff7a45",
    accentColorSecondary: "#ff2d95",
    description: "Cálida y cercana, siempre pendiente de cómo estás de verdad.",
    defaultHair: "moreno",
    defaultBackground: "beach-night",
    defaultOutfit: "casual",
    voiceLineExamples: [
      "Me gusta que hayas vuelto.",
      "Cuéntame algo de ti, quiero conocerte mejor.",
      "Me encanta cuando me escribes así.",
    ],
    image: "/girls/alma.jpg",
  },
  {
    id: "kira",
    name: "Kira",
    style: "Futurista",
    personality: "dominante",
    personalityLabel: "Dominante suave",
    accentColor: "#a78bfa",
    accentColorSecondary: "#38bdf8",
    description: "Segura de sí misma, con un estilo directo pero siempre suave.",
    defaultHair: "rosa",
    defaultBackground: "studio",
    defaultOutfit: "fiesta",
    voiceLineExamples: [
      "Hoy vas a hacerme caso, ¿no?",
      "Relájate, yo llevo la conversación.",
      "Me gusta cuando prestas atención.",
    ],
    image: "/girls/kira.jpg",
  },
  {
    id: "maya",
    name: "Maya",
    style: "Influencer ficticia",
    personality: "atrevida",
    personalityLabel: "Juguetona y segura",
    accentColor: "#ec4899",
    accentColorSecondary: "#f472b6",
    description: "Juguetona, con mucha confianza y siempre con ganas de charlar.",
    defaultHair: "rubio",
    defaultBackground: "car-night",
    defaultOutfit: "fiesta",
    voiceLineExamples: [
      "Has entrado rápido… eso me gusta.",
      "Podemos hablar un rato, pero no te me pongas nervioso.",
      "Me gusta tu energía.",
    ],
    image: "/girls/maya.jpg",
  },
];

export function getGirlById(id: string): Girl | undefined {
  return girls.find((g) => g.id === id);
}

export const personalityDescriptions: Record<string, string> = {
  carinosa: "Cariñosa y cercana, siempre pendiente de ti.",
  atrevida: "Atrevida y con chispa, te mantendrá enganchado.",
  timida: "Tímida pero dulce, se abre poco a poco contigo.",
  dominante: "Segura y directa, le gusta llevar la conversación.",
};

export const minorBlockMessage =
  "Este servicio es solo para mayores de 18 años. La conversación se ha bloqueado.";
