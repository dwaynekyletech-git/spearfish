import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

export interface DashboardStats {
  companiesResearched: number
  projectsBuilt: number
  emailsSent: number
  interviewsSecured: number
}

export interface SavedCompany {
  id: string
  name: string
  one_liner: string
  small_logo_thumb_url?: string
  website?: string
}

export interface RecentActivityItem {
  id: string
  action: string
  time: string
  icon: 'search' | 'plus' | 'mail' | 'building'
  timestamp: Date
}

/**
 * Hook to fetch dashboard statistics for the current user
 */
export function useDashboardStats() {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: ['dashboard-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const supabase = getSupabaseClient()

      // Fetch all stats in parallel
      const [
        { count: researchCount, error: researchError },
        { count: projectsCount, error: projectsError },
        { count: emailsCount, error: emailsError },
      ] = await Promise.all([
        supabase.from('company_research').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('outreach_emails').select('*', { count: 'exact', head: true }).eq('user_id', userId).not('sent_at', 'is', null),
      ])

      if (researchError) throw researchError
      if (projectsError) throw projectsError
      if (emailsError) throw emailsError

      const stats: DashboardStats = {
        companiesResearched: researchCount || 0,
        projectsBuilt: projectsCount || 0,
        emailsSent: emailsCount || 0,
        interviewsSecured: 0, // TODO: Add interviews tracking to schema
      }

      return stats
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  })
}

/**
 * Hook to fetch saved/recommended companies
 */
export function useSavedCompanies(limit: number = 4) {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: ['saved-companies', userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('user_saved_companies')
        .select(`
          id,
          created_at,
          companies (
            id,
            name,
            one_liner,
            small_logo_thumb_url,
            website
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Transform the data to match our interface
      const companies: SavedCompany[] = (data || []).map((item: any) => ({
        id: item.companies.id,
        name: item.companies.name,
        one_liner: item.companies.one_liner,
        small_logo_thumb_url: item.companies.small_logo_thumb_url,
        website: item.companies.website,
      }))

      return companies
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  })
}

/**
 * Hook to fetch recent activity across research, projects, and emails
 */
export function useRecentActivity(limit: number = 4) {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: ['recent-activity', userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      
      const supabase = getSupabaseClient()

      // Fetch recent items from each table
      const [
        { data: recentResearch, error: researchError },
        { data: recentProjects, error: projectsError },
        { data: recentEmails, error: emailsError },
      ] = await Promise.all([
        supabase
          .from('company_research')
          .select('id, created_at, companies(name)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('projects')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('outreach_emails')
          .select('id, created_at, companies(name)')
          .eq('user_id', userId)
          .not('sent_at', 'is', null)
          .order('sent_at', { ascending: false })
          .limit(limit),
      ])

      if (researchError) throw researchError
      if (projectsError) throw projectsError
      if (emailsError) throw emailsError

      // Combine and transform activity items
      const activities: RecentActivityItem[] = []

      // Add research activities
      if (recentResearch) {
        activities.push(...recentResearch.map((item: any) => ({
          id: `research-${item.id}`,
          action: `Researched ${item.companies?.name || 'a company'}`,
          time: formatTimeAgo(new Date(item.created_at)),
          icon: 'search' as const,
          timestamp: new Date(item.created_at),
        })))
      }

      // Add project activities
      if (recentProjects) {
        activities.push(...recentProjects.map((item: any) => ({
          id: `project-${item.id}`,
          action: `Added project: ${item.title}`,
          time: formatTimeAgo(new Date(item.created_at)),
          icon: 'plus' as const,
          timestamp: new Date(item.created_at),
        })))
      }

      // Add email activities
      if (recentEmails) {
        activities.push(...recentEmails.map((item: any) => ({
          id: `email-${item.id}`,
          action: `Sent outreach to ${item.companies?.name || 'a company'}`,
          time: formatTimeAgo(new Date(item.created_at)),
          icon: 'mail' as const,
          timestamp: new Date(item.created_at),
        })))
      }

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  })
}

/**
 * Hook to set up real-time subscriptions for dashboard data
 * Automatically invalidates React Query cache when new data arrives
 */
export function useDashboardRealtime() {
  const { user } = useUser()
  const userId = user?.id
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const supabase = getSupabaseClient()

    // Subscribe to company research changes
    const researchChannel = supabase
      .channel('dashboard-research')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_research',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate dashboard stats and recent activity when new research is added
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', userId] })
          queryClient.invalidateQueries({ queryKey: ['recent-activity', userId] })
        }
      )
      .subscribe()

    // Subscribe to projects changes
    const projectsChannel = supabase
      .channel('dashboard-projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', userId] })
          queryClient.invalidateQueries({ queryKey: ['recent-activity', userId] })
        }
      )
      .subscribe()

    // Subscribe to outreach emails changes
    const emailsChannel = supabase
      .channel('dashboard-emails')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outreach_emails',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats', userId] })
          queryClient.invalidateQueries({ queryKey: ['recent-activity', userId] })
        }
      )
      .subscribe()

    // Subscribe to saved companies changes
    const savedChannel = supabase
      .channel('dashboard-saved-companies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_saved_companies',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['saved-companies', userId] })
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(researchChannel)
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(emailsChannel)
      supabase.removeChannel(savedChannel)
    }
  }, [userId, queryClient])
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
