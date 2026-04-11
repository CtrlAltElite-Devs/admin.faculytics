import { useState } from 'react'
import { Clock, Loader2, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RelativeTime } from '@/components/shared/relative-time'
import { useSyncSchedule, useUpdateSyncSchedule } from './use-sync-schedule'
import { MOODLE_SYNC_MIN_INTERVAL_MINUTES } from '@/lib/constants'

export function SyncScheduleCard() {
  const { data, isLoading, isError } = useSyncSchedule()
  const updateSchedule = useUpdateSyncSchedule()
  const [open, setOpen] = useState(false)
  const [interval, setInterval] = useState('')

  const openDialog = () => {
    setInterval(String(data?.intervalMinutes ?? 60))
    setOpen(true)
  }

  const handleSave = () => {
    const value = Number(interval)
    if (
      !Number.isInteger(value) ||
      value < MOODLE_SYNC_MIN_INTERVAL_MINUTES ||
      value > 1440
    )
      return
    updateSchedule.mutate(
      { intervalMinutes: value },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Card className="overflow-hidden border-t-2 border-t-brand-blue/50 flex flex-col">
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading schedule…
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">Failed to fetch schedule</p>
        )}

        {data && (
          <>
            {/* Interval + cron */}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold tabular-nums">
                Every {data.intervalMinutes} min
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className="text-[11px] font-mono text-muted-foreground/40 cursor-default">
                    {data.cronExpression}
                  </code>
                </TooltipTrigger>
                <TooltipContent>Cron expression</TooltipContent>
              </Tooltip>
            </div>

            {/* Next run + edit */}
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="size-3.5 text-brand-blue" />
                    <span className="font-medium">
                      {data.nextExecution ? (
                        <RelativeTime date={data.nextExecution} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Next scheduled run</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={openDialog}
                  >
                    <Pencil className="size-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit schedule</TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>

      {/* Edit dialog (controlled) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sync Schedule</DialogTitle>
            <DialogDescription>
              Set the interval between automatic Moodle synchronizations.
              Minimum is {MOODLE_SYNC_MIN_INTERVAL_MINUTES} minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-interval">Interval (minutes)</Label>
              <Input
                id="schedule-interval"
                type="number"
                min={MOODLE_SYNC_MIN_INTERVAL_MINUTES}
                value={interval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInterval(e.target.value)
                }
                placeholder={String(MOODLE_SYNC_MIN_INTERVAL_MINUTES)}
              />
              {Number(interval) > 0 &&
                Number(interval) < MOODLE_SYNC_MIN_INTERVAL_MINUTES && (
                  <p className="text-xs text-destructive">
                    Minimum interval is {MOODLE_SYNC_MIN_INTERVAL_MINUTES}{' '}
                    minutes
                  </p>
                )}
            </div>
            {data && (
              <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-1.5 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground/70">
                    Current:
                  </span>{' '}
                  every {data.intervalMinutes} min (
                  <code className="font-mono text-[11px]">
                    {data.cronExpression}
                  </code>
                  )
                </p>
                {Number(interval) >= MOODLE_SYNC_MIN_INTERVAL_MINUTES && (
                  <p>
                    <span className="font-medium text-foreground/70">
                      New:
                    </span>{' '}
                    every {interval} min
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                updateSchedule.isPending ||
                Number(interval) < MOODLE_SYNC_MIN_INTERVAL_MINUTES ||
                Number(interval) === data?.intervalMinutes
              }
            >
              {updateSchedule.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
