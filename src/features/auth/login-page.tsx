import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { useEnvStore } from '@/stores/env-store'
import { apiClient, ApiError } from '@/lib/api-client'
import type { LoginResponse, MeResponse } from '@/types/api'

export function LoginPage() {
  const navigate = useNavigate()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const activeEnv = useEnvStore((s) => s.getActiveEnv())
  const setSession = useAuthStore((s) => s.setSession)
  const isAuthenticated = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in — redirect
  if (isAuthenticated && activeEnvId) {
    navigate('/sync', { replace: true })
    return null
  }

  if (!activeEnvId || !activeEnv) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>No Environment Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add an environment in Settings before logging in.
            </p>
            <Button className="w-full" onClick={() => navigate('/settings')}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const loginRes = await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })

      // Temporarily set a partial session so the /me call has a token
      const tempSession = {
        token: loginRes.token,
        refreshToken: loginRes.refreshToken,
        user: {} as MeResponse,
      }
      setSession(activeEnvId, tempSession)

      const me = await apiClient<MeResponse>('/auth/me')

      if (!me.roles.includes('SUPER_ADMIN')) {
        useAuthStore.getState().clearSession(activeEnvId)
        toast.error('Access denied — SUPER_ADMIN role required')
        return
      }

      setSession(activeEnvId, {
        token: loginRes.token,
        refreshToken: loginRes.refreshToken,
        user: me,
      })

      toast.success(`Logged in to ${activeEnv.label}`)
      navigate('/sync', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Invalid credentials')
      } else {
        toast.error('Connection failed — check the environment URL')
      }
      useAuthStore.getState().clearSession(activeEnvId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: activeEnv.color }}
            />
            Login to {activeEnv.label}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{activeEnv.baseUrl}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
