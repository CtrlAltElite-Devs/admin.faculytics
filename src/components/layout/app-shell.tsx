import { NavLink, Outlet, useNavigate } from 'react-router'
import { Activity, LogOut, RefreshCw, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EnvSwitcher } from './env-switcher'
import { HealthIndicator } from '@/features/health/health-indicator'
import { useAuthStore } from '@/stores/auth-store'
import { useEnvStore } from '@/stores/env-store'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/sync', label: 'Moodle Sync', icon: RefreshCw },
  { to: '/users', label: 'Users', icon: Users },
] as const

export function AppShell() {
  const navigate = useNavigate()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const session = useAuthStore((s) =>
    activeEnvId ? s.getSession(activeEnvId) : undefined,
  )
  const clearSession = useAuthStore((s) => s.clearSession)

  const handleLogout = () => {
    if (activeEnvId) clearSession(activeEnvId)
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center gap-2 px-4 font-semibold">
          <Activity className="size-5" />
          <span>Faculytics Admin</span>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="p-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )
            }
          >
            <Settings className="size-4" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            <EnvSwitcher />
            <HealthIndicator />
          </div>

          <div className="flex items-center gap-3">
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
                  >
                    <LogOut className="size-4" />
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
