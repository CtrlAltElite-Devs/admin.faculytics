import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { SeedUsersRequest, SeedUsersResponse } from '@/types/api'

export function useSeedUsers() {
  return useMutation({
    mutationFn: (data: SeedUsersRequest) =>
      apiClient<SeedUsersResponse>('/moodle/provision/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast.success(`Users seeded: ${data.usersCreated} created, ${data.enrolmentsCreated} enrolments`)
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A provisioning operation is already in progress')
      } else {
        toast.error('Failed to seed users')
      }
    },
  })
}
