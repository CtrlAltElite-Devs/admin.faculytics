import { useState } from 'react'
import { Clock, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    if (!Number.isInteger(value) || value < MOODLE_SYNC_MIN_INTERVAL_MINUTES || value > 1440) return
    updateSchedule.mutate(
      { intervalMinutes: value },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Sync Schedule</CardTitle>
          <CardDescription>Automatic sync interval</CardDescription>
        </div>
        <Clock className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading schedule...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to fetch schedule
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Interval</span>
              <span className="font-medium tabular-nums">
                Every {data.intervalMinutes} min
              </span>
              <span className="text-muted-foreground">Cron</span>
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
                {data.cronExpression}
              </code>
              <span className="text-muted-foreground">Next run</span>
              <span>
                {data.nextExecution ? (
                  <RelativeTime date={data.nextExecution} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={openDialog}>
                  Edit Schedule
                </Button>
              </DialogTrigger>
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
                    <Label htmlFor="schedule-interval">
                      Interval (minutes)
                    </Label>
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
                  <div className="rounded-md bg-muted p-3 text-xs space-y-1 text-muted-foreground">
                    <p>
                      <strong>Current:</strong> every {data.intervalMinutes} min (
                      <code className="font-mono">{data.cronExpression}</code>)
                    </p>
                    {Number(interval) >= MOODLE_SYNC_MIN_INTERVAL_MINUTES && (
                      <p>
                        <strong>New:</strong> every {interval} min
                      </p>
                    )}
                  </div>
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
                      Number(interval) === data.intervalMinutes
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
