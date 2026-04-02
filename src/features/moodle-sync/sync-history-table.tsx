import { useState } from 'react'
import { Eye, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatusBadge } from '@/components/shared/status-badge'
import { RelativeTime } from '@/components/shared/relative-time'
import { SyncLogDetailSheet } from './sync-log-detail-sheet'
import { useSyncHistory } from './use-sync-history'
import type { SyncLogResponse } from '@/types/api'

export function SyncHistoryTable() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useSyncHistory(page)
  const [selectedLog, setSelectedLog] = useState<SyncLogResponse | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const openDetail = (log: SyncLogResponse) => {
    setSelectedLog(log)
    setSheetOpen(true)
  }

  const formatDuration = (ms?: number) => {
    if (ms == null) return '—'
    if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`
    if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`
    return `${ms}ms`
  }

  /** Count total operations across all phases */
  const totalOps = (log: SyncLogResponse) => {
    let total = 0
    for (const phase of [log.categories, log.courses, log.enrollments]) {
      if (phase) {
        total += phase.inserted + phase.updated + phase.deactivated
      }
    }
    return total
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Sync History</CardTitle>
            <CardDescription>
              Recent Moodle synchronization runs
            </CardDescription>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-1.5"
              >
                <RefreshCw
                  className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fetch latest sync history</TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive py-4">
              Failed to load sync history
            </p>
          )}

          {data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Changes</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No sync history yet
                      </TableCell>
                    </TableRow>
                  )}
                  {data.data.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => openDetail(log)}
                    >
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="capitalize">{log.trigger}</TableCell>
                      <TableCell>
                        <RelativeTime date={log.startedAt} className="text-sm" />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatDuration(log.durationMs)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {log.errorMessage ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-destructive truncate max-w-[160px] inline-block">
                                Error
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="left"
                              className="max-w-xs text-xs"
                            >
                              {log.errorMessage}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm">{totalOps(log)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-7">
                          <Eye className="size-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-muted-foreground">
                    Page {data.meta.currentPage} of {data.meta.totalPages} (
                    {data.meta.totalItems} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPage((p) => p - 1)
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.meta.totalPages}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPage((p) => p + 1)
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SyncLogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
