import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { AuthGuard } from '@/components/layout/auth-guard'
import { LoginPage } from '@/features/auth/login-page'
import { SyncDashboard } from '@/features/moodle-sync/sync-dashboard'
import { UserDetailPage } from '@/features/admin/user-detail-page'
import { UsersPage } from '@/features/admin/users-page'
import { GeneratorPage } from '@/features/submission-generator/generator-page'
import { ProvisionPage } from '@/features/moodle-provision/provision-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { AuditLogsPage } from '@/features/audit-logs/audit-logs-page'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      // Public routes
      { path: '/login', element: <LoginPage /> },
      { path: '/settings', element: <SettingsPage /> },

      // Protected routes
      {
        element: <AuthGuard />,
        children: [
          { path: '/sync', element: <SyncDashboard /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/users/:userId', element: <UserDetailPage /> },
          { path: '/submission-generator', element: <GeneratorPage /> },
          { path: '/moodle-provision', element: <ProvisionPage /> },
          { path: '/audit-logs', element: <AuditLogsPage /> },
          { path: '/', element: <Navigate to="/sync" replace /> },
        ],
      },
    ],
  },
]
