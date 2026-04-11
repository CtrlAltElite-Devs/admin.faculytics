import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { CoursePreviewResponse, SeedCoursesContext } from '@/types/api'

export function usePreviewCourses() {
  return useMutation({
    mutationFn: ({ file, context }: { file: File; context: SeedCoursesContext }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('campus', context.campus)
      formData.append('department', context.department)
      formData.append('startDate', context.startDate)
      formData.append('endDate', context.endDate)
      return apiClient<CoursePreviewResponse>('/moodle/provision/courses/preview', {
        method: 'POST',
        body: formData,
      })
    },
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
