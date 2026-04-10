import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { ExecuteCoursesRequest, ProvisionResultResponse } from '@/types/api'

export function useExecuteCourses() {
  return useMutation({
    mutationFn: (data: ExecuteCoursesRequest) =>
      apiClient<ProvisionResultResponse>('/moodle/provision/courses/execute', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast.success(`Courses created: ${data.created} created, ${data.errors} errors`)
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A provisioning operation is already in progress')
      } else {
        toast.error('Failed to create courses')
      }
    },
  })
}
