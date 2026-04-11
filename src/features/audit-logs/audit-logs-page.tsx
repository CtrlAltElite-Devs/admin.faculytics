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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RelativeTime } from '@/components/shared/relative-time'
import { useAuditLogs } from './use-audit-logs'
import { AuditLogDetailSheet } from './audit-log-detail-sheet'
import type { ListAuditLogsQuery } from '@/types/api'

const ALL_VALUE = '__all__'

const ACTION_GROUPS: Record<string, string[]> = {
  Auth: [
    'auth.login.success',
    'auth.login.failure',
    'auth.logout',
    'auth.token.refresh',
  ],
  Admin: [
    'admin.sync.trigger',
    'admin.sync-schedule.update',
  ],
  Questionnaire: [
    'questionnaire.submit',
    'questionnaire.ingest',
    'questionnaire.submissions.wipe',
  ],
  Analysis: [
    'analysis.pipeline.create',
    'analysis.pipeline.confirm',
    'analysis.pipeline.cancel',
  ],
  Moodle: [
    'moodle.provision.categories',
    'moodle.provision.courses',
    'moodle.provision.quick-course',
    'moodle.provision.users',
  ],
}

const ACTION_COLORS: Record<string, string> = {
  auth: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  admin: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  questionnaire: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  analysis: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  moodle: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
}

function getActionColor(action: string): string {
  const prefix = action.split('.')[0]
  return ACTION_COLORS[prefix] ?? ''
}

export function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>(ALL_VALUE)
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>(ALL_VALUE)
  const [page, setPage] = useState(1)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const deferredSearch = useDeferredValue(search)

  const query: ListAuditLogsQuery = {
    search: deferredSearch || undefined,
    action: actionFilter !== ALL_VALUE ? actionFilter : undefined,
    resourceType: resourceTypeFilter !== ALL_VALUE ? resourceTypeFilter : undefined,
    page,
    limit: 20,
  }

  const { data, isLoading, isFetching } = useAuditLogs(query)

  const clearFilters = () => {
    setSearch('')
    setActionFilter(ALL_VALUE)
    setResourceTypeFilter(ALL_VALUE)
    setPage(1)
  }

  const hasActiveFilters =
    search || actionFilter !== ALL_VALUE || resourceTypeFilter !== ALL_VALUE

  const openDetail = (id: string) => {
    setSelectedLogId(id)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View system activity and security events
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription>
                {data
                  ? `${data.meta.totalItems} events found`
                  : 'Loading events...'}
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
                placeholder="Search by username, action, or resource type..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:min-w-0">
              {/* Action filter */}
              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All actions</SelectItem>
                  {Object.entries(ACTION_GROUPS).map(([group, actions]) =>
                    actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        <span className="text-muted-foreground text-xs">
                          {group}
                        </span>{' '}
                        {action.split('.').slice(1).join('.')}
                      </SelectItem>
                    )),
                  )}
                </SelectContent>
              </Select>

              {/* Resource type filter */}
              <Select
                value={resourceTypeFilter}
                onValueChange={(v) => {
                  setResourceTypeFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All resource types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All resource types</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Questionnaire">Questionnaire</SelectItem>
                  <SelectItem value="QuestionnaireSubmission">Submission</SelectItem>
                  <SelectItem value="AnalysisPipeline">Pipeline</SelectItem>
                  <SelectItem value="SyncSchedule">Sync Schedule</SelectItem>
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
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP / Browser</TableHead>
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
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-mono ${getActionColor(log.action)}`}
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.actorUsername ? (
                            <div>
                              <p className="text-sm font-medium">
                                {log.actorUsername}
                              </p>
                              {log.actorId && (
                                <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                                  {log.actorId.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              System
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.resourceType ? (
                            <div>
                              <p className="text-sm">{log.resourceType}</p>
                              {log.resourceId && (
                                <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                                  {log.resourceId.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {log.ipAddress && (
                              <Tooltip>
                                <TooltipTrigger className="text-left">
                                  <p className="font-mono">{log.ipAddress}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {[log.browserName, log.os]
                                    .filter(Boolean)
                                    .join(' / ') || 'Unknown'}
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {!log.ipAddress && '--'}
                          </div>
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

      <AuditLogDetailSheet
        logId={selectedLogId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
