import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { FilterOption, UserRole } from '@/types/api'

function useAuth() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )
  return { activeEnvId, isAuth }
}

export function useCampuses() {
  const { activeEnvId, isAuth } = useAuth()
  return useQuery<FilterOption[]>({
    queryKey: ['admin-filters', 'campuses', activeEnvId],
    queryFn: () => apiClient<FilterOption[]>('/admin/filters/campuses'),
    enabled: !!activeEnvId && isAuth,
    staleTime: 5 * 60_000,
  })
}

export function useDepartments(campusId?: string) {
  const { activeEnvId, isAuth } = useAuth()
  const qs = campusId ? `?campusId=${campusId}` : ''
  return useQuery<FilterOption[]>({
    queryKey: ['admin-filters', 'departments', activeEnvId, campusId],
    queryFn: () => apiClient<FilterOption[]>(`/admin/filters/departments${qs}`),
    enabled: !!activeEnvId && isAuth,
    staleTime: 5 * 60_000,
  })
}

export function usePrograms(departmentId?: string) {
  const { activeEnvId, isAuth } = useAuth()
  const qs = departmentId ? `?departmentId=${departmentId}` : ''
  return useQuery<FilterOption[]>({
    queryKey: ['admin-filters', 'programs', activeEnvId, departmentId],
    queryFn: () => apiClient<FilterOption[]>(`/admin/filters/programs${qs}`),
    enabled: !!activeEnvId && isAuth,
    staleTime: 5 * 60_000,
  })
}

export function useRoles() {
  const { activeEnvId, isAuth } = useAuth()
  return useQuery<{ roles: UserRole[] }>({
    queryKey: ['admin-filters', 'roles', activeEnvId],
    queryFn: () => apiClient<{ roles: UserRole[] }>('/admin/filters/roles'),
    enabled: !!activeEnvId && isAuth,
    staleTime: 5 * 60_000,
  })
}
