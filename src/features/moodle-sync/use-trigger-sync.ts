import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import type { TriggerSyncResponse } from '@/types/api'

export function useTriggerSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient<TriggerSyncResponse>('/moodle/sync', { method: 'POST' }),
    onSuccess: (data) => {
      const envId = useEnvStore.getState().activeEnvId
      toast.success(`Sync triggered (job: ${data.jobId})`)
      queryClient.invalidateQueries({ queryKey: ['sync-status', envId] })
      queryClient.invalidateQueries({ queryKey: ['sync-history', envId] })
      queryClient.invalidateQueries({ queryKey: ['sync-schedule', envId] })
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A sync is already in progress or queued')
      } else if (err instanceof ApiError && err.status === 503) {
        toast.error('Sync queue unavailable')
      } else {
        toast.error('Failed to trigger sync')
      }
    },
  })
}
