import { useCallback } from 'react'
import { useAuth } from './useAuth'

/**
 * Signs the user out. Kept as its own hook so any per-session client state
 * can be cleared in one place alongside the auth context.
 */
export function useSignOut() {
  const { logout } = useAuth()
  return useCallback(() => {
    logout()
  }, [logout])
}
