import { Activity, AlertTriangle, Clock, Database } from 'lucide-react'
import { SyncStatusCard } from './sync-status-card'
import { SyncScheduleCard } from './sync-schedule-card'
import { SyncHistoryTable } from './sync-history-table'
import { useSyncStatus } from './use-sync-status'
import { useSyncHistory } from './use-sync-history'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'

function QuickStat({
  icon: Icon,
  label,
  value,
  accent = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  accent?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const iconStyles = {
    default: 'bg-brand-blue/10 text-brand-blue',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }

  return (
    <div className="group rounded-xl border border-border/70 bg-card/80 backdrop-blur-sm px-4 py-3.5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            iconStyles[accent],
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {label}
          </p>
          <p className="text-lg font-semibold tabular-nums tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export function SyncDashboard() {
  const { data: status } = useSyncStatus()
  const { data: history } = useSyncHistory(1)

  const lastSync = history?.data?.[0]
  const totalSyncs = history?.meta?.totalItems ?? 0
  const failedCount = status?.failedCount ?? 0
  const isBusy = status?.state === 'active' || status?.state === 'queued'

  return (
    <div className="space-y-8 dashboard-stagger">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Moodle Sync
          </h1>
          {status && <StatusBadge status={status.state} />}
        </div>
        <p className="text-sm text-muted-foreground">
          Monitor and manage Moodle data synchronization
        </p>
        {isBusy && (
          <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-blue-500/10 dark:bg-blue-400/10">
            <div className="h-full w-1/4 rounded-full bg-blue-500 dark:bg-blue-400 animate-[sync-slide_1.8s_ease-in-out_infinite]" />
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <QuickStat
          icon={Activity}
          label="Pipeline"
          value={status?.state?.toUpperCase() ?? '—'}
          accent={isBusy ? 'warning' : 'default'}
        />
        <QuickStat icon={Database} label="Total Syncs" value={totalSyncs} />
        <QuickStat
          icon={Clock}
          label="Last Trigger"
          value={lastSync?.trigger ?? '—'}
        />
        <QuickStat
          icon={AlertTriangle}
          label="Failed Jobs"
          value={failedCount}
          accent={failedCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Status + Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <SyncStatusCard />
        <SyncScheduleCard />
      </div>

      {/* History */}
      <SyncHistoryTable />
    </div>
  )
}
