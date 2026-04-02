import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { AdminUserDetail } from '@/types/api'

export function useUserDetail(userId: string | undefined) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<AdminUserDetail>({
    queryKey: ['admin-user', activeEnvId, userId],
    queryFn: () => apiClient<AdminUserDetail>(`/admin/users/${userId}`),
    enabled: !!activeEnvId && isAuth && !!userId,
  })
}
