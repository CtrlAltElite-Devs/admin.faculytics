import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import {
  FileText,
  FlaskConical,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  Users,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
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
import { useSidebarStore } from '@/stores/sidebar-store'

const navItems = [
  { to: '/sync', label: 'Moodle Sync', icon: RefreshCw },
  { to: '/moodle-provision', label: 'Moodle Provision', icon: Wrench },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/submission-generator', label: 'Submission Generator', icon: FlaskConical },
  { to: '/audit-logs', label: 'Audit Logs', icon: FileText },
]

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const session = useAuthStore((s) =>
    activeEnvId ? s.getSession(activeEnvId) : undefined,
  )
  const clearSession = useAuthStore((s) => s.clearSession)
  const sidebarOpen = useSidebarStore((s) => s.open)
  const setSidebarOpen = useSidebarStore((s) => s.setOpen)

  const handleLogout = async () => {
    if (activeEnvId) {
      const env = useEnvStore.getState().environments.find((e) => e.id === activeEnvId)
      const token = useAuthStore.getState().getToken(activeEnvId)
      if (env && token) {
        const url = `${env.baseUrl.replace(/\/$/, '')}/api/v1/auth/logout`
        fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})
      }
      clearSession(activeEnvId)
    }
    navigate('/login')
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="p-3 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-white shadow-md shadow-brand-blue/25">
              <Shield className="size-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-display text-sm font-semibold leading-tight tracking-tight">
                Faculytics
              </span>
              <span className="truncate text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
                Admin
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === to || location.pathname.startsWith(to + '/')}
                      tooltip={label}
                    >
                      <NavLink to={to}>
                        <Icon />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/settings'}
                tooltip="Settings"
              >
                <NavLink to="/settings">
                  <Settings />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/60 backdrop-blur-sm px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />
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

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
