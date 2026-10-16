import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from '../components/common/LoadingState'
import ForbiddenPage from '../pages/ForbiddenPage'

/**
 * Guards admin-only routes using the role held in AuthContext.
 * Signed-out users go to /login; signed-in non-admins see a 403 page.
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <LoadingState label="Checking your session…" fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (!isAdmin) return <ForbiddenPage />

  return <Outlet />
}
