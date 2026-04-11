import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { FilterOption } from '@/types/api'

export function useDepartmentsBySemester(semesterId: string | undefined) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery({
    queryKey: ['filters', 'departments', activeEnvId, { semesterId }],
    queryFn: () =>
      apiClient<FilterOption[]>(
        `/admin/filters/departments?semesterId=${semesterId}`,
      ),
    enabled: !!activeEnvId && isAuth && !!semesterId,
  })
}
