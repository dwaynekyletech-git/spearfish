import { createClient } from '@supabase/supabase-js'

// Anon client for public operations (no auth required)
export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  return createClient(url, anon)
}

// Service role client for admin operations (server-side only!)
// WARNING: Never use this in frontend code - only for backend/edge functions
export function getSupabaseServiceClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) throw new Error('Missing Supabase service role key')
  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
