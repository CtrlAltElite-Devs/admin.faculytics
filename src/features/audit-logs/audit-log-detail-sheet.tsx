import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuditLog } from './use-audit-logs'

interface AuditLogDetailSheetProps {
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
    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{children}</span>
    </div>
  )
}

export function AuditLogDetailSheet({
  logId,
  open,
  onOpenChange,
}: AuditLogDetailSheetProps) {
  const { data: log, isLoading } = useAuditLog(open ? logId : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Audit Log Detail</SheetTitle>
          <SheetDescription>
            {log ? log.action : 'Loading...'}
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
              {/* Action */}
              <div>
                <Badge variant="outline" className="font-mono text-xs">
                  {log.action}
                </Badge>
              </div>

              <Separator />

              {/* Actor */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actor
                </h4>
                <DetailRow label="Username">
                  {log.actorUsername ?? (
                    <span className="text-muted-foreground">System</span>
                  )}
                </DetailRow>
                <DetailRow label="ID">
                  {log.actorId ? (
                    <span className="font-mono text-xs">{log.actorId}</span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
              </div>

              <Separator />

              {/* Resource */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resource
                </h4>
                <DetailRow label="Type">
                  {log.resourceType ?? (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
                <DetailRow label="ID">
                  {log.resourceId ? (
                    <span className="font-mono text-xs">{log.resourceId}</span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
              </div>

              <Separator />

              {/* Client Info */}
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
                  {log.os ?? (
                    <span className="text-muted-foreground">--</span>
                  )}
                </DetailRow>
              </div>

              <Separator />

              {/* Timestamp */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timestamp
                </h4>
                <DetailRow label="Occurred At">
                  {new Date(log.occurredAt).toLocaleString()}
                </DetailRow>
              </div>

              {/* Metadata */}
              {log.metadata &&
                Object.keys(log.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Metadata
                      </h4>
                      <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-64 font-mono">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  </>
                )}

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
