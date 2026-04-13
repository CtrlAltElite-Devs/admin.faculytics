import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import type {
  AdminUserScopeAssignment,
  UpdateScopeAssignmentRequest,
} from '@/types/api'

function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const msg = (body as { message?: unknown }).message
  if (Array.isArray(msg)) return msg.filter((m) => typeof m === 'string').join(', ')
  if (typeof msg === 'string') return msg
  return undefined
}

export function useUpdateScopeAssignment(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateScopeAssignmentRequest) =>
      apiClient<AdminUserScopeAssignment>(
        `/admin/users/${userId}/scope-assignment`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        },
      ),
    onSuccess: () => {
      const envId = useEnvStore.getState().activeEnvId
      toast.success('Scope assignment updated')
      queryClient.invalidateQueries({
        queryKey: ['admin-user', envId, userId],
      })
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        const message = extractErrorMessage(err.body)
        if (err.status === 400) {
          toast.error(message ?? 'Invalid request')
        } else if (err.status === 404) {
          toast.error(message ?? 'User or target not found')
        } else {
          toast.error(message ?? 'Failed to update scope assignment')
        }
      } else {
        toast.error('Failed to update scope assignment')
      }
    },
  })
}
