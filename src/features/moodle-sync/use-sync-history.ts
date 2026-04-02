import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSyncStatus } from './use-sync-status'
import type { SyncHistoryResponse } from '@/types/api'

export function useSyncHistory(page: number = 1, limit: number = 10) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )
  const { data: statusData } = useSyncStatus()
  const syncBusy =
    statusData?.state === 'active' || statusData?.state === 'queued'

  return useQuery<SyncHistoryResponse>({
    queryKey: ['sync-history', activeEnvId, page, limit],
    queryFn: () =>
      apiClient<SyncHistoryResponse>(
        `/moodle/sync/history?page=${page}&limit=${limit}`,
      ),
    enabled: !!activeEnvId && isAuth,
    refetchInterval: syncBusy ? 5_000 : 30_000,
  })
}
