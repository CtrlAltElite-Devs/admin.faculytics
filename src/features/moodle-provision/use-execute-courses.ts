import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { BulkCourseExecuteRequest, ProvisionResultResponse } from '@/types/api'

export function useExecuteBulkCourses() {
  return useMutation({
    mutationFn: (data: BulkCourseExecuteRequest) =>
      apiClient<ProvisionResultResponse>('/moodle/provision/courses/bulk/execute', {
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
