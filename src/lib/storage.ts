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
    // storage unavailable, fail silently
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
  outfit: string;
  personality: string;
}

export function getCustomization(id: string): Customization | null {
  return readJSON<Customization | null>(`lunacall_custom_${id}`, null);
}

export function saveCustomization(id: string, custom: Customization) {
  writeJSON(`lunacall_custom_${id}`, custom);
}
