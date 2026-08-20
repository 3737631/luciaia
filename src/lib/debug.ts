const SHOW_KEY = "lunacall_show_session_ids";
const SHOW_EVENT = "lunacall_show_ids";

export function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("lunacall_debug") === "1" || localStorage.getItem(SHOW_KEY) === "1";
  } catch {
    return false;
  }
}

export function getShowSessionIds(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SHOW_KEY) === "1";
  } catch {
    return false;
  }
}

export function setShowSessionIds(v: boolean): void {
  try {
    if (v) localStorage.setItem(SHOW_KEY, "1");
    else localStorage.removeItem(SHOW_KEY);
  } catch {}
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SHOW_EVENT));
}

export function onShowSessionIdsChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SHOW_EVENT, cb);
  return () => window.removeEventListener(SHOW_EVENT, cb);
}

export function sessionShortId(id: string): string {
  return id.length > 5 ? id.slice(-5) : id;
}