import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CsvDropZone } from './csv-drop-zone'
import { ProvisionResultDialog } from './provision-result-dialog'
import { usePreviewCourses } from '../use-preview-courses'
import { useExecuteCourses } from '../use-execute-courses'
import type {
  CoursePreviewResponse,
  ProvisionResultResponse,
  ConfirmedCourseRow,
} from '@/types/api'

type View = 'upload' | 'preview'

export function CoursesBulkTab() {
  const [view, setView] = useState<View>('upload')
  const [campus, setCampus] = useState('')
  const [department, setDepartment] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CoursePreviewResponse | null>(null)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<ProvisionResultResponse | null>(null)

  const previewMutation = usePreviewCourses()
  const executeMutation = useExecuteCourses()

  const canPreview = campus && department && startDate && endDate && startDate < endDate && file

  const handlePreview = () => {
    if (!file) return
    previewMutation.mutate(
      { file, context: { campus, department, startDate, endDate } },
      {
        onSuccess: (data) => {
          setPreview(data)
          setChecked(new Set(data.valid.map((_, i) => i)))
          setView('preview')
        },
      },
    )
  }

  const handleExecute = () => {
    if (!preview) return
    const rows: ConfirmedCourseRow[] = preview.valid
      .filter((_, i) => checked.has(i))
      .map((row) => ({
        courseCode: row.courseCode,
        descriptiveTitle: row.fullname,
        program: row.program,
        semester: row.semester,
        categoryId: row.categoryId,
      }))
    executeMutation.mutate(
      { rows, campus, department, startDate, endDate },
      { onSuccess: (data) => setResult(data) },
    )
  }

  const toggleRow = (idx: number) => {
    const next = new Set(checked)
    next.has(idx) ? next.delete(idx) : next.add(idx)
    setChecked(next)
  }

  const toggleAll = () => {
    if (!preview) return
    if (checked.size === preview.valid.length) {
      setChecked(new Set())
    } else {
      setChecked(new Set(preview.valid.map((_, i) => i)))
    }
  }

  const resetForm = () => {
    setView('upload')
    setCampus('')
    setDepartment('')
    setStartDate('')
    setEndDate('')
    setFile(null)
    setPreview(null)
    setChecked(new Set())
    setResult(null)
  }

  if (view === 'upload') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Campus</Label>
            <Input placeholder="e.g., UCMN" value={campus} onChange={(e) => setCampus(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input placeholder="e.g., CCS" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Curriculum CSV</Label>
          <CsvDropZone file={file} onFileSelect={setFile} />
        </div>

        <Button onClick={handlePreview} disabled={!canPreview || previewMutation.isPending}>
          {previewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Preview
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setView('upload')}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      {preview?.shortnameNote && (
        <div className="rounded-md border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm text-blue-700 dark:text-blue-400">
          {preview.shortnameNote}
        </div>
      )}

      {preview && preview.valid.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Valid Courses ({preview.valid.length})
          </h3>
          <ScrollArea className="max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={checked.size === preview.valid.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Shortname</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Dates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.valid.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Checkbox checked={checked.has(i)} onCheckedChange={() => toggleRow(i)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.shortname}</TableCell>
                    <TableCell className="text-xs">{row.fullname}</TableCell>
                    <TableCell className="font-mono text-xs">{row.categoryPath}</TableCell>
                    <TableCell className="text-xs">
                      {row.startDate} — {row.endDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {preview && preview.skipped.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-amber-600">
            Skipped ({preview.skipped.length})
          </h3>
          <div className="space-y-1">
            {preview.skipped.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Badge variant="secondary">Row {s.rowNumber}</Badge>
                <span className="font-mono">{s.courseCode}</span>
                <span className="text-muted-foreground">{s.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview && preview.errors.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-destructive">
            Errors ({preview.errors.length})
          </h3>
          <div className="space-y-1">
            {preview.errors.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Badge variant="destructive">Row {e.rowNumber}</Badge>
                <span className="text-muted-foreground">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleExecute}
        disabled={checked.size === 0 || executeMutation.isPending}
      >
        {executeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create {checked.size} Courses
      </Button>

      <ProvisionResultDialog result={result} open={!!result} onClose={resetForm} />
    </div>
  )
}
