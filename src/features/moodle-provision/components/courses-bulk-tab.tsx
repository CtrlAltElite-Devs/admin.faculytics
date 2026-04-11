import { useState, useRef } from 'react'
import { ArrowLeft, FolderTree, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProvisionResultDialog } from './provision-result-dialog'
import { useSemesters } from '../use-semesters'
import { useDepartmentsBySemester } from '../use-departments-by-semester'
import { useProgramsByDepartment } from '../use-programs-by-department'
import { usePreviewBulkCourses } from '../use-preview-courses'
import { useExecuteBulkCourses } from '../use-execute-courses'
import type {
  CoursePreviewResponse,
  ProvisionResultResponse,
} from '@/types/api'

type View = 'input' | 'preview'

interface CourseEntry {
  id: number
  courseCode: string
  descriptiveTitle: string
}

interface CoursesBulkTabProps {
  onBrowse: () => void
}

export function CoursesBulkTab({ onBrowse }: CoursesBulkTabProps) {
  // Cascade state
  const [semesterId, setSemesterId] = useState<string>()
  const [departmentId, setDepartmentId] = useState<string>()
  const [programId, setProgramId] = useState<string>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Course table state
  const nextId = useRef(1)
  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: 0, courseCode: '', descriptiveTitle: '' },
  ])

  // View state
  const [view, setView] = useState<View>('input')
  const [preview, setPreview] = useState<CoursePreviewResponse | null>(null)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<ProvisionResultResponse | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Data hooks
  const { data: semesters } = useSemesters()
  const { data: departments } = useDepartmentsBySemester(semesterId)
  const { data: programs } = useProgramsByDepartment(departmentId)

  // Mutation hooks
  const previewMutation = usePreviewBulkCourses()
  const executeMutation = useExecuteBulkCourses()

  // Derived
  const selectedSemester = semesters?.find((s) => s.id === semesterId)

  const validCourses = courses.filter(
    (c) => c.courseCode.trim() && c.descriptiveTitle.trim(),
  )
  const canPreview =
    semesterId &&
    departmentId &&
    programId &&
    startDate &&
    endDate &&
    startDate < endDate &&
    validCourses.length > 0

  // Cascade handlers
  const handleSemesterChange = (id: string) => {
    setSemesterId(id)
    setDepartmentId(undefined)
    setProgramId(undefined)

    const sem = semesters?.find((s) => s.id === id)
    if (sem) {
      setStartDate(sem.startDate)
      setEndDate(sem.endDate)
    }
  }

  const handleDepartmentChange = (id: string) => {
    setDepartmentId(id)
    setProgramId(undefined)
  }

  // Course table handlers
  const updateCourse = (index: number, field: keyof CourseEntry, value: string) => {
    setCourses((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
    setValidationError(null)
  }

  const addRow = () => {
    setCourses((prev) => [...prev, { id: nextId.current++, courseCode: '', descriptiveTitle: '' }])
  }

  const removeRow = (index: number) => {
    setCourses((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  // Preview
  const handlePreview = () => {
    // Check for duplicate course codes
    const codes = validCourses.map((c) => c.courseCode.trim().toUpperCase())
    const dupes = codes.filter((code, i) => codes.indexOf(code) !== i)
    if (dupes.length > 0) {
      setValidationError(`Duplicate course codes: ${[...new Set(dupes)].join(', ')}`)
      return
    }

    setValidationError(null)
    previewMutation.mutate(
      {
        semesterId: semesterId!,
        departmentId: departmentId!,
        programId: programId!,
        startDate,
        endDate,
        courses: validCourses.map((c) => ({
          courseCode: c.courseCode.trim(),
          descriptiveTitle: c.descriptiveTitle.trim(),
        })),
      },
      {
        onSuccess: (data) => {
          setPreview(data)
          setChecked(new Set(data.valid.map((_, i) => i)))
          setView('preview')
        },
      },
    )
  }

  // Execute
  const handleExecute = () => {
    if (!preview) return
    const selectedRows = preview.valid
      .filter((_, i) => checked.has(i))
      .map((row) => ({
        courseCode: row.courseCode,
        descriptiveTitle: row.fullname,
        categoryId: row.categoryId,
      }))

    executeMutation.mutate(
      {
        semesterId: semesterId!,
        departmentId: departmentId!,
        programId: programId!,
        startDate,
        endDate,
        courses: selectedRows,
      },
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
    setView('input')
    setSemesterId(undefined)
    setDepartmentId(undefined)
    setProgramId(undefined)
    setStartDate('')
    setEndDate('')
    nextId.current = 1
    setCourses([{ id: 0, courseCode: '', descriptiveTitle: '' }])
    setPreview(null)
    setChecked(new Set())
    setResult(null)
    setValidationError(null)
  }

  // ── Preview view ──
  if (view === 'preview') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setView('input')}>
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
            <div className="rounded-md border overflow-hidden">
            <ScrollArea className="h-72">
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
                        <Checkbox
                          checked={checked.has(i)}
                          onCheckedChange={() => toggleRow(i)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.shortname}
                      </TableCell>
                      <TableCell className="text-xs">{row.fullname}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.categoryPath}
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.startDate} — {row.endDate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            </div>
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
          {executeMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create {checked.size} Courses
        </Button>

        <ProvisionResultDialog
          result={result}
          open={!!result}
          onClose={resetForm}
        />
      </div>
    )
  }

  // ── Input view ──
  return (
    <div className="space-y-6">
      {/* Cascade dropdowns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Semester</Label>
          <Select value={semesterId ?? ''} onValueChange={handleSemesterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.campusCode} - {s.label} ({s.academicYear})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={departmentId ?? ''}
            onValueChange={handleDepartmentChange}
            disabled={!semesterId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.code}{d.name ? ` - ${d.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Program</Label>
          <Select
            value={programId ?? ''}
            onValueChange={setProgramId}
            disabled={!departmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code}{p.name ? ` - ${p.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {selectedSemester && startDate !== selectedSemester.startDate && (
            <p className="text-xs text-muted-foreground">
              Default: {selectedSemester.startDate}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {selectedSemester && endDate !== selectedSemester.endDate && (
            <p className="text-xs text-muted-foreground">
              Default: {selectedSemester.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Inline course table */}
      {semesterId && departmentId && programId && (
        <div className="space-y-3">
          <Label>Courses</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Descriptive Title</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, i) => (
                <TableRow key={course.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="e.g., CS 101"
                      value={course.courseCode}
                      onChange={(e) => updateCourse(i, 'courseCode', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="e.g., Introduction to Computer Science"
                      value={course.descriptiveTitle}
                      onChange={(e) =>
                        updateCourse(i, 'descriptiveTitle', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(i)}
                      disabled={courses.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-4 w-4" /> Add Row
          </Button>
        </div>
      )}

      {validationError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {validationError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handlePreview}
          disabled={!canPreview || previewMutation.isPending}
        >
          {previewMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={onBrowse}>
          <FolderTree className="mr-2 h-4 w-4" />
          Browse existing
        </Button>
      </div>
    </div>
  )
}
