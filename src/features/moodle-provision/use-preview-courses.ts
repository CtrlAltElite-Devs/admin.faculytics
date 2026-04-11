import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { BulkCoursePreviewRequest, CoursePreviewResponse } from '@/types/api'

export function usePreviewBulkCourses() {
  return useMutation({
    mutationFn: (dto: BulkCoursePreviewRequest) =>
      apiClient<CoursePreviewResponse>('/moodle/provision/courses/bulk/preview', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onError: (err) => {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string } | null
        toast.error(body?.message ?? 'Failed to preview courses')
      } else {
        toast.error('Failed to preview courses')
      }
    },
  })
}
