import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * useRealtimeRefresh
 * Polls the database at a specific interval to keep tournament data fresh.
 * Essential for countdown timers and status transitions (Upcoming -> Live).
 */
export function useRealtimeRefresh(intervalMs: number = 30000) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const interval = setInterval(() => {
      // Invalidate all tournament-related queries to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: ['series-tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['royal-tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournament-details'] })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [queryClient, intervalMs])
}
