"use client";

const STORAGE_KEY = "storySeen";

function getStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function setStored(ids: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
}

export function getSeenStories(): Set<string> {
  return new Set(getStored());
}

export function markStorySeen(id: string) {
  const ids = getStored();
  if (!ids.includes(id)) {
    ids.push(id);
    setStored(ids);
  }
}
