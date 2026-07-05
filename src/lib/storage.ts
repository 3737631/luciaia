"use client";

const CHAT_LIMIT = 5;
const CALL_LIMIT_SECONDS = 180;
const PREMIUM_CODES = ["LUNA6", "PREMIUM2026"];

function isBrowser() {
  return typeof window !== "undefined";
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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

interface UsageRecord {
  date: string;
  used: number;
}

function resetIfNewDayFor(key: string): UsageRecord {
  const today = getTodayKey();
  const record = readJSON<UsageRecord>(key, { date: today, used: 0 });
  if (record.date !== today) {
    const fresh = { date: today, used: 0 };
    writeJSON(key, fresh);
    return fresh;
  }
  return record;
}

export function resetIfNewDay() {
  girlIdsCache.forEach((id) => {
    resetIfNewDayFor(`lunacall_chat_${id}`);
    resetIfNewDayFor(`lunacall_call_${id}`);
  });
}

// Populated lazily by callers; avoids importing girls.ts here to prevent cycles.
let girlIdsCache: string[] = [];
export function registerGirlIds(ids: string[]) {
  girlIdsCache = ids;
}

export function getChatUsage(id: string): { used: number; limit: number } {
  const record = resetIfNewDayFor(`lunacall_chat_${id}`);
  return { used: record.used, limit: CHAT_LIMIT };
}

export function incrementChatUsage(id: string): { used: number; limit: number } {
  const key = `lunacall_chat_${id}`;
  const record = resetIfNewDayFor(key);
  const updated = { date: record.date, used: record.used + 1 };
  writeJSON(key, updated);
  return { used: updated.used, limit: CHAT_LIMIT };
}

export function getCallUsage(id: string): { used: number; limit: number } {
  const record = resetIfNewDayFor(`lunacall_call_${id}`);
  return { used: record.used, limit: CALL_LIMIT_SECONDS };
}

export function incrementCallUsage(
  id: string,
  seconds: number
): { used: number; limit: number } {
  const key = `lunacall_call_${id}`;
  const record = resetIfNewDayFor(key);
  const updated = { date: record.date, used: record.used + seconds };
  writeJSON(key, updated);
  return { used: updated.used, limit: CALL_LIMIT_SECONDS };
}

export function isPremium(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem("lunacall_premium") === "true";
}

export function activatePremium(code: string): boolean {
  if (PREMIUM_CODES.includes(code.trim().toUpperCase())) {
    if (isBrowser()) {
      window.localStorage.setItem("lunacall_premium", "true");
      document.cookie = "lunacall_premium=true; path=/; max-age=31536000";
    }
    return true;
  }
  return false;
}

export function hasAgeAccepted(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem("lunacall_age_accepted") === "true";
}

export function setAgeAccepted() {
  if (!isBrowser()) return;
  window.localStorage.setItem("lunacall_age_accepted", "true");
  document.cookie = "lunacall_age_accepted=true; path=/; max-age=31536000";
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
