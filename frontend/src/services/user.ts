import { api } from './api'
import type { User } from './auth'

export async function me(): Promise<User & { status?: string; phone?: string | null }> {
  const res = await api.get<User & { status?: string; phone?: string | null }>('/users/me')
  return res.data
}
