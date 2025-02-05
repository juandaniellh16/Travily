import { useAuth } from '@/hooks/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  /*
  {( canActivate = true,
    redirectPath = '/login')}

  //const { isAuthenticated } = useAuth()
  //const location = useLocation()

  if (!canActivate) {
    return <Navigate to={redirectPath} replace />
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ location }} />
  }*/

  return <Outlet />
}
