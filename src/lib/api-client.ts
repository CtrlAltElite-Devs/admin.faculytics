import { useAuthStore } from '@/stores/auth-store'
import { useEnvStore } from '@/stores/env-store'
import type { LoginResponse } from '@/types/api'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/**
 * Thin fetch wrapper that resolves the active environment's baseUrl
 * and injects the Bearer token from the auth store.
 *
 * 401 responses trigger a single silent refresh attempt before failing.
 */
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  /** Override environment ID (defaults to active) */
  envId?: string,
): Promise<T> {
  const resolvedEnvId = envId ?? useEnvStore.getState().activeEnvId
  if (!resolvedEnvId) throw new Error('No active environment')

  const env = useEnvStore
    .getState()
    .environments.find((e) => e.id === resolvedEnvId)
  if (!env) throw new Error(`Environment ${resolvedEnvId} not found`)

  const doFetch = async (token?: string): Promise<Response> => {
    const headers = new Headers(options.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    const url = `${env.baseUrl.replace(/\/$/, '')}/api/v1/${path.replace(/^\//, '')}`
    return fetch(url, { ...options, headers })
  }

  const token = useAuthStore.getState().getToken(resolvedEnvId)
  let res = await doFetch(token)

  // Silent refresh on 401
  if (res.status === 401 && token) {
    const refreshed = await tryRefresh(resolvedEnvId, env.baseUrl)
    if (refreshed) {
      const newToken = useAuthStore.getState().getToken(resolvedEnvId)
      res = await doFetch(newToken)
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body)
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

async function tryRefresh(envId: string, baseUrl: string): Promise<boolean> {
  const session = useAuthStore.getState().getSession(envId)
  if (!session?.refreshToken) {
    useAuthStore.getState().clearSession(envId)
    return false
  }

  try {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v1/auth/refresh`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.refreshToken}`,
      },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })

    if (!res.ok) {
      useAuthStore.getState().clearSession(envId)
      return false
    }

    const data = (await res.json()) as LoginResponse
    useAuthStore.getState().setSession(envId, {
      token: data.token,
      refreshToken: data.refreshToken,
      user: session.user,
    })
    return true
  } catch {
    useAuthStore.getState().clearSession(envId)
    return false
  }
}
