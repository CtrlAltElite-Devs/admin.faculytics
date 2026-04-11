import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuthStore } from '@/stores/auth-store'
import { useEnvStore } from '@/stores/env-store'
import { useEnvHealth } from '@/features/health/use-env-health'
import { apiClient, ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { Environment, LoginResponse, MeResponse } from '@/types/api'

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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Already logged in — redirect
  if (isAuthenticated && activeEnvId) {
    navigate('/sync', { replace: true })
    return null
  }

  // No environment configured
  if (!activeEnvId || !activeEnv) {
    return (
      <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
        <BrandingPanel />
        <div className="flex flex-col items-center justify-center p-8 sm:p-12">
          <div className="lg:hidden mb-10 text-center">
            <MobileBrandingHeader />
          </div>
          <div className="w-full max-w-sm login-stagger">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/25">
              <Shield className="size-7" />
            </div>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">
                No Environment
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Configure an environment in Settings before signing in.
              </p>
            </div>
            <Button
              className="w-full h-11 text-sm font-medium"
              size="lg"
              onClick={() => navigate('/settings')}
            >
              Go to Settings
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
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
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <BrandingPanel />

      <div className="flex flex-col items-center justify-center p-8 sm:p-12 relative">
        {/* Mobile branding — visible below lg */}
        <div className="lg:hidden mb-10 text-center">
          <MobileBrandingHeader />
        </div>

        <div className="w-full max-w-sm login-stagger">
          {/* Environment indicator */}
          <ActiveEnvIndicator env={activeEnv} />

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your admin console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                autoFocus
                placeholder="Enter your username"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground/50 hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Environment picker */}
          <EnvironmentPicker activeEnvId={activeEnvId} />
        </div>
      </div>
    </div>
  )
}

/** Inline environment picker — collapsible list below the form */
function EnvironmentPicker({ activeEnvId }: { activeEnvId: string }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const environments = useEnvStore((s) => s.environments)
  const setActiveEnv = useEnvStore((s) => s.setActiveEnv)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-6">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group mx-auto flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
          Switch environment
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="env-picker-content">
        <div className="mt-4 rounded-xl border border-border/70 bg-surface/60 backdrop-blur-sm">
          <div className="p-1.5">
            {environments.map((env) => (
              <EnvironmentItem
                key={env.id}
                env={env}
                isActive={env.id === activeEnvId}
                onSelect={() => {
                  if (env.id !== activeEnvId) {
                    setActiveEnv(env.id)
                    setOpen(false)
                  }
                }}
              />
            ))}
          </div>

          <div className="border-t border-border/50 px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/60 transition-colors"
            >
              <Settings className="size-3.5" />
              Manage environments
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** Active environment bar — shows label, URL, and live health status */
function ActiveEnvIndicator({ env }: { env: Environment }) {
  const { data, isError, isLoading } = useEnvHealth(env.id, env.baseUrl)
  const status: HealthStatus = isLoading
    ? 'loading'
    : isError || data?.status !== 'ok'
      ? 'down'
      : 'ok'

  return (
    <div className="flex items-center gap-2.5 mb-8">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: env.color,
          boxShadow: `0 0 0 3px color-mix(in oklch, ${env.color} 18%, transparent)`,
        }}
      />
      <span className="text-sm font-medium">{env.label}</span>
      <span className="text-xs text-muted-foreground/50 font-mono truncate">
        {env.baseUrl}
      </span>
      <HealthDot status={status} className="ml-auto" />
    </div>
  )
}

/** Single environment row inside the picker — owns its health query */
function EnvironmentItem({
  env,
  isActive,
  onSelect,
}: {
  env: Environment
  isActive: boolean
  onSelect: () => void
}) {
  const { data, isError, isLoading } = useEnvHealth(env.id, env.baseUrl)
  const status: HealthStatus = isLoading
    ? 'loading'
    : isError || data?.status !== 'ok'
      ? 'down'
      : 'ok'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        isActive
          ? 'bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]'
          : 'hover:bg-accent/60',
      )}
    >
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: env.color }}
      />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-sm font-medium truncate',
            isActive && 'text-brand-blue',
          )}
        >
          {env.label}
        </div>
        <div className="text-[11px] font-mono text-muted-foreground/50 truncate">
          {env.baseUrl}
        </div>
      </div>
      <HealthDot status={status} />
      {isActive && (
        <Check className="size-3.5 shrink-0 text-brand-blue" />
      )}
    </button>
  )
}

/** Tiny colored dot indicating environment health */
type HealthStatus = 'ok' | 'down' | 'loading'

function HealthDot({
  status,
  className,
}: {
  status: HealthStatus
  className?: string
}) {
  return (
    <span
      className={cn('relative flex size-4 items-center justify-center shrink-0', className)}
      title={
        status === 'ok'
          ? 'Healthy'
          : status === 'down'
            ? 'Unreachable'
            : 'Checking…'
      }
    >
      {/* Ambient glow for ok/down */}
      {status !== 'loading' && (
        <span
          className={cn(
            'absolute inset-0 rounded-full opacity-20 blur-[3px]',
            status === 'ok' ? 'bg-emerald-500' : 'bg-red-500',
          )}
        />
      )}
      <span
        className={cn(
          'relative size-2 rounded-full',
          status === 'ok' && 'bg-emerald-500',
          status === 'down' && 'bg-red-500',
          status === 'loading' && 'bg-muted-foreground/40 animate-pulse',
        )}
      />
    </span>
  )
}

/** Compact branding strip for mobile screens */
function MobileBrandingHeader() {
  return (
    <>
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/25">
        <Shield className="size-6" />
      </div>
      <h1 className="font-display text-xl font-semibold tracking-tight">
        Faculytics Admin
      </h1>
    </>
  )
}

/** Left branding panel — always dark, hidden below lg */
function BrandingPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
      style={{ background: 'oklch(0.18 0.04 264.53)' }}
    >
      {/* Atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm glow — bottom left */}
        <div
          className="absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full blur-[120px]"
          style={{ background: 'oklch(0.7 0.16 91.13 / 0.1)' }}
        />
        {/* Cool highlight — top right */}
        <div
          className="absolute -top-16 -right-16 h-[360px] w-[360px] rounded-full blur-[100px]"
          style={{ background: 'oklch(0.5 0.2 264.53 / 0.18)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        {/* Decorative rings */}
        <div className="absolute top-20 right-12 size-36 rounded-full border border-white/[0.06]" />
        <div className="absolute top-28 right-20 size-24 rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-24 left-10 size-56 rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-40 left-28 size-28 rounded-full border border-white/[0.03]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 login-brand-slide">
        {/* Logo mark */}
        <div>
          <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] backdrop-blur-sm">
            <Shield className="size-5" />
          </div>
        </div>

        {/* Main copy */}
        <div className="mt-auto">
          <h2 className="font-display text-[2.75rem] font-semibold leading-[1.15] tracking-tight">
            Faculytics
            <br />
            <span className="text-white/60">Admin Console</span>
          </h2>
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/40">
            Manage environments, monitor sync pipelines, and oversee platform health from a single dashboard.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-xs font-mono text-white/20 tracking-wide">
            Faculytics Platform
          </p>
        </div>
      </div>
    </div>
  )
}
