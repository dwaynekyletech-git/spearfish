// Supabase client and DB helpers for Edge Functions (Deno)
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabase(serviceRole = true): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = serviceRole ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) throw new Error("Missing Supabase URL or API key env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getCacheEntry(supabase: SupabaseClient, userId: string, endpoint: string, inputHash: string) {
  const { data, error } = await supabase
    .from("voltagent_cache")
    .select("payload, ttl_seconds, created_at")
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .eq("input_hash", inputHash)
    .maybeSingle();
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function upsertCacheEntry(supabase: SupabaseClient, userId: string, endpoint: string, inputHash: string, payload: unknown, ttlSeconds: number) {
  const { error } = await supabase
    .from("voltagent_cache")
    .upsert({ user_id: userId, endpoint, input_hash: inputHash, payload, ttl_seconds: ttlSeconds })
    .select()
    .single();
  return { error };
}

export async function logExecution(
  supabase: SupabaseClient,
  userId: string | null,
  agentName: string,
  input: unknown,
  output: unknown,
  success: boolean,
  error?: string
) {
  const { error: err } = await supabase.from("voltagent_executions").insert({
    user_id: userId,
    agent_name: agentName,
    input,
    output,
    success,
    error: error ?? null,
  });
  return { error: err };
}

export async function rateCheck(supabase: SupabaseClient, userId: string, endpoint: string, windowSeconds = 300, capacity = 30) {
  // Simple token bucket stored in a single row
  const now = new Date();
  const { data: row, error } = await supabase
    .from("rate_limits")
    .select("id, tokens, last_refill, window_seconds")
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .maybeSingle();
  if (error) return { allowed: true, remaining: capacity, resetMs: windowSeconds * 1000 };

  const last = row?.last_refill ? new Date(row.last_refill) : new Date(0);
  const elapsed = (now.getTime() - last.getTime()) / 1000;
  const win = row?.window_seconds ?? windowSeconds;
  let tokens = row?.tokens ?? capacity;

  if (elapsed >= win) {
    tokens = capacity - 1;
  } else {
    if (tokens > 0) tokens -= 1;
  }

  const nextReset = elapsed >= win ? win : win - elapsed;

  // upsert row
  const payload = {
    user_id: userId,
    endpoint,
    tokens,
    window_seconds: win,
    last_refill: elapsed >= win ? now.toISOString() : row?.last_refill ?? now.toISOString(),
  } as Record<string, unknown>;

  await supabase.from("rate_limits").upsert(payload, { onConflict: "user_id,endpoint" });

  return { allowed: tokens >= 0, remaining: Math.max(tokens, 0), resetMs: Math.ceil(nextReset * 1000) };
}
