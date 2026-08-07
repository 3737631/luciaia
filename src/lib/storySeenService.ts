"use client";

const STORAGE_KEY = "storySeen";

type SeenRecord = Record<string, string>;

function getStored(): SeenRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (Array.isArray(raw)) {
      const rec: SeenRecord = {};
      raw.forEach((id) => { if (typeof id === "string") rec[id] = ""; });
      return rec;
    }
    if (raw && typeof raw === "object") return raw as SeenRecord;
    return {};
  } catch { return {}; }
}

function setStored(rec: SeenRecord) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rec)); } catch {}
}

export function getSeenStories(): SeenRecord {
  return getStored();
}

export function markStorySeen(id: string, signature: string) {
  const rec = getStored();
  rec[id] = signature;
  setStored(rec);
}
