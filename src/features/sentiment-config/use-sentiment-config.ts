import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type {
  SentimentVllmConfigResponse,
  UpdateSentimentVllmConfigRequest,
} from '@/types/api'

const ENDPOINT = '/admin/sentiment/vllm-config'

export function useSentimentConfig() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<SentimentVllmConfigResponse>({
    queryKey: ['sentiment-vllm-config', activeEnvId],
    queryFn: () => apiClient<SentimentVllmConfigResponse>(ENDPOINT),
    enabled: !!activeEnvId && isAuth,
    refetchInterval: 60_000,
  })
}

export function useUpdateSentimentConfig() {
  const queryClient = useQueryClient()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)

  return useMutation({
    mutationFn: (body: UpdateSentimentVllmConfigRequest) =>
      apiClient<SentimentVllmConfigResponse>(ENDPOINT, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('vLLM configuration updated')
      queryClient.invalidateQueries({
        queryKey: ['sentiment-vllm-config', activeEnvId],
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update vLLM configuration'
      toast.error(message)
    },
  })
}
