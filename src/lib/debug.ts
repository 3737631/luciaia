export function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("lunacall_debug") === "1";
  } catch {
    return false;
  }
}

export function sessionShortId(id: string): string {
  return id.length > 5 ? id.slice(-5) : id;
}