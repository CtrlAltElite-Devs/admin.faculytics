import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { FilterOption } from '@/types/api'

export function useProgramsByDepartment(departmentId: string | undefined) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery({
    queryKey: ['filters', 'programs', activeEnvId, { departmentId }],
    queryFn: () =>
      apiClient<FilterOption[]>(
        `/admin/filters/programs?departmentId=${departmentId}`,
      ),
    enabled: !!activeEnvId && isAuth && !!departmentId,
  })
}
