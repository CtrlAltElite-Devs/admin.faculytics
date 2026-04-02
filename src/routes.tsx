import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { AuthGuard } from '@/components/layout/auth-guard'
import { LoginPage } from '@/features/auth/login-page'
import { SyncDashboard } from '@/features/moodle-sync/sync-dashboard'
import { SettingsPage } from '@/features/settings/settings-page'

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
          { path: '/', element: <Navigate to="/sync" replace /> },
        ],
      },
    ],
  },
]
