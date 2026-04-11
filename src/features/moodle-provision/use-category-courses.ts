import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { MoodleCategoryCoursesResponse } from '@/types/api'

export function useCategoryCourses(categoryId: number | null) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<MoodleCategoryCoursesResponse>({
    queryKey: ['moodle-tree', 'courses', activeEnvId, categoryId],
    queryFn: () =>
      apiClient<MoodleCategoryCoursesResponse>(
        `/moodle/provision/tree/${categoryId}/courses`,
      ),
    staleTime: 3 * 60_000,
    enabled: !!activeEnvId && isAuth && categoryId !== null,
    placeholderData: keepPreviousData,
  })
}
