import { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function formatRelative(date: Date): string {
  const now = Date.now()
  const diffMs = now - date.getTime()

  if (diffMs < 0) return 'just now'

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface RelativeTimeProps {
  date: string | Date | number
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const parsed = new Date(date)
  const [text, setText] = useState(() => formatRelative(parsed))

  useEffect(() => {
    const id = setInterval(() => setText(formatRelative(parsed)), 30_000)
    return () => clearInterval(id)
  }, [parsed.getTime()])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{text}</span>
      </TooltipTrigger>
      <TooltipContent>{parsed.toLocaleString()}</TooltipContent>
    </Tooltip>
  )
}
