import { useQuery } from '@tanstack/react-query'
import type { HealthCheckResult } from '@/types/api'

/**
 * Check health for a specific environment by its base URL.
 * No auth required — calls GET /api/v1/health directly.
 * Shares the same ['health', envId] query key as useHealth(),
 * so results are cached and shared across components.
 */
export function useEnvHealth(envId: string, baseUrl: string) {
  return useQuery<HealthCheckResult>({
    queryKey: ['health', envId],
    queryFn: async () => {
      const url = `${baseUrl.replace(/\/$/, '')}/api/v1/health`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
      return res.json()
    },
    refetchInterval: 30_000,
    retry: 1,
    retryDelay: 3_000,
  })
}
