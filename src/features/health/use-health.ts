import { useQuery } from '@tanstack/react-query'
import { useEnvStore } from '@/stores/env-store'
import type { HealthCheckResult } from '@/types/api'

/**
 * Health check does NOT require auth — calls GET /health directly.
 */
export function useHealth() {
  const activeEnv = useEnvStore((s) => s.getActiveEnv())

  return useQuery<HealthCheckResult>({
    queryKey: ['health', activeEnv?.id],
    queryFn: async () => {
      if (!activeEnv) throw new Error('No active environment')
      const url = `${activeEnv.baseUrl.replace(/\/$/, '')}/api/v1/health`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
      return res.json()
    },
    enabled: !!activeEnv,
    refetchInterval: 30_000,
  })
}
