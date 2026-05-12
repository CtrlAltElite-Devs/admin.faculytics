import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type {
  ErrorLogDetail,
  ErrorLogListResponse,
  ListErrorLogsQuery,
} from '@/types/api'

export function useErrorLogs(query: ListErrorLogsQuery) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  const params = new URLSearchParams()
  if (query.statusCode !== undefined)
    params.set('statusCode', String(query.statusCode))
  if (query.method) params.set('method', query.method)
  if (query.pathSearch) params.set('pathSearch', query.pathSearch)
  if (query.errorName) params.set('errorName', query.errorName)
  if (query.userName) params.set('userName', query.userName)
  if (query.acknowledged !== undefined)
    params.set('acknowledged', String(query.acknowledged))
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  if (query.search) params.set('search', query.search)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))

  const qs = params.toString()

  return useQuery<ErrorLogListResponse>({
    queryKey: ['error-logs', activeEnvId, qs],
    queryFn: () =>
      apiClient<ErrorLogListResponse>(`/error-logs${qs ? `?${qs}` : ''}`),
    enabled: !!activeEnvId && isAuth,
  })
}

export function useErrorLog(id: string | null) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<ErrorLogDetail>({
    queryKey: ['error-log', activeEnvId, id],
    queryFn: () => apiClient<ErrorLogDetail>(`/error-logs/${id}`),
    enabled: !!activeEnvId && isAuth && !!id,
  })
}

export function useAcknowledgeError() {
  const queryClient = useQueryClient()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)

  return useMutation<ErrorLogDetail, Error, { id: string; acknowledge: boolean }>({
    mutationFn: ({ id, acknowledge }) =>
      apiClient<ErrorLogDetail>(
        `/error-logs/${id}/${acknowledge ? 'acknowledge' : 'unacknowledge'}`,
        { method: 'POST' },
      ),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['error-logs', activeEnvId] })
      queryClient.setQueryData(['error-log', activeEnvId, data.id], data)
    },
  })
}
