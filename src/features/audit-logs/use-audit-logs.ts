import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { AuditLogDetail, AuditLogListResponse, ListAuditLogsQuery } from '@/types/api'

export function useAuditLogs(query: ListAuditLogsQuery) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  const params = new URLSearchParams()
  if (query.action) params.set('action', query.action)
  if (query.actorId) params.set('actorId', query.actorId)
  if (query.actorUsername) params.set('actorUsername', query.actorUsername)
  if (query.resourceType) params.set('resourceType', query.resourceType)
  if (query.resourceId) params.set('resourceId', query.resourceId)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  if (query.search) params.set('search', query.search)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))

  const qs = params.toString()

  return useQuery<AuditLogListResponse>({
    queryKey: ['audit-logs', activeEnvId, qs],
    queryFn: () =>
      apiClient<AuditLogListResponse>(
        `/audit-logs${qs ? `?${qs}` : ''}`,
      ),
    enabled: !!activeEnvId && isAuth,
  })
}

export function useAuditLog(id: string | null) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<AuditLogDetail>({
    queryKey: ['audit-log', activeEnvId, id],
    queryFn: () => apiClient<AuditLogDetail>(`/audit-logs/${id}`),
    enabled: !!activeEnvId && isAuth && !!id,
  })
}
