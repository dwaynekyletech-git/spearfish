import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let currentToken: string | null = null

/**
 * Set the Clerk JWT token for Supabase authentication
 * This should be called after Clerk authentication to enable RLS
 */
export function setSupabaseToken(token: string | null) {
  currentToken = token
  // Force recreation of client with new token
  supabaseClient = null
}

/**
 * Get Supabase client for browser use with Clerk authentication
 * 
 * This creates a Supabase client that:
 * - Uses the anon key for initial connection
 * - Uses Clerk JWT tokens (set via setSupabaseToken) for authenticated requests
 * - Works with Row Level Security (RLS) policies that check auth.uid()
 */
export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  
  if (!supabaseClient) {
    if (currentToken) {
      // Create client with auth token
      supabaseClient = createClient(url, anon, {
        global: {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    } else {
      // Create client without auth token (unauthenticated)
      supabaseClient = createClient(url, anon, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    }
  }
  
  return supabaseClient
}

/**
 * Returns a new Supabase client using the current Clerk token from window.Clerk
 * Use inside async functions (e.g., React Query queryFn) to avoid race conditions
 */
export async function getSupabaseAuthed() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing Supabase env: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')

  let token: string | null = null
  try {
    const w = window as unknown as { Clerk?: { session?: { getToken?: (args: { template: string }) => Promise<string> } } }
    const clerk = w.Clerk
    if (clerk && clerk.session && typeof clerk.session.getToken === 'function') {
      token = await clerk.session.getToken({ template: 'supabase' })
    }
  } catch (e) {
    // ignore - unauthenticated contexts may not have Clerk session
  }

  if (token) {
    return createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  }
  // Fallback to default client (may be unauthenticated)
  return getSupabaseClient()
}

// NOTE: Service role operations should be done in Edge Functions (supabase/functions/)
// NOT in browser code. Edge Functions use getSupabase(true) from _shared/db.ts
