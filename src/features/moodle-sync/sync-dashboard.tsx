import { Database, RefreshCw, Users } from 'lucide-react'
import { SyncStatusCard } from './sync-status-card'
import { SyncScheduleCard } from './sync-schedule-card'
import { SyncHistoryTable } from './sync-history-table'
import { useSyncStatus } from './use-sync-status'
import { useSyncHistory } from './use-sync-history'

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 backdrop-blur-sm px-4 py-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-brand-blue/10">
        <Icon className="size-4 text-brand-blue" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Moodle Sync</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage Moodle data synchronization
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <QuickStat
          icon={RefreshCw}
          label="Pipeline State"
          value={status?.state?.toUpperCase() ?? '—'}
        />
        <QuickStat
          icon={Database}
          label="Total Syncs"
          value={totalSyncs}
        />
        <QuickStat
          icon={Users}
          label="Last Trigger"
          value={lastSync?.trigger ?? '—'}
        />
        <QuickStat
          icon={Database}
          label="Failed Jobs"
          value={failedCount}
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
