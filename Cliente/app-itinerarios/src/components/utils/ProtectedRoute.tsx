import { useAuth } from '@/hooks/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} />
  }

  return <Outlet />
}
