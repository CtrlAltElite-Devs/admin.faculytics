import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Eye, EyeOff, Loader2, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCategoryCourses } from '../use-category-courses'

function formatDate(unix: number): string {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface CategoryCourseListProps {
  categoryId: number | null
  categoryName: string
  onBack: () => void
}

export function CategoryCourseList({
  categoryId,
  categoryName,
  onBack,
}: CategoryCourseListProps) {
  const { data, isLoading, error, refetch } = useCategoryCourses(categoryId)
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    if (!filter.trim()) return data.courses
    const term = filter.toLowerCase()
    return data.courses.filter(
      (c) =>
        c.shortname.toLowerCase().includes(term) ||
        c.fullname.toLowerCase().includes(term),
    )
  }, [data, filter])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-8">
          <ArrowLeft className="size-4" />
        </Button>
        <h3 className="truncate text-sm font-medium">{categoryName}</h3>
      </div>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <p className="text-sm text-muted-foreground">
            Failed to load courses
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 size-3.5" />
            Retry
          </Button>
        </div>
      )}

      {data && data.courses.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No courses in this category
        </div>
      )}

      {data && data.courses.length > 0 && (
        <>
          <div className="border-b px-4 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter courses..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No matching courses
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y">
              {filtered.map((course) => (
              <Tooltip key={course.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {course.shortname}
                      </p>
                      <p className="truncate text-sm">{course.fullname}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {course.enrolledusercount
                          ? course.enrolledusercount
                          : '—'}
                      </span>

                      {course.visible === 1 ? (
                        <Eye className="size-3.5 text-muted-foreground" />
                      ) : (
                        <EyeOff className="size-3.5 text-muted-foreground" />
                      )}

                      <button
                        className="flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(String(course.id)).then(
                            () => toast.success('Course ID copied'),
                            () => toast.error('Failed to copy'),
                          )
                        }}
                        title={`Copy Moodle ID: ${course.id}`}
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">
                    Start: {formatDate(course.startdate)}
                  </p>
                  <p className="text-xs">
                    End: {formatDate(course.enddate)}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          </div>
        </>
      )}
    </div>
  )
}
