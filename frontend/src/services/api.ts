import axios from 'axios'
import { API_URL } from '@/utils/constants'

/**
 * Central Axios client. Every request in the app goes through this instance,
 * so base URL, headers, timeouts and (later) auth tokens live in one place.
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// Response interceptor — a hook for global error handling later (auth refresh, toasts, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api
