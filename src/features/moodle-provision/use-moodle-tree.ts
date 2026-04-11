import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { MoodleCategoryTreeResponse } from '@/types/api'

export function useMoodleTree() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<MoodleCategoryTreeResponse>({
    queryKey: ['moodle-tree', activeEnvId],
    queryFn: () =>
      apiClient<MoodleCategoryTreeResponse>('/moodle/provision/tree'),
    staleTime: 3 * 60_000,
    enabled: !!activeEnvId && isAuth,
  })
}
