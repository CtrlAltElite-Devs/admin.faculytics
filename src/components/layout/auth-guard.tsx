import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useEnvStore } from '@/stores/env-store'

export function AuthGuard() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuthenticated = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  if (!activeEnvId) {
    return <Navigate to="/settings" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
