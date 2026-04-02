import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { AdminUserListResponse, ListUsersQuery } from '@/types/api'

export function useAdminUsers(query: ListUsersQuery) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.role) params.set('role', query.role)
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive))
  if (query.campusId) params.set('campusId', query.campusId)
  if (query.departmentId) params.set('departmentId', query.departmentId)
  if (query.programId) params.set('programId', query.programId)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))

  const qs = params.toString()

  return useQuery<AdminUserListResponse>({
    queryKey: ['admin-users', activeEnvId, qs],
    queryFn: () =>
      apiClient<AdminUserListResponse>(
        `/admin/users${qs ? `?${qs}` : ''}`,
      ),
    enabled: !!activeEnvId && isAuth,
  })
}
