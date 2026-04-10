import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type { QuickCourseRequest, CoursePreviewRow, ProvisionResultResponse } from '@/types/api'

export function useDebouncedValue<T>(value: T, delay: number): [T] {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return [debounced]
}

export function useQuickCoursePreview() {
  return useMutation({
    mutationFn: (data: QuickCourseRequest) =>
      apiClient<CoursePreviewRow>('/moodle/provision/courses/quick/preview', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useQuickCourseCreate() {
  return useMutation({
    mutationFn: (data: QuickCourseRequest) =>
      apiClient<ProvisionResultResponse>('/moodle/provision/courses/quick', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      toast.success(`Course created: ${data.details[0]?.name}`)
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A provisioning operation is already in progress')
      } else {
        toast.error('Failed to create course')
      }
    },
  })
}
