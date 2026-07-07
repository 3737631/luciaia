export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GirlMemory {
  history: ChatMessage[];
  summary: string;
  memory: string[];
}

function storageKey(girlId: string, type: string): string {
  return `lunacall_${girlId}_${type}`;
}

function load<T>(girlId: string, type: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(storageKey(girlId, type));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(girlId: string, type: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(girlId, type), JSON.stringify(data));
  } catch {}
}

export function getConversationHistory(girlId: string): ChatMessage[] {
  return load(girlId, "history", []);
}

export function saveConversationHistory(girlId: string, history: ChatMessage[]): void {
  save(girlId, "history", history);
}

export function getConversationSummary(girlId: string): string {
  return load(girlId, "summary", "");
}

export function saveConversationSummary(girlId: string, summary: string): void {
  save(girlId, "summary", summary);
}

export function getUserMemory(girlId: string): string[] {
  return load(girlId, "memory", []);
}

export function saveUserMemory(girlId: string, memory: string[]): void {
  save(girlId, "memory", memory);
}

const MEMORY_PATTERNS: { regex: RegExp; extract: (match: string) => string }[] = [
  { regex: /(?:me llamo|soy|mi nombre es) (\w+)/i, extract: (m) => `El usuario se llama ${m}` },
  { regex: /(?:me gusta|disfruto|me encanta|me mola) (\w+)/i, extract: (m) => `Al usuario le gusta ${m}` },
  { regex: /(?:tengo|trabajo en|estudio) (\w+)/i, extract: (m) => `El usuario tiene/estudia/trabaja ${m}` },
  { regex: /(?:vivo en|soy de|resido en) (\w+)/i, extract: (m) => `El usuario es de/vive en ${m}` },
  { regex: /(?:no me gusta|odio|detesto) (\w+)/i, extract: (m) => `Al usuario no le gusta ${m}` },
  { regex: /(?:prefiero|quiero) respuestas (más cortas|cortas|largas|detalladas)/i, extract: (m) => `El usuario prefiere respuestas ${m}` },
  { regex: /(?:prefiero|quiero) (chat|llamada|escribir|hablar)/i, extract: (m) => `El usuario prefiere ${m}` },
  { regex: /música|canción|banda|reggaetón|rock|pop|trap/i, extract: () => "Al usuario le gusta hablar de música" },
  { regex: /deporte|gym|bici|cicli|correr|natación/i, extract: () => "Al usuario le interesa el deporte/ejercicio" },
];

export function extractMemoryFromMessages(messages: ChatMessage[]): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  for (const msg of messages) {
    if (msg.role !== "user") continue;
    for (const pattern of MEMORY_PATTERNS) {
      const match = msg.content.match(pattern.regex);
      if (match) {
        const extracted = pattern.extract(match[1] || "");
        if (!seen.has(extracted)) {
          seen.add(extracted);
          found.push(extracted);
        }
      }
    }
  }

  return found;
}

export function buildSummary(messages: ChatMessage[]): string {
  if (messages.length < 4) return "";

  const userMsgs = messages.filter((m) => m.role === "user").map((m) => m.content);
  const topics: string[] = [];
  const seen = new Set<string>();

  for (const msg of userMsgs) {
    const words = msg.split(" ").slice(0, 8).join(" ");
    if (!seen.has(words) && words.length > 5) {
      seen.add(words);
      topics.push(msg.length > 60 ? msg.slice(0, 60) + "..." : msg);
    }
  }

  const summary = "Conversación reciente: " + topics.slice(-5).join(" | ");
  return summary.length > 300 ? summary.slice(0, 300) + "..." : summary;
}

export interface HistoryEntry {
  id: string;
  girlId: string;
  girlName: string;
  timestamp: number;
  preview: string;
  messages: ChatMessage[];
}

function historyKey(): string {
  return "lunacall_history";
}

export function saveToHistory(girlId: string, girlName: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined" || messages.length < 2) return;
  try {
    const raw = localStorage.getItem(historyKey());
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    const preview = messages
      .filter((m) => m.role === "user")
      .slice(-1)[0]?.content.slice(0, 80) || "Conversación";
    list.unshift({
      id: `${girlId}_${Date.now()}`,
      girlId,
      girlName,
      timestamp: Date.now(),
      preview,
      messages: messages.slice(-40),
    });
    localStorage.setItem(historyKey(), JSON.stringify(list.slice(0, 50)));
  } catch {}
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(historyKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(historyKey());
}

export function clearAllMemory(girlId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(girlId, "history"));
  localStorage.removeItem(storageKey(girlId, "summary"));
  localStorage.removeItem(storageKey(girlId, "memory"));
}
