import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useHealth } from './use-health'
import { cn } from '@/lib/utils'

export function HealthIndicator() {
  const { data, isError, isLoading } = useHealth()

  const status = isLoading
    ? 'loading'
    : isError || data?.status !== 'ok'
      ? 'down'
      : 'ok'

  const checks = data?.info ?? {}

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 cursor-default',
            status === 'ok' && 'border-green-500/50 text-green-600',
            status === 'down' && 'border-red-500/50 text-red-600',
            status === 'loading' && 'border-muted-foreground/50 text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              status === 'ok' && 'bg-green-500',
              status === 'down' && 'bg-red-500',
              status === 'loading' && 'bg-muted-foreground animate-pulse',
            )}
          />
          {status === 'loading' ? 'Checking...' : status === 'ok' ? 'Healthy' : 'Unhealthy'}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {status === 'loading' ? (
          <p>Checking health...</p>
        ) : isError ? (
          <p>Could not reach the API</p>
        ) : (
          <div className="space-y-1 text-xs">
            {Object.entries(checks).map(([name, check]) => (
              <div key={name} className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    check.status === 'up' ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
                <span className="capitalize">{name}</span>
                <span className="text-muted-foreground">{check.status}</span>
              </div>
            ))}
            {Object.keys(checks).length === 0 && (
              <p>Status: {data?.status}</p>
            )}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
