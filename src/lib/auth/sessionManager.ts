import { useAuth, useSession } from '@clerk/clerk-react'
import { getSupabaseClient } from '@/lib/supabaseClient'

/**
 * Custom hook for managing authenticated sessions with Clerk and Supabase
 */
export function useAuthSession() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const { session } = useSession()

  /**
   * Get JWT token for API requests
   */
  const getJWT = async () => {
    if (!userId) return null
    
    try {
      // Get default token - Clerk+Supabase integration handles JWT configuration
      const token = await getToken()
      return token
    } catch (error) {
      console.error('Error getting JWT token:', error)
      return null
    }
  }

  /**
   * Initialize Supabase client with Clerk JWT
   * 
   * NOTE: This pattern doesn't work with current Clerk+Supabase integration.
   * Use anon key authentication instead (see src/lib/onboarding.ts for working pattern).
   * Keeping this for reference but it should not be used.
   * 
   * @deprecated Use anon key pattern instead
   */
  const getAuthenticatedSupabase = async () => {
    console.warn('getAuthenticatedSupabase is deprecated - use anon key pattern instead');
    const token = await getJWT()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const supabase = getSupabaseClient()
    
    // Set the JWT token for this request
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '' // Clerk handles refresh
    })

    return supabase
  }

  /**
   * Check if user has completed onboarding
   */
  const checkOnboardingStatus = async () => {
    if (!userId) return false

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('job_title, skills, career_interests')
      .eq('user_id', userId)
      .single()

    if (error || !data) return false
    
    // Check if required fields are filled
    return !!(data.job_title && data.skills?.length && data.career_interests?.length)
  }

  /**
   * Get current user's profile
   */
  const getUserProfile = async () => {
    if (!userId) return null

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  return {
    isLoaded,
    isAuthenticated: !!userId,
    userId,
    sessionId,
    session,
    getJWT,
    getAuthenticatedSupabase,
    checkOnboardingStatus,
    getUserProfile
  }
}

/**
 * Middleware to verify JWT tokens in API routes
 */
export async function verifySession(token: string) {
  // This would be used in your API routes to verify incoming requests
  // The actual implementation depends on your backend setup
  
  try {
    // Verify the token with Clerk's public key
    // This is typically done server-side
    const decoded = await verifyClerkToken(token)
    return {
      valid: true,
      userId: decoded.sub,
      sessionId: decoded.sid,
      claims: decoded
    }
  } catch (error) {
    console.error('Invalid session token:', error)
    return {
      valid: false,
      userId: null,
      sessionId: null,
      claims: null
    }
  }
}

// Placeholder for server-side token verification
// Actual implementation would use @clerk/backend or @clerk/nextjs
async function verifyClerkToken(token: string) {
  // This would use Clerk's JWT verification
  // For now, returning a placeholder
  console.warn('Token verification should be implemented server-side')
  return {
    sub: 'user_id',
    sid: 'session_id',
    exp: Date.now() + 3600000
  }
}