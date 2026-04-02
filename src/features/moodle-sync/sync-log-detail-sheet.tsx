import { Clock, Hash, User, AlertCircle } from 'lucide-react'
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
import { PhaseResultCard } from './phase-result-card'
import type { SyncLogResponse } from '@/types/api'

interface SyncLogDetailSheetProps {
  log: SyncLogResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}

export function SyncLogDetailSheet({
  log,
  open,
  onOpenChange,
}: SyncLogDetailSheetProps) {
  if (!log) return null

  const formatDuration = (ms?: number) => {
    if (ms == null) return '—'
    if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`
    if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`
    return `${ms}ms`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Sync Run Details</SheetTitle>
            <StatusBadge status={log.status} />
          </div>
          <SheetDescription>
            {new Date(log.startedAt).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] pr-3 mt-6">
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-4">
              <DetailRow icon={Hash} label="Job ID">
                <code className="text-xs font-mono break-all">
                  {log.jobId ?? log.id}
                </code>
              </DetailRow>
              <DetailRow icon={User} label="Trigger">
                <span className="capitalize">{log.trigger}</span>
              </DetailRow>
              <DetailRow icon={Clock} label="Duration">
                <span className="tabular-nums font-medium">
                  {formatDuration(log.durationMs)}
                </span>
              </DetailRow>
              <DetailRow icon={Clock} label="Completed">
                {log.completedAt
                  ? new Date(log.completedAt).toLocaleTimeString()
                  : '—'}
              </DetailRow>
            </div>

            {log.cronExpression && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs">
                <span className="text-muted-foreground">Cron: </span>
                <code className="font-mono">{log.cronExpression}</code>
              </div>
            )}

            {/* Error */}
            {log.errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Error
                  </span>
                </div>
                <p className="text-xs text-destructive/80">
                  {log.errorMessage}
                </p>
              </div>
            )}

            <Separator />

            {/* Phase Results */}
            <div>
              <h4 className="text-sm font-medium mb-3">
                Sync Phases
              </h4>
              <div className="space-y-3">
                {log.categories ? (
                  <PhaseResultCard label="Categories" phase={log.categories} />
                ) : (
                  <PhaseEmpty label="Categories" />
                )}
                {log.courses ? (
                  <PhaseResultCard label="Courses" phase={log.courses} />
                ) : (
                  <PhaseEmpty label="Courses" />
                )}
                {log.enrollments ? (
                  <PhaseResultCard label="Enrollments" phase={log.enrollments} />
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

function PhaseEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed p-3 text-center">
      <span className="text-xs text-muted-foreground">
        {label} — no data
      </span>
    </div>
  )
}
