"use client";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function hasAgeAccepted(): boolean {
  if (!isBrowser()) return false;
  return sessionStorage.getItem("lunacall_age_accepted") === "true";
}

export function setAgeAccepted() {
  if (!isBrowser()) return;
  sessionStorage.setItem("lunacall_age_accepted", "true");
}

export interface Customization {
  hair: string;
  background: string;
  pose: string;
  personality: string;
}

export function getCustomization(id: string): Customization | null {
  return readJSON<Customization | null>(`lunacall_custom_${id}`, null);
}

export function saveCustomization(id: string, custom: Customization) {
  writeJSON(`lunacall_custom_${id}`, custom);
}

export interface CustomGirlData {
  id: string;
  name: string;
  age: number;
  story: string;
  description: string;
  girlDesc: string;
  roleplayDesc: string;
  hair: string;
  background: string;
  pose: string;
  personality: string;
  baseId: string;
  imageUrl?: string;
}

export function getCustomGirls(): CustomGirlData[] {
  return readJSON<CustomGirlData[]>("lunacall_custom_girls", []);
}

export function saveCustomGirl(girl: CustomGirlData) {
  const list = getCustomGirls();
  const idx = list.findIndex((g) => g.id === girl.id);
  if (idx >= 0) list[idx] = girl;
  else list.push(girl);
  writeJSON("lunacall_custom_girls", list);
}
