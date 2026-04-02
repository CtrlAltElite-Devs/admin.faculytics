import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type { SyncScheduleResponse, UpdateSyncScheduleRequest } from '@/types/api'

export function useSyncSchedule() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<SyncScheduleResponse>({
    queryKey: ['sync-schedule', activeEnvId],
    queryFn: () =>
      apiClient<SyncScheduleResponse>('/moodle/sync/schedule'),
    enabled: !!activeEnvId && isAuth,
    refetchInterval: 60_000,
  })
}

export function useUpdateSyncSchedule() {
  const queryClient = useQueryClient()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)

  return useMutation({
    mutationFn: (body: UpdateSyncScheduleRequest) =>
      apiClient<SyncScheduleResponse>('/moodle/sync/schedule', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Sync schedule updated')
      queryClient.invalidateQueries({
        queryKey: ['sync-schedule', activeEnvId],
      })
    },
    onError: () => {
      toast.error('Failed to update schedule')
    },
  })
}
