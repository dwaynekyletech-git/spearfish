import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { getSupabaseAuthed } from '@/lib/supabaseClient'
import { toast } from 'sonner'

/**
 * Hook to check if a company is bookmarked by the current user
 */
export function useIsBookmarked(companyId: string) {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: ['bookmark-status', userId, companyId],
    queryFn: async () => {
      if (!userId || !companyId) return false
      
      const supabase = await getSupabaseAuthed()
      const { data, error } = await supabase
        .from('user_saved_companies')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle()

      if (error) throw error
      return !!data
    },
    enabled: !!userId && !!companyId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

/**
 * Hook to manage bookmarking/unbookmarking companies
 */
export function useCompanyBookmark(companyId: string) {
  const { user } = useUser()
  const userId = user?.id
  const queryClient = useQueryClient()
  const { data: isBookmarked, isLoading } = useIsBookmarked(companyId)

  const addBookmark = useMutation({
    mutationFn: async () => {
      if (!userId || !companyId) throw new Error('Missing userId or companyId')
      
      const supabase = await getSupabaseAuthed()
      const { error } = await supabase
        .from('user_saved_companies')
        .insert({
          user_id: userId,
          company_id: companyId,
        })

      if (error) throw error
    },
    onMutate: async () => {
      // Optimistically update the bookmark status
      await queryClient.cancelQueries({ queryKey: ['bookmark-status', userId, companyId] })
      const previousStatus = queryClient.getQueryData(['bookmark-status', userId, companyId])
      queryClient.setQueryData(['bookmark-status', userId, companyId], true)
      return { previousStatus }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(['bookmark-status', userId, companyId], context.previousStatus)
      }
      console.error('Error adding bookmark:', error)
      toast.error('Failed to save company')
    },
    onSuccess: () => {
      // Invalidate saved companies list
      queryClient.invalidateQueries({ queryKey: ['saved-companies', userId] })
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, companyId] })
      toast.success('Company saved!')
    },
  })

  const removeBookmark = useMutation({
    mutationFn: async () => {
      if (!userId || !companyId) throw new Error('Missing userId or companyId')
      
      const supabase = await getSupabaseAuthed()
      const { error } = await supabase
        .from('user_saved_companies')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId)

      if (error) throw error
    },
    onMutate: async () => {
      // Optimistically update the bookmark status
      await queryClient.cancelQueries({ queryKey: ['bookmark-status', userId, companyId] })
      const previousStatus = queryClient.getQueryData(['bookmark-status', userId, companyId])
      queryClient.setQueryData(['bookmark-status', userId, companyId], false)
      return { previousStatus }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(['bookmark-status', userId, companyId], context.previousStatus)
      }
      console.error('Error removing bookmark:', error)
      toast.error('Failed to remove company')
    },
    onSuccess: () => {
      // Invalidate saved companies list
      queryClient.invalidateQueries({ queryKey: ['saved-companies', userId] })
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, companyId] })
      toast.success('Company removed from saved list')
    },
  })

  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark.mutate()
    } else {
      addBookmark.mutate()
    }
  }

  return {
    isBookmarked: !!isBookmarked,
    isLoading: isLoading || addBookmark.isPending || removeBookmark.isPending,
    toggleBookmark,
    addBookmark: addBookmark.mutate,
    removeBookmark: removeBookmark.mutate,
  }
}
