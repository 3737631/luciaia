"use client";

const MALE_NAMES = new Set([
  "axel", "liam", "kenji", "ryu", "takeshi", "aiden", "ethan", "daniel",
  "adrian", "diego", "santiago", "mateo", "julian", "leonardo", "marco",
  "nico", "omar", "rafael", "sergio", "victor", "alejandro", "carlos",
  "jorge", "manuel", "pablo", "sebastian", "tomas", "ivan", "gabriel",
  "kaito", "haruto", "sota", "ren", "yuto", "hinata", "jun", "seo", "minho",
]);

const FEMALE_NAMES = new Set([
  "luna", "nia", "vera", "alma", "kira", "sasha", "zara", "shadow",
  "morgana", "roxy", "athena", "eva", "cora", "mira", "yumi", "raven",
  "sky", "jade", "gemma", "nova", "lena", "maya", "iris", "yuki", "akane",
  "hina", "sakura", "aoi", "misaki", "natsumi", "rinko", "yuna", "yuna",
  "hana", "sora", "ayumi", "emiko", "kaori", "mio", "saya", "seo", "sumi",
]);

export function detectGender(nameOrId: string): "hombre" | "mujer" {
  const n = (nameOrId || "").toLowerCase().trim();
  if (!n) return "mujer";
  if (MALE_NAMES.has(n)) return "hombre";
  if (FEMALE_NAMES.has(n)) return "mujer";
  const lastName = n.split(/[\s_-]+/).pop() || n;
  if (/[aá]$/.test(lastName)) return "mujer";
  if (/[oó]$/.test(lastName)) return "hombre";
  return "mujer";
}