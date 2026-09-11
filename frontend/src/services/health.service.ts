import api from '@/services/api'
import type { HealthResponse } from '@/types'

/** Pings the backend health endpoint to confirm the API is reachable. */
export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}
