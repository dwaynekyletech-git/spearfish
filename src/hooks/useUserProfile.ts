import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { getSupabaseClient } from '@/lib/supabaseClient'

export interface UserProfile {
  user_id: string
  full_name?: string
  job_title?: string
  skills?: string[]
  career_interests?: string[]
  target_roles?: string[]
  resume_url?: string
  created_at: string
  updated_at: string
}

export interface UserProfileUpdate {
  full_name?: string
  job_title?: string
  skills?: string[]
  career_interests?: string[]
  target_roles?: string[]
  resume_url?: string
}

/**
 * Hook to fetch user profile data from Supabase
 */
export function useUserProfile() {
  const { user } = useUser()
  const userId = user?.id

  return useQuery<UserProfile>({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If user doesn't exist, this might be a new user
        if (error.code === 'PGRST116') {
          throw new Error('User profile not found - please complete onboarding')
        }
        throw error
      }

      return data as UserProfile
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if user profile doesn't exist
      if (error.message.includes('User profile not found')) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to update user profile data in Supabase
 */
export function useUpdateUserProfile() {
  const { user } = useUser()
  const userId = user?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileData: UserProfileUpdate) => {
      if (!userId) throw new Error('User not authenticated')
      
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as UserProfile
    },
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(['user-profile', userId], data)
      
      // Invalidate related queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', userId] })
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error)
    },
  })
}