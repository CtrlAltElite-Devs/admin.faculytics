import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { ProvisionCategoriesRequest, ProvisionResultResponse } from '@/types/api'

export function useProvisionCategories() {
  return useMutation({
    mutationFn: (data: ProvisionCategoriesRequest) =>
      apiClient<ProvisionResultResponse>('/moodle/provision/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast.success(`Categories provisioned: ${data.created} created, ${data.skipped} skipped`)
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A provisioning operation is already in progress')
      } else {
        toast.error('Failed to provision categories')
      }
    },
  })
}
