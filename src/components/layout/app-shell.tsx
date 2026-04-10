import { NavLink, Outlet, useNavigate } from 'react-router'
import { FlaskConical, LogOut, RefreshCw, Settings, Shield, Users, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EnvSwitcher } from './env-switcher'
import { ThemeToggle } from './theme-toggle'
import { HealthIndicator } from '@/features/health/health-indicator'
import { useAuthStore } from '@/stores/auth-store'
import { useEnvStore } from '@/stores/env-store'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/sync', label: 'Moodle Sync', icon: RefreshCw },
  { to: '/moodle-provision', label: 'Moodle Provision', icon: Wrench },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/submission-generator', label: 'Submission Generator', icon: FlaskConical },
]

export function AppShell() {
  const navigate = useNavigate()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const session = useAuthStore((s) =>
    activeEnvId ? s.getSession(activeEnvId) : undefined,
  )
  const clearSession = useAuthStore((s) => s.clearSession)

  const handleLogout = async () => {
    if (activeEnvId) {
      // Attempt server-side token invalidation before clearing client state
      const env = useEnvStore.getState().environments.find((e) => e.id === activeEnvId)
      const token = useAuthStore.getState().getToken(activeEnvId)
      if (env && token) {
        const url = `${env.baseUrl.replace(/\/$/, '')}/api/v1/auth/logout`
        fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})  // Best-effort — don't block logout on network failure
      }
      clearSession(activeEnvId)
    }
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-sm text-sidebar-foreground">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-blue text-white">
            <Shield className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold leading-tight tracking-tight">
              Faculytics
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Admin
            </span>
          </div>
        </div>

        <Separator className="opacity-50" />

        <nav className="flex-1 space-y-1 p-2 pt-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue font-medium shadow-sm shadow-brand-blue/5 dark:bg-brand-blue/15'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Separator className="opacity-50" />

        <div className="p-2 pb-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                isActive
                  ? 'bg-brand-blue/10 text-brand-blue font-medium dark:bg-brand-blue/15'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )
            }
          >
            <Settings className="size-4" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/60 backdrop-blur-sm px-6">
          <div className="flex items-center gap-3">
            <EnvSwitcher />
            <HealthIndicator />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session && (
              <span className="text-sm text-muted-foreground">
                {session.user.fullName}
              </span>
            )}
            {session && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="size-8"
                  >
                    <LogOut className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
