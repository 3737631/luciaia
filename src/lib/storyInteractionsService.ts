"use client";

export interface StoryInteraction {
  id: string;
  storyId: string;
  creatorId: string;
  creatorName: string;
  type: "message" | "reaction";
  content: string;
  createdAt: string;
}

const STORAGE_KEY = "storyInteractions";

function getStored(): StoryInteraction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function setStored(data: StoryInteraction[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function saveInteraction(
  storyId: string,
  creatorName: string,
  type: "message" | "reaction",
  content: string,
): StoryInteraction {
  const entry: StoryInteraction = {
    id: crypto.randomUUID(),
    storyId,
    creatorId: "iris",
    creatorName,
    type,
    content,
    createdAt: new Date().toISOString(),
  };
  const all = getStored();
  all.push(entry);
  setStored(all);
  return entry;
}

export function getInteractions(): StoryInteraction[] {
  return getStored();
}
