import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProvisionResultResponse } from '@/types/api'

interface ProvisionResultDialogProps {
  result: ProvisionResultResponse | null
  open: boolean
  onClose: () => void
  mode?: 'preview' | 'result'
  onConfirm?: () => void
  isConfirming?: boolean
}

const statusVariant = {
  created: 'default' as const,
  skipped: 'secondary' as const,
  error: 'destructive' as const,
}

const statusLabel: Record<string, Record<string, string>> = {
  preview: { created: 'will create', skipped: 'exists', error: 'error' },
  result: { created: 'created', skipped: 'skipped', error: 'error' },
}

export function ProvisionResultDialog({
  result,
  open,
  onClose,
  mode = 'result',
  onConfirm,
  isConfirming,
}: ProvisionResultDialogProps) {
  if (!result) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'preview' ? 'Category Preview' : 'Provisioning Result'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 text-sm">
          <Badge variant="default">
            {result.created} {mode === 'preview' ? 'to create' : 'created'}
          </Badge>
          <Badge variant="secondary">
            {result.skipped} {mode === 'preview' ? 'existing' : 'skipped'}
          </Badge>
          {result.errors > 0 && (
            <Badge variant="destructive">{result.errors} errors</Badge>
          )}
          <span className="ml-auto text-muted-foreground">
            {mode === 'preview' ? 'Preview' : 'Completed'} in {result.durationMs}ms
          </span>
        </div>

        {result.syncCompleted === false && mode === 'result' && (
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            Categories created in Moodle but local sync failed. Trigger a manual sync before seeding courses.
          </div>
        )}

        {result.details.length > 0 && (
          <ScrollArea className="max-h-72">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  {mode === 'result' && <TableHead>ID</TableHead>}
                  {mode === 'result' && <TableHead>Reason</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.details.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{d.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[d.status]} className="text-xs">
                        {statusLabel[mode][d.status]}
                      </Badge>
                    </TableCell>
                    {mode === 'result' && (
                      <TableCell className="text-xs">{d.moodleId ?? '—'}</TableCell>
                    )}
                    {mode === 'result' && (
                      <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                        {d.reason ?? '—'}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        <DialogFooter>
          {onConfirm ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isConfirming}>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={isConfirming}>
                {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Provision
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
