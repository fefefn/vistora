import api from './api'

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

interface MeResponse {
  success: boolean
  data: {
    userId: string
    role: 'customer' | 'admin'
  }
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

const TOKEN_KEY = 'vistora_token'
const USER_KEY = 'vistora_user'

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/register',
    input,
  )

  const result = response.data

  if (result.success && result.data?.token) {
    localStorage.setItem(TOKEN_KEY, result.data.token)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(result.data.user),
    )
  }

  return result
}

export const loginUser = async (
  input: LoginInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    input,
  )

  const result = response.data

  if (result.success && result.data?.token) {
    localStorage.setItem(TOKEN_KEY, result.data.token)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(result.data.user),
    )
  }

  return result
}

export const getCurrentUser = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>('/auth/me')

  return response.data
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY)

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user) as User
  } catch {
    return null
  }
}

export const logoutUser = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
