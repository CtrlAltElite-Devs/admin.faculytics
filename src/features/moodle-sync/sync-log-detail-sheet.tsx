import {
  AlertCircle,
  Calendar,
  Clock,
  Fingerprint,
  Timer,
  Zap,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/shared/status-badge'
import type { SyncLogResponse, SyncPhaseResult } from '@/types/api'

interface SyncLogDetailSheetProps {
  log: SyncLogResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDuration(ms?: number) {
  if (ms == null) return '—'
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`
  return `${ms}ms`
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function SyncLogDetailSheet({
  log,
  open,
  onOpenChange,
}: SyncLogDetailSheetProps) {
  if (!log) return null

  const statusColor =
    log.status === 'completed'
      ? 'from-emerald-500/15 to-emerald-500/0'
      : log.status === 'failed'
        ? 'from-red-500/15 to-red-500/0'
        : log.status === 'running'
          ? 'from-blue-500/15 to-blue-500/0'
          : 'from-amber-500/15 to-amber-500/0'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 gap-0">
        {/* Header with status gradient */}
        <div className={`bg-gradient-to-b ${statusColor} px-6 pt-6 pb-5`}>
          <SheetHeader className="gap-0">
            <div className="flex items-start justify-between">
              <div>
                <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70 mb-1">
                  Sync Run
                </SheetDescription>
                <SheetTitle className="font-display text-xl font-semibold tracking-tight">
                  {log.trigger === 'manual'
                    ? 'Manual Sync'
                    : log.trigger === 'scheduled'
                      ? 'Scheduled Sync'
                      : 'Startup Sync'}
                </SheetTitle>
              </div>
              <StatusBadge status={log.status} />
            </div>
          </SheetHeader>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3" />
              {formatDate(log.startedAt)}
            </span>
            {log.durationMs != null && (
              <span className="inline-flex items-center gap-1.5">
                <Timer className="size-3" />
                {formatDuration(log.durationMs)}
              </span>
            )}
            {log.cronExpression && (
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Clock className="size-3" />
                {log.cronExpression}
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="px-6 py-5 space-y-6">
            {/* ID row */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Fingerprint className="size-3.5 text-muted-foreground shrink-0" />
              <code className="text-[11px] font-mono text-muted-foreground break-all leading-relaxed">
                {log.jobId ?? log.id}
              </code>
            </div>

            {/* Timestamps */}
            {log.completedAt && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                    Started
                  </p>
                  <p className="text-sm tabular-nums">
                    {new Date(log.startedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                    Completed
                  </p>
                  <p className="text-sm tabular-nums">
                    {new Date(log.completedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {log.errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Error
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-red-600/90 dark:text-red-300/80 font-mono">
                  {log.errorMessage}
                </p>
              </div>
            )}

            <Separator />

            {/* Phase Results */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="size-4 text-brand-blue" />
                <h4 className="text-sm font-semibold">Sync Phases</h4>
              </div>
              <div className="space-y-4">
                {log.categories ? (
                  <PhaseCard label="Categories" phase={log.categories} />
                ) : (
                  <PhaseEmpty label="Categories" />
                )}
                {log.courses ? (
                  <PhaseCard label="Courses" phase={log.courses} />
                ) : (
                  <PhaseEmpty label="Courses" />
                )}
                {log.enrollments ? (
                  <PhaseCard label="Enrollments" phase={log.enrollments} />
                ) : (
                  <PhaseEmpty label="Enrollments" />
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function PhaseCard({
  label,
  phase,
}: {
  label: string
  phase: SyncPhaseResult
}) {
  const borderColor =
    phase.status === 'success'
      ? 'border-l-emerald-500'
      : phase.status === 'failed'
        ? 'border-l-red-500'
        : 'border-l-muted-foreground/30'

  return (
    <div
      className={`rounded-lg border border-border/70 border-l-[3px] ${borderColor} p-4 space-y-3`}
    >
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
        <StatCell label="Inserted" value={phase.inserted} accent={phase.inserted > 0 ? 'emerald' : undefined} />
        <StatCell label="Updated" value={phase.updated} accent={phase.updated > 0 ? 'blue' : undefined} />
        <StatCell label="Deactivated" value={phase.deactivated} accent={phase.deactivated > 0 ? 'amber' : undefined} />
        <StatCell label="Errors" value={phase.errors} accent={phase.errors > 0 ? 'red' : undefined} />
      </div>

      {phase.errorMessage && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{phase.errorMessage}</p>
        </div>
      )}
    </div>
  )
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: 'emerald' | 'blue' | 'amber' | 'red'
}) {
  const valueColor = accent
    ? {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        red: 'text-red-600 dark:text-red-400',
      }[accent]
    : 'text-muted-foreground'

  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium tabular-nums ${valueColor}`}>
        {value}
      </span>
    </div>
  )
}

function PhaseEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 py-5 text-center">
      <span className="text-xs text-muted-foreground/50">
        {label} — no data
      </span>
    </div>
  )
}
