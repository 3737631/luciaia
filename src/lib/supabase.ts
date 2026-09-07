"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ||
  "https://grfajwttfddwbtxhwikf.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZmFqd3R0ZmRkd2J0eGh3aWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NzQwMTcsImV4cCI6MjEwNDM1MDAxN30.ztKXsQv7esJyv3sFN5ZoQWQle-hSpgUxwmrSQCksPQw";

export const SUPABASE_FUNCTION_URL =
  process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
  `${SUPABASE_URL}/functions/v1`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);