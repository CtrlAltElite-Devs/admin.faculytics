import { useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
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
import { useCommitSubmissions } from '../use-generate-submissions'
import type { GeneratePreviewResponse, CommitResult } from '@/types/api'

interface PreviewPanelProps {
  data: GeneratePreviewResponse
  versionId: string
  committed: boolean
  onBack: () => void
  onCommitSuccess: (result: CommitResult) => void
}

function getAnswerStyle(value: number, maxScore: number) {
  const ratio = value / maxScore
  if (ratio <= 0.4) return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30'
  if (ratio <= 0.7) return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30'
  return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30'
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function PreviewPanel({
  data,
  versionId,
  committed,
  onBack,
  onCommitSuccess,
}: PreviewPanelProps) {
  const commitMutation = useCommitSubmissions()

  useEffect(() => {
    if (!commitMutation.isPending) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [commitMutation.isPending])

  const handleCommit = () => {
    commitMutation.mutate(
      { versionId, rows: data.rows },
      {
        onSuccess: (result) => onCommitSuccess(result),
        onError: () => toast.error('Failed to commit submissions'),
      },
    )
  }

  const { metadata, questions, rows } = data

  return (
    <div className="space-y-4">
      {/* Partial-submission warning */}
      {metadata.alreadySubmitted > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">
              {metadata.alreadySubmitted} of {metadata.totalEnrolled} students already submitted.
            </p>
            <p className="mt-0.5 text-amber-700/80 dark:text-amber-400">
              Only the remaining {metadata.availableStudents} students are shown below.
            </p>
          </div>
        </div>
      )}

      {/* Metadata card */}
      <Card className="panel-surface">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-5 text-sm md:grid-cols-4">
            <MetaField label="Faculty">
              {metadata.faculty.fullName}
              <span className="ml-1 text-xs text-muted-foreground">
                @{metadata.faculty.username}
              </span>
            </MetaField>
            <MetaField label="Course">
              {metadata.course.fullname}
              <span className="ml-1 text-xs text-muted-foreground">
                ({metadata.course.shortname})
              </span>
            </MetaField>
            <MetaField label="Semester">
              {metadata.semester.label}
              <span className="ml-1 text-xs text-muted-foreground">
                {metadata.semester.academicYear}
              </span>
            </MetaField>
            <MetaField label="Version">
              <span className="font-mono">v{metadata.version.versionNumber}</span>
            </MetaField>
          </div>

          <div className="flex items-center gap-2 border-t px-5 py-3">
            <Badge variant="secondary" className="text-xs">
              {metadata.totalEnrolled} enrolled
            </Badge>
            {metadata.alreadySubmitted > 0 && (
              <Badge
                variant="outline"
                className="border-amber-200 text-xs text-amber-700 dark:border-amber-800/60 dark:text-amber-400"
              >
                {metadata.alreadySubmitted} already submitted
              </Badge>
            )}
            <Badge className="bg-brand-blue/10 text-xs text-brand-blue hover:bg-brand-blue/10">
              {metadata.generatingCount} generating
            </Badge>
            {metadata.generatingCount < metadata.availableStudents && (
              <Badge
                variant="outline"
                className="border-brand-blue/30 text-xs text-brand-blue"
              >
                Sampled {metadata.generatingCount} of {metadata.availableStudents}
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {rows.length} row{rows.length !== 1 ? 's' : ''} in preview
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preview table */}
      <div className="data-table-wrapper">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="data-table-header">
              <TableRow className="border-b border-border/70 hover:bg-transparent">
                <TableHead className="data-table-head sticky left-0 z-10 bg-blue-50 dark:bg-blue-900/10 min-w-[140px]">
                  Student
                </TableHead>
                {questions.map((q, i) => (
                  <TableHead
                    key={q.id}
                    className="data-table-head min-w-[52px] text-center"
                  >
                    <Tooltip>
                      <TooltipTrigger className="cursor-default">
                        Q{i + 1}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs text-muted-foreground">{q.sectionName}</p>
                        <p>{q.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                ))}
                <TableHead className="data-table-head min-w-[200px]">Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.externalId} className="data-table-row">
                  <TableCell className="data-table-cell sticky left-0 z-10 bg-background font-medium">
                    {row.username}
                  </TableCell>
                  {questions.map((q) => {
                    const val = row.answers[q.id]
                    return (
                      <TableCell
                        key={q.id}
                        className={`data-table-cell text-center font-mono text-sm font-semibold tabular-nums ${getAnswerStyle(val, metadata.maxScore)}`}
                      >
                        {val}
                      </TableCell>
                    )
                  })}
                  <TableCell className="data-table-cell max-w-[300px] text-sm">
                    {row.comment ? (
                      <Tooltip>
                        <TooltipTrigger className="cursor-default text-left">
                          {truncate(row.comment, 40)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>{row.comment}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={commitMutation.isPending}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        {committed ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            <span className="font-medium">Committed</span>
          </div>
        ) : (
          <Button
            onClick={handleCommit}
            disabled={commitMutation.isPending}
            className="bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            {commitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Committing…
              </>
            ) : (
              `Commit ${rows.length} Submissions`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}
