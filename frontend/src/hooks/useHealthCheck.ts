import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/services/health.service'

/**
 * React Query hook that reports whether the backend API is up.
 * Demonstrates the Axios + TanStack Query data-fetching flow end to end.
 */
export const useHealthCheck = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
  })
