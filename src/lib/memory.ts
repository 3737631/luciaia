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

export function appendToConversation(girlId: string, msgs: ChatMessage[]): void {
  if (typeof window === "undefined" || msgs.length === 0) return;
  const prev = getConversationHistory(girlId);
  saveConversationHistory(girlId, [...prev, ...msgs].slice(-60));
}

export function getConversationSummary(girlId: string): string {
  return load(girlId, "summary", "");
}

export function saveConversationSummary(girlId: string, summary: string): void {
  save(girlId, "summary", summary);
}

export function getSavedMode(girlId: string): "text" | "actions" | null {
  return load(girlId, "mode", null);
}

export function saveMode(girlId: string, mode: "text" | "actions"): void {
  save(girlId, "mode", mode);
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
    const last = messages[messages.length - 1];
    const preview = last ? (last.role === "user" ? "Tú: " : "") + last.content.slice(0, 80) : "Conversación";
    // Una sola entrada por chica: si ya existe, se actualiza en vez de duplicarla.
    const existing = list.find((e) => e.girlId === girlId);
    if (existing) {
      existing.girlName = girlName;
      existing.timestamp = Date.now();
      existing.preview = preview;
      existing.messages = messages.slice(-40);
      localStorage.setItem(historyKey(), JSON.stringify(list.slice(0, 50)));
      return;
    }
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

/**
 * Borra PARA SIEMPRE todo lo relacionado con una chica:
 * conversación, resumen, memoria, modo, sus entradas del historial global
 * y sus notificaciones pendientes. Así, al reiniciar, nada vuelve a aparecer.
 */
export function clearGirlData(girlId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(girlId, "history"));
    localStorage.removeItem(storageKey(girlId, "summary"));
    localStorage.removeItem(storageKey(girlId, "memory"));
    localStorage.removeItem(storageKey(girlId, "mode"));
    const raw = localStorage.getItem(historyKey());
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const filtered = list.filter((e: HistoryEntry) => e.girlId !== girlId);
        if (filtered.length > 0) localStorage.setItem(historyKey(), JSON.stringify(filtered));
        else localStorage.removeItem(historyKey());
      }
    }
    clearUnreadReply(girlId);
  } catch {}
}

export function clearAllMemory(girlId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(girlId, "history"));
  localStorage.removeItem(storageKey(girlId, "summary"));
  localStorage.removeItem(storageKey(girlId, "memory"));
}

export interface UnreadReply {
  id: string;
  girlId: string;
  reply: string;
  sent: string;
  name: string;
  img: string;
  ts: number;
}

const UNREAD_KEY = "lunacall_unread_replies";
const UNREAD_EVENT = "lunacall-unread-change";

function notifyUnreadChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(UNREAD_EVENT));
}

export function getUnreadReplies(): UnreadReply[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UNREAD_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasUnreadReplies(): boolean {
  return getUnreadReplies().length > 0;
}

export function markUnreadReply(girlId: string, data: Omit<UnreadReply, "id" | "girlId" | "ts">): void {
  if (typeof window === "undefined") return;
  try {
    const all = getUnreadReplies();
    const entry: UnreadReply = {
      ...data,
      id: `${girlId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      girlId,
      ts: Date.now(),
    };
    localStorage.setItem(UNREAD_KEY, JSON.stringify([entry, ...all].slice(0, 30)));
    notifyUnreadChange();
  } catch {}
}

export function clearUnreadReply(girlId: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getUnreadReplies().filter((u) => u.girlId !== girlId);
    localStorage.setItem(UNREAD_KEY, JSON.stringify(all));
    notifyUnreadChange();
  } catch {}
}

export function clearAllUnreadReplies(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(UNREAD_KEY);
    notifyUnreadChange();
  } catch {}
}

export function onUnreadChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(UNREAD_EVENT, cb);
  return () => window.removeEventListener(UNREAD_EVENT, cb);
}

const PIN_KEY = "lunacall_pinned_girls";

export function getPinnedGirls(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PIN_KEY);
    const p = raw ? JSON.parse(raw) : [];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function isGirlPinned(girlId: string): boolean {
  return getPinnedGirls().includes(girlId);
}

export function togglePinGirl(girlId: string): void {
  if (typeof window === "undefined") return;
  try {
    const cur = getPinnedGirls();
    const next = cur.includes(girlId) ? cur.filter((id) => id !== girlId) : [...cur, girlId];
    localStorage.setItem(PIN_KEY, JSON.stringify(next));
  } catch {}
}
