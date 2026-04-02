import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const variants: Record<string, string> = {
  idle: 'border-muted-foreground/50 text-muted-foreground',
  active: 'border-blue-500/50 text-blue-600 bg-blue-50',
  queued: 'border-amber-500/50 text-amber-600 bg-amber-50',
  completed: 'border-green-500/50 text-green-600',
  partial: 'border-amber-500/50 text-amber-600',
  failed: 'border-red-500/50 text-red-600',
  running: 'border-blue-500/50 text-blue-600 bg-blue-50',
  success: 'border-green-500/50 text-green-600',
  skipped: 'border-muted-foreground/50 text-muted-foreground',
}

const dots: Record<string, string> = {
  idle: 'bg-muted-foreground',
  active: 'bg-blue-500 animate-pulse',
  queued: 'bg-amber-500 animate-pulse',
  completed: 'bg-green-500',
  partial: 'bg-amber-500',
  failed: 'bg-red-500',
  running: 'bg-blue-500 animate-pulse',
  success: 'bg-green-500',
  skipped: 'bg-muted-foreground',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 capitalize', variants[normalized], className)}
    >
      <span
        className={cn('size-1.5 rounded-full', dots[normalized] ?? 'bg-muted-foreground')}
      />
      {status}
    </Badge>
  )
}
