import { useUser, useAuth } from '@clerk/clerk-react'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useCallback } from 'react'
import { setSupabaseToken } from '../supabaseClient'

/**
 * Hook to sync user data between Clerk and Supabase
 * This ensures user profile exists in Supabase when authenticated
 */
export function useUserSync() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  const syncUserToSupabase = useCallback(async () => {
    if (!user) return

    // Get Clerk JWT token for Supabase
    const token = await getToken({ template: 'supabase' })
    
    // Set the token globally for all Supabase queries
    setSupabaseToken(token)
    
    // Create authenticated Supabase client with Clerk's JWT
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      }
    )

    try {
      // Check if user profile exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected for new users
        console.error('Error checking user existence:', fetchError)
        return
      }

      if (!existingUser) {
        // Create new user profile
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            user_id: user.id,
            full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        } else {
          console.log('User profile created in Supabase')
        }
      } else {
        // Update existing user if needed
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
      }
    } catch (error) {
      console.error('User sync error:', error)
    }
  }, [user, getToken])

  useEffect(() => {
    if (isLoaded && user) {
      syncUserToSupabase()
    }
  }, [isLoaded, user, syncUserToSupabase])

  // Ensure token is set whenever user state changes
  useEffect(() => {
    const updateToken = async () => {
      if (user) {
        const token = await getToken({ template: 'supabase' })
        setSupabaseToken(token)
      } else {
        setSupabaseToken(null)
      }
    }
    
    if (isLoaded) {
      updateToken()
    }
  }, [isLoaded, user, getToken])

  return { syncUserToSupabase }
}

/**
 * Service class for user data synchronization (for use in non-React contexts)
 */
export interface ClerkUserData {
  fullName?: string;
  jobTitle?: string | null;
  skills?: string[];
  careerInterests?: string[];
  targetRoles?: string[];
  resumeUrl?: string | null;
}

export type UserProfileUpdate = Partial<{
  full_name: string;
  job_title: string | null;
  skills: string[];
  career_interests: string[];
  target_roles: string[];
  resume_url: string | null;
}> & Record<string, unknown>;

export class UserSyncService {
  private getSupabase(token?: string) {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      token ? {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      } : {}
    )
  }

  /**
   * Ensure user exists in Supabase
   */
  async ensureUserExists(clerkUserId: string, userData?: ClerkUserData, token?: string) {
    const supabase = this.getSupabase(token)
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', clerkUserId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (!existingUser) {
        // Create user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            user_id: clerkUserId,
            full_name: userData?.fullName || '',
            job_title: userData?.jobTitle || null,
            skills: userData?.skills || [],
            career_interests: userData?.careerInterests || [],
            target_roles: userData?.targetRoles || [],
            resume_url: userData?.resumeUrl || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) throw insertError
        return { created: true }
      }

      return { created: false }
    } catch (error) {
      console.error('Error ensuring user exists:', error)
      throw error
    }
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(clerkUserId: string, profileData: UserProfileUpdate, token?: string) {
    const supabase = this.getSupabase(token)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', clerkUserId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Get user profile from Supabase
   */
  async getUserProfile(clerkUserId: string, token?: string) {
    const supabase = this.getSupabase(token)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', clerkUserId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  /**
   * Delete user profile (usually called from webhook on user deletion)
   */
  async deleteUserProfile(clerkUserId: string, token?: string) {
    const supabase = this.getSupabase(token)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', clerkUserId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting user profile:', error)
      throw error
    }
  }
}