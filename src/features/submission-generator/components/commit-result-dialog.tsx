import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import type { CommitResult, GeneratePreviewResponse } from '@/types/api'

interface CommitResultDialogProps {
  open: boolean
  result: CommitResult | null
  metadata: GeneratePreviewResponse['metadata'] | null
  onGenerateMore: () => void
  onDone: () => void
}

export function CommitResultDialog({
  open,
  result,
  metadata,
  onGenerateMore,
  onDone,
}: CommitResultDialogProps) {
  if (!result) return null

  const allSucceeded = result.failures === 0
  const allFailed = result.successes === 0
  const successPct = result.total > 0 ? Math.round((result.successes / result.total) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onDone() }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Commit Complete</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Status icon + headline */}
          <div className="flex flex-col items-center gap-2 text-center">
            {allSucceeded && (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/40">
                  <CheckCircle2 className="size-7 text-emerald-500" />
                </div>
                <p className="text-base font-semibold">
                  {result.successes} submission{result.successes !== 1 ? 's' : ''} committed
                </p>
                <p className="text-sm text-muted-foreground">All records saved successfully.</p>
              </>
            )}
            {!allSucceeded && !allFailed && (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-100 dark:bg-amber-950/30 dark:ring-amber-900/40">
                  <AlertTriangle className="size-7 text-amber-500" />
                </div>
                <p className="text-base font-semibold">
                  {result.successes} succeeded, {result.failures} failed
                </p>
                <p className="text-sm text-muted-foreground">
                  Some students may have submitted between preview and commit.
                </p>
              </>
            )}
            {allFailed && (
              <>
                <div className="flex size-14 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100 dark:bg-red-950/30 dark:ring-red-900/40">
                  <XCircle className="size-7 text-red-500" />
                </div>
                <p className="text-base font-semibold">All {result.failures} submissions failed</p>
                <p className="text-sm text-muted-foreground">
                  Data may have already been committed for these students.
                </p>
              </>
            )}
          </div>

          {/* Success ratio bar */}
          {result.total > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{result.successes} succeeded</span>
                <span>{successPct}%</span>
              </div>
              <Progress
                value={successPct}
                className={`h-1.5 ${
                  allSucceeded
                    ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                    : allFailed
                      ? '[&>[data-slot=progress-indicator]]:bg-red-500'
                      : '[&>[data-slot=progress-indicator]]:bg-amber-500'
                }`}
              />
              {result.failures > 0 && (
                <p className="text-right text-xs text-muted-foreground">
                  {result.failures} failed
                </p>
              )}
            </div>
          )}

          {/* Context summary */}
          {metadata && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Faculty
                </span>
                <span className="text-sm">{metadata.faculty.fullName}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Course
                </span>
                <span className="text-sm">{metadata.course.fullname}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Version
                </span>
                <span className="font-mono text-sm">v{metadata.version.versionNumber}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onGenerateMore}>
            Generate More
          </Button>
          <Button
            onClick={onDone}
            className="bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
