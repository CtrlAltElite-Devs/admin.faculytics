import { Check, Loader2, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAcknowledgeError, useErrorLog } from './use-error-logs'

interface ErrorLogDetailSheetProps {
  logId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{children}</span>
    </div>
  )
}

function statusColor(code: number): string {
  if (code >= 500)
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  if (code >= 400)
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
  return ''
}

export function ErrorLogDetailSheet({
  logId,
  open,
  onOpenChange,
}: ErrorLogDetailSheetProps) {
  const { data: log, isLoading } = useErrorLog(open ? logId : null)
  const acknowledgeMutation = useAcknowledgeError()

  const handleToggleAck = () => {
    if (!log) return
    acknowledgeMutation.mutate({
      id: log.id,
      acknowledge: !log.acknowledgedAt,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Error Log Detail</SheetTitle>
          <SheetDescription>
            {log ? `${log.method} ${log.path}` : 'Loading...'}
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {log && (
          <ScrollArea className="flex-1 px-4 pb-4">
            <div className="space-y-4">
              {/* Status + error name + ack button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs ${statusColor(log.statusCode)}`}
                  >
                    {log.statusCode}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.errorName}
                  </Badge>
                  {log.acknowledgedAt && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    >
                      Acknowledged
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={log.acknowledgedAt ? 'outline' : 'default'}
                  onClick={handleToggleAck}
                  disabled={acknowledgeMutation.isPending}
                  className="gap-1.5"
                >
                  {log.acknowledgedAt ? (
                    <>
                      <RotateCcw className="size-3.5" />
                      Unacknowledge
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      Acknowledge
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Message */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Message
                </h4>
                <p className="text-sm font-mono bg-muted rounded-md p-3 whitespace-pre-wrap break-all">
                  {log.message}
                </p>
              </div>

              {/* Request */}
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Request
                </h4>
                <DetailRow label="Method">
                  <span className="font-mono text-xs">{log.method}</span>
                </DetailRow>
                <DetailRow label="Path">
                  <span className="font-mono text-xs">{log.path}</span>
                </DetailRow>
                <DetailRow label="User">
                  {log.userName ? (
                    <span>{log.userName}</span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
                <DetailRow label="User ID">
                  {log.userId ? (
                    <span className="font-mono text-xs">{log.userId}</span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
              </div>

              {/* Body */}
              {log.requestBody && Object.keys(log.requestBody).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Request Body{' '}
                      <span className="font-normal lowercase text-[10px]">
                        (sensitive fields redacted)
                      </span>
                    </h4>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-64 font-mono">
                      {JSON.stringify(log.requestBody, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {/* Query */}
              {log.requestQuery && Object.keys(log.requestQuery).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Query String
                    </h4>
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-48 font-mono">
                      {JSON.stringify(log.requestQuery, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {/* Stack */}
              {log.stack && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Stack Trace
                    </h4>
                    <pre className="rounded-md bg-muted p-3 text-[11px] overflow-auto max-h-96 font-mono whitespace-pre">
                      {log.stack}
                    </pre>
                  </div>
                </>
              )}

              {/* Client Info */}
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client Info
                </h4>
                <DetailRow label="IP Address">
                  {log.ipAddress ? (
                    <span className="font-mono text-xs">{log.ipAddress}</span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
                <DetailRow label="Browser">
                  {log.browserName ?? (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
                <DetailRow label="OS">
                  {log.os ?? <span className="text-muted-foreground">--</span>}
                </DetailRow>
              </div>

              {/* Timestamps */}
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timestamps
                </h4>
                <DetailRow label="Occurred At">
                  {new Date(log.occurredAt).toLocaleString()}
                </DetailRow>
                {log.acknowledgedAt && (
                  <>
                    <DetailRow label="Acknowledged">
                      {new Date(log.acknowledgedAt).toLocaleString()}
                    </DetailRow>
                    <DetailRow label="By">
                      {log.acknowledgedBy ?? (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </DetailRow>
                  </>
                )}
              </div>

              {/* ID */}
              <Separator />
              <DetailRow label="Log ID">
                <span className="font-mono text-xs">{log.id}</span>
              </DetailRow>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
