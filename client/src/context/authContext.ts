import { createContext } from 'react'
import type { Credentials, RegisterInput, Role, User } from '../types'

export interface AuthContextValue {
  user: User | null
  token: string | null
  /** True while a stored token is being validated on first load. */
  initializing: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  hasRole: (role: Role) => boolean
  login: (credentials: Credentials) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
