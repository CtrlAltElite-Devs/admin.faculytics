import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
        <Card className="w-full max-w-sm panel-surface">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-blue text-white">
              <Shield className="size-6" />
            </div>
            <h2 className="font-display text-xl font-semibold">No Environment</h2>
            <p className="text-sm text-muted-foreground">
              Add an environment in Settings before logging in.
            </p>
          </CardHeader>
          <CardContent>
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
      <Card className="w-full max-w-sm panel-surface">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20">
            <Shield className="size-6" />
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Faculytics Admin
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: activeEnv.color }}
            />
            <span className="text-sm text-muted-foreground">
              {activeEnv.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
            {activeEnv.baseUrl}
          </p>
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
                placeholder="superadmin"
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
                placeholder="Enter password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
