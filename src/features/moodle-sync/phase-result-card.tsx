import { StatusBadge } from '@/components/shared/status-badge'
import type { SyncPhaseResult } from '@/types/api'

interface PhaseResultCardProps {
  label: string
  phase: SyncPhaseResult
}

export function PhaseResultCard({ label, phase }: PhaseResultCardProps) {
  const formatDuration = (ms: number) => {
    if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`
    if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`
    return `${ms}ms`
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDuration(phase.durationMs)}
          </span>
          <StatusBadge status={phase.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCell label="Fetched" value={phase.fetched} />
        <StatCell label="Inserted" value={phase.inserted} highlight={phase.inserted > 0} />
        <StatCell label="Updated" value={phase.updated} highlight={phase.updated > 0} />
        <StatCell label="Deactivated" value={phase.deactivated} warn={phase.deactivated > 0} />
        <StatCell label="Errors" value={phase.errors} error={phase.errors > 0} />
      </div>

      {phase.errorMessage && (
        <div className="rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2">
          <p className="text-xs text-destructive">{phase.errorMessage}</p>
        </div>
      )}
    </div>
  )
}

function StatCell({
  label,
  value,
  highlight,
  warn,
  error,
}: {
  label: string
  value: number
  highlight?: boolean
  warn?: boolean
  error?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-medium tabular-nums ${
          error
            ? 'text-destructive'
            : warn
              ? 'text-amber-600'
              : highlight
                ? 'text-foreground'
                : 'text-muted-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
