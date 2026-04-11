import { AlertTriangle, Clock, Loader2, Play } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatusBadge } from '@/components/shared/status-badge'
import { RelativeTime } from '@/components/shared/relative-time'
import { useSyncStatus } from './use-sync-status'
import { useTriggerSync } from './use-trigger-sync'
import { cn } from '@/lib/utils'

export function SyncStatusCard() {
  const { data, isLoading, isError } = useSyncStatus()
  const triggerSync = useTriggerSync()

  const isBusy = data?.state === 'active' || data?.state === 'queued'

  const topBorder = !data
    ? ''
    : data.state === 'active'
      ? 'border-t-2 border-t-blue-500'
      : data.state === 'queued'
        ? 'border-t-2 border-t-amber-500'
        : 'border-t-2 border-t-emerald-500/60'

  return (
    <Card className={cn('overflow-hidden', topBorder)}>
      <div className="p-5 space-y-3">
        {/* Title + badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Sync Status</h3>
          {data && <StatusBadge status={data.state} />}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">Failed to fetch status</p>
        )}

        {data && (
          <>
            {/* Active sync context */}
            {isBusy && (
              <div className="space-y-1.5">
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-blue-500/10 dark:bg-blue-400/10">
                  <div className="h-full w-1/4 rounded-full bg-blue-500 dark:bg-blue-400 animate-[sync-slide_1.8s_ease-in-out_infinite]" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.trigger && (
                    <span className="capitalize">{data.trigger}</span>
                  )}
                  {data.trigger && data.startedAt && ' · '}
                  {data.startedAt && (
                    <RelativeTime date={data.startedAt} className="text-xs" />
                  )}
                </p>
              </div>
            )}

            {/* Compact metrics */}
            <div className="flex items-center gap-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <Clock className="size-3.5 text-muted-foreground/50" />
                    <span className="text-sm font-medium">
                      {data.waitingCount}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Waiting jobs</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 tabular-nums',
                      data.failedCount > 0 &&
                        'text-red-600 dark:text-red-400',
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        'size-3.5',
                        data.failedCount === 0 && 'text-muted-foreground/50',
                      )}
                    />
                    <span className="text-sm font-medium">
                      {data.failedCount}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Failed jobs</TooltipContent>
              </Tooltip>
            </div>

            {/* Trigger action */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isBusy || triggerSync.isPending}
                  className={cn(
                    'w-full',
                    !isBusy && 'bg-brand-blue hover:bg-brand-blue/90 text-white',
                  )}
                  variant={isBusy ? 'secondary' : 'default'}
                >
                  {triggerSync.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 size-4" />
                  )}
                  {isBusy ? 'Sync in progress…' : 'Trigger Sync'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-amber-500" />
                    Trigger Full Moodle Sync
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2">
                      <p>
                        This will start a full synchronization of all
                        categories, courses, and enrollments from the connected
                        Moodle instance.
                      </p>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-muted-foreground">
                        <li>Categories and departments will be updated</li>
                        <li>Courses and programs will be synced</li>
                        <li>User enrollments will be refreshed</li>
                        <li>Inactive records may be deactivated</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => triggerSync.mutate()}>
                    Start Sync
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </Card>
  )
}
