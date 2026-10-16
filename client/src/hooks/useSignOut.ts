import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAppDispatch } from '../store/hooks'
import { resetFilters } from '../store/filtersSlice'

/**
 * Signs the user out and clears per-session client state (expense filters),
 * so the next person to sign in on this device starts fresh.
 */
export function useSignOut() {
  const { logout } = useAuth()
  const dispatch = useAppDispatch()
  return useCallback(() => {
    dispatch(resetFilters())
    logout()
  }, [dispatch, logout])
}
