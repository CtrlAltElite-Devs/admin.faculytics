import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import type { ProvisionUserRequest, ProvisionUserResponse } from '@/types/api'

export function useProvisionUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProvisionUserRequest) =>
      apiClient<ProvisionUserResponse>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      const envId = useEnvStore.getState().activeEnvId
      queryClient.invalidateQueries({ queryKey: ['admin-users', envId] })
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error(err.message || 'Username already exists')
        } else if (err.status === 400) {
          toast.error(err.message || 'Invalid input')
        } else if (err.status === 403) {
          toast.error('Only SuperAdmin can provision users')
        } else {
          toast.error('Failed to provision user')
        }
      } else {
        toast.error('Failed to provision user')
      }
    },
  })
}
