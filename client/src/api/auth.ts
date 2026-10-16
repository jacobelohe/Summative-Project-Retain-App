import { api } from './client'
import type { AuthResponse, Credentials, RegisterInput, User } from '../types'

export const authApi = {
  login: async (credentials: Credentials) => (await api.post<AuthResponse>('/auth/login', credentials)).data,
  register: async (input: RegisterInput) => (await api.post<AuthResponse>('/auth/register', input)).data,
  me: async () => (await api.get<{ user: User }>('/auth/me')).data.user,
}
