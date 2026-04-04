import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import type {
  GeneratePreviewRequest,
  GeneratePreviewResponse,
  GenerateCommitRequest,
  CommitResult,
} from '@/types/api'

export function useGeneratePreview() {
  return useMutation<GeneratePreviewResponse, ApiError, GeneratePreviewRequest>({
    mutationFn: (request) =>
      apiClient<GeneratePreviewResponse>('/admin/generate-submissions/preview', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          const body = err.body as { message?: string } | null
          toast.error(body?.message ?? 'Invalid request')
        } else if (err.status === 404) {
          toast.error('Faculty, course, or version not found')
        } else {
          toast.error('Failed to generate preview')
        }
      } else {
        toast.error('Failed to generate preview')
      }
    },
  })
}

export function useCommitSubmissions() {
  return useMutation<CommitResult, ApiError, GenerateCommitRequest>({
    mutationFn: (request) =>
      apiClient<CommitResult>('/admin/generate-submissions/commit', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
  })
}
