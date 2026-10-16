import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { tokenStorage, UNAUTHORIZED_EVENT } from '../api/client'
import type { AuthResponse, Credentials, RegisterInput, Role, User } from '../types'
import { AuthContext, type AuthContextValue } from './authContext'

/**
 * Owns all authentication state for the app: the signed-in user, their JWT,
 * sign up / sign in / sign out and role checks. Components read it through `useAuth()`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [user, setUser] = useState<User | null>(null)
  // A stored token must be validated with the API before we trust it.
  const [initializing, setInitializing] = useState<boolean>(() => tokenStorage.get() !== null)

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
    setInitializing(false)
  }, [])

  // On first load, exchange a stored token for the current user (or discard it if invalid).
  useEffect(() => {
    if (!initializing) return
    let cancelled = false
    authApi
      .me()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setInitializing(false)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
    return () => {
      cancelled = true
    }
  }, [initializing, logout])

  // Any 401 from the API (expired/revoked token) signs the user out.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const startSession = useCallback((response: AuthResponse) => {
    tokenStorage.set(response.token)
    setToken(response.token)
    setUser(response.user)
    setInitializing(false)
    return response.user
  }, [])

  const login = useCallback(
    async (credentials: Credentials) => startSession(await authApi.login(credentials)),
    [startSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => startSession(await authApi.register(input)),
    [startSession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'admin',
      hasRole: (role: Role) => user?.role === role,
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
