import { useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { SyncState, SyncStatusResponse } from '@/types/api'

export function useSyncStatus() {
  const queryClient = useQueryClient()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )
  const prevState = useRef<SyncState | null>(null)

  return useQuery<SyncStatusResponse>({
    queryKey: ['sync-status', activeEnvId],
    queryFn: async () => {
      const data = await apiClient<SyncStatusResponse>('/moodle/sync/status')

      // When sync transitions from active/queued → idle, refresh history & schedule
      const wasRunning =
        prevState.current === 'active' || prevState.current === 'queued'
      const nowIdle = data.state === 'idle'

      if (wasRunning && nowIdle) {
        const envId = useEnvStore.getState().activeEnvId
        queryClient.invalidateQueries({
          queryKey: ['sync-history', envId],
        })
        queryClient.invalidateQueries({
          queryKey: ['sync-schedule', envId],
        })
      }

      prevState.current = data.state
      return data
    },
    enabled: !!activeEnvId && isAuth,
    refetchInterval: (query) => {
      const state = query.state.data?.state
      if (state === 'active' || state === 'queued') return 3_000
      return 30_000
    },
  })
}
