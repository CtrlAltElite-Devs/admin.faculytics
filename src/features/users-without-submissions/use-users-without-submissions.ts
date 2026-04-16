import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type {
  AdminNonSubmitterListResponse,
  ListNonSubmittersQuery,
} from '@/types/api'

export function useUsersWithoutSubmissions(query: ListNonSubmittersQuery) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.semesterId) params.set('semesterId', query.semesterId)
  if (query.facultyUsername) params.set('facultyUsername', query.facultyUsername)
  if (query.courseId) params.set('courseId', query.courseId)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))

  const qs = params.toString()

  return useQuery<AdminNonSubmitterListResponse>({
    queryKey: ['admin-users-without-submissions', activeEnvId, qs],
    queryFn: () =>
      apiClient<AdminNonSubmitterListResponse>(
        `/admin/users/without-submissions${qs ? `?${qs}` : ''}`,
      ),
    enabled: !!activeEnvId && isAuth,
  })
}
