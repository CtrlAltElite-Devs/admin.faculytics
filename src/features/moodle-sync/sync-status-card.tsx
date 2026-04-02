import { Play, Loader2, AlertTriangle } from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import { RelativeTime } from '@/components/shared/relative-time'
import { useSyncStatus } from './use-sync-status'
import { useTriggerSync } from './use-trigger-sync'

export function SyncStatusCard() {
  const { data, isLoading, isError } = useSyncStatus()
  const triggerSync = useTriggerSync()

  const isBusy = data?.state === 'active' || data?.state === 'queued'

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Sync Status</CardTitle>
          <CardDescription>Current Moodle sync pipeline state</CardDescription>
        </div>
        {data && <StatusBadge status={data.state} />}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading status...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to fetch sync status
          </p>
        )}

        {data && (
          <>
            {isBusy && (
              <div className="space-y-2">
                <Progress value={undefined} className="h-1.5" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  Synchronization in progress...
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {data.trigger && (
                <>
                  <span className="text-muted-foreground">Trigger</span>
                  <span className="capitalize">{data.trigger}</span>
                </>
              )}
              {data.startedAt && (
                <>
                  <span className="text-muted-foreground">Started</span>
                  <RelativeTime date={data.startedAt} />
                </>
              )}
              <span className="text-muted-foreground">Waiting jobs</span>
              <span className="tabular-nums">{data.waitingCount}</span>
              <span className="text-muted-foreground">Failed jobs</span>
              <span className="tabular-nums">{data.failedCount}</span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isBusy || triggerSync.isPending}
                  className="w-full"
                  variant={isBusy ? 'secondary' : 'default'}
                >
                  {triggerSync.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 size-4" />
                  )}
                  {isBusy ? 'Sync in progress...' : 'Trigger Sync'}
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
                        This will start a full synchronization of all categories,
                        courses, and enrollments from the connected Moodle instance.
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
      </CardContent>
    </Card>
  )
}
