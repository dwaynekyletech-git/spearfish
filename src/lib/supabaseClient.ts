import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase client for browser use
 * 
 * This uses the anon key which:
 * - Allows public access to your Supabase project
 * - Can call Edge Functions that use service role internally
 * - Subject to Row Level Security (RLS) policies
 * 
 * For authenticated operations, pass Clerk userId to your Edge Functions
 * and use service role internally (see supabase/functions/*)
 */
export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  return createClient(url, anon)
}

// NOTE: Service role operations should be done in Edge Functions (supabase/functions/)
// NOT in browser code. Edge Functions use getSupabase(true) from _shared/db.ts
