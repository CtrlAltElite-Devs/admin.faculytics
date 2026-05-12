import { useState, useDeferredValue } from 'react'
import { Eye, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RelativeTime } from '@/components/shared/relative-time'
import { useErrorLogs } from './use-error-logs'
import { ErrorLogDetailSheet } from './error-log-detail-sheet'
import type { ListErrorLogsQuery } from '@/types/api'

const ALL_VALUE = '__all__'

function statusColor(code: number): string {
  if (code >= 500)
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  if (code >= 400)
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
  return ''
}

export function ErrorLogsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(ALL_VALUE)
  const [ackFilter, setAckFilter] = useState<string>('unack') // default: only unack
  const [page, setPage] = useState(1)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const deferredSearch = useDeferredValue(search)

  const query: ListErrorLogsQuery = {
    search: deferredSearch || undefined,
    statusCode:
      statusFilter !== ALL_VALUE ? parseInt(statusFilter, 10) : undefined,
    acknowledged:
      ackFilter === 'ack'
        ? true
        : ackFilter === 'unack'
          ? false
          : undefined,
    page,
    limit: 20,
  }

  const { data, isLoading, isFetching } = useErrorLogs(query)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter(ALL_VALUE)
    setAckFilter(ALL_VALUE)
    setPage(1)
  }

  const hasActiveFilters =
    search || statusFilter !== ALL_VALUE || ackFilter !== ALL_VALUE

  const openDetail = (id: string) => {
    setSelectedLogId(id)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6 dashboard-stagger">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Error Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Captured 5xx exceptions across the API surface
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Captured Errors</CardTitle>
              <CardDescription>
                {data
                  ? `${data.meta.totalItems} errors match the filters`
                  : 'Loading errors...'}
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1.5"
              >
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by path, error name, message, or user..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:min-w-0">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All status codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All status codes</SelectItem>
                  <SelectItem value="500">500 — Internal Server Error</SelectItem>
                  <SelectItem value="502">502 — Bad Gateway</SelectItem>
                  <SelectItem value="503">503 — Service Unavailable</SelectItem>
                  <SelectItem value="504">504 — Gateway Timeout</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={ackFilter}
                onValueChange={(v) => {
                  setAckFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Acknowledgement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All errors</SelectItem>
                  <SelectItem value="unack">Unacknowledged only</SelectItem>
                  <SelectItem value="ack">Acknowledged only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="relative">
                {isFetching && !isLoading && (
                  <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded">
                    <div className="h-full w-1/3 animate-pulse bg-primary/30" />
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Status</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>When</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-12"
                        >
                          No errors match the current filters
                        </TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((log) => (
                      <TableRow
                        key={log.id}
                        className={log.acknowledgedAt ? 'opacity-60' : ''}
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[11px] ${statusColor(log.statusCode)}`}
                          >
                            {log.statusCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {log.method}
                            </span>
                            <span className="text-sm truncate max-w-[280px]">
                              {log.path}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-mono text-xs">{log.errorName}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[300px]">
                              {log.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.userName ? (
                            <span className="text-sm">{log.userName}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Anonymous
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RelativeTime
                            date={log.occurredAt}
                            className="text-sm text-muted-foreground"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetail(log.id)}
                            className="text-xs gap-1"
                          >
                            <Eye className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Page {data.meta.currentPage} of {data.meta.totalPages} (
                    {data.meta.totalItems} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
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

      <ErrorLogDetailSheet
        logId={selectedLogId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
