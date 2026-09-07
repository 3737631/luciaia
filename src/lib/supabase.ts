"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ||
  "https://rebviqktyvzwwqqmvtsi.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlYnZpcWt0eXZ6d3dxcW12dHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyODIyNjUsImV4cCI6MjA5ODg1ODI2NX0.esk2mjcfpLtVrRHBjBUnLs9v2GKVohZN9HciwyxHokg";

export const SUPABASE_FUNCTION_URL =
  process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL?.replace(/\/+$/, "") ||
  `${SUPABASE_URL}/functions/v1`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);