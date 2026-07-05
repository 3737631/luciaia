export function getChatEndpoint(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL;
  if (supabaseUrl) return supabaseUrl.replace(/\/+$/, "") + "/chat";
  return "http://localhost:54321/functions/v1/chat";
}
