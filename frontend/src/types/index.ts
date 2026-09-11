/** Standard shape every NexCart API endpoint responds with. */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

/** Response returned by GET /api/health. */
export interface HealthResponse {
  success: boolean
  message: string
}

/** A single navigation entry used by the navbar. */
export interface NavItem {
  label: string
  path: string
}
