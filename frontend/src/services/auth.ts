import { api } from './api'

export type RoleCode = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type User = {
  id: number
  email: string
  role: RoleCode
  firstName?: string | null
  lastName?: string | null
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: User
}

export async function login(params: { email: string; password: string }): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', params)
  return res.data
}

export async function refreshTokens(params: {
  refreshToken: string
}): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', params)
  return res.data
}
