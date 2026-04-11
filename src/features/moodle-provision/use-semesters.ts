import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { SemesterFilterOption } from '@/types/api'

export function useSemesters() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery({
    queryKey: ['filters', 'semesters', activeEnvId],
    queryFn: () =>
      apiClient<SemesterFilterOption[]>('/admin/filters/semesters'),
    enabled: !!activeEnvId && isAuth,
  })
}
