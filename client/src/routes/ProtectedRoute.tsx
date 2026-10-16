import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from '../components/common/LoadingState'

/**
 * Renders child routes only for signed-in users; everyone else is sent to
 * /login, remembering where they were going so they return there afterwards.
 */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <LoadingState label="Checking your session…" fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
