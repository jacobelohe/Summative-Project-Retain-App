import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from '../components/common/LoadingState'

/** Sign-in / sign-up pages: already signed-in users are sent to their dashboard. */
export function GuestRoute() {
  const { isAuthenticated, isAdmin, initializing } = useAuth()

  if (initializing) return <LoadingState label="Checking your session…" fullScreen />
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />

  return <Outlet />
}
