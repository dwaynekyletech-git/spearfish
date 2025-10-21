// Supabase client and DB helpers for Edge Functions (Deno)
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabase(serviceRole = true): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = serviceRole ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("Missing Supabase URL or API key env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}
