import { useState, useEffect } from 'react'
import { ArrowLeft, FolderTree, Loader2 } from 'lucide-react'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useSemesters } from '../use-semesters'
import { useDepartmentsBySemester } from '../use-departments-by-semester'
import { useProgramsByDepartment } from '../use-programs-by-department'
import { useCategoryCourses } from '../use-category-courses'
import { useSeedUsers } from '../use-seed-users'
import type { MoodleCoursePreview, SeedUsersResponse } from '@/types/api'

type View = 'input' | 'preview'

interface SeedUsersTabProps {
  onBrowse: () => void
}

export function SeedUsersTab({ onBrowse }: SeedUsersTabProps) {
  // Cascade state
  const [semesterId, setSemesterId] = useState<string>()
  const [departmentId, setDepartmentId] = useState<string>()
  const [programId, setProgramId] = useState<string>()

  // View state
  const [view, setView] = useState<View>('input')

  // Course snapshot for stable checkbox indices
  const [courseSnapshot, setCourseSnapshot] = useState<MoodleCoursePreview[]>([])
  const [checked, setChecked] = useState<Set<number>>(new Set())

  // Manual IDs
  const [manualIdsInput, setManualIdsInput] = useState('')
  const [manualIdsExpanded, setManualIdsExpanded] = useState(false)

  // Form
  const [role, setRole] = useState<'student' | 'faculty' | ''>('')
  const [count, setCount] = useState('')

  // Result
  const [result, setResult] = useState<SeedUsersResponse | null>(null)

  // Data hooks
  const { data: semesters } = useSemesters()
  const { data: departments } = useDepartmentsBySemester(semesterId)
  const { data: programs } = useProgramsByDepartment(departmentId)

  // Derive moodleCategoryId from selected program
  const moodleCategoryId =
    programs?.find((p) => p.id === programId)?.moodleCategoryId ?? null

  const categoryCourses = useCategoryCourses(moodleCategoryId)

  // Mutation
  const mutation = useSeedUsers()

  // Snapshot courses when category data arrives
  useEffect(() => {
    if (
      categoryCourses.data &&
      categoryCourses.data.courses.length > 0 &&
      categoryCourses.data.categoryId === moodleCategoryId
    ) {
      setCourseSnapshot(categoryCourses.data.courses)
      setChecked(new Set())
    }
  }, [categoryCourses.data?.categoryId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cascade handlers
  const handleSemesterChange = (id: string) => {
    setSemesterId(id)
    setDepartmentId(undefined)
    setProgramId(undefined)
    setCourseSnapshot([])
    setChecked(new Set())
  }

  const handleDepartmentChange = (id: string) => {
    setDepartmentId(id)
    setProgramId(undefined)
    setCourseSnapshot([])
    setChecked(new Set())
  }

  const handleProgramChange = (id: string) => {
    setProgramId(id)
    setCourseSnapshot([])
    setChecked(new Set())
  }

  // Checkbox handlers
  const toggleRow = (idx: number) => {
    const next = new Set(checked)
    next.has(idx) ? next.delete(idx) : next.add(idx)
    setChecked(next)
  }

  const toggleAll = () => {
    if (checked.size === courseSnapshot.length) {
      setChecked(new Set())
    } else {
      setChecked(new Set(courseSnapshot.map((_, i) => i)))
    }
  }

  // Manual IDs parsing
  const parsedManualIds = manualIdsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
  const invalidIds = manualIdsInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false
      const n = parseInt(s, 10)
      return isNaN(n) || n <= 0
    })
  const validManualIds = parsedManualIds.filter((n) => !isNaN(n) && n > 0)

  // Derived values for submission
  const pickerIds = [...checked].map((i) => courseSnapshot[i].id)
  const allCourseIds = [...new Set([...pickerIds, ...validManualIds])]
  const campusCode = semesters?.find((s) => s.id === semesterId)?.campusCode

  const parsedCount = parseInt(count, 10)
  const canPreview =
    role !== '' &&
    parsedCount >= 1 &&
    parsedCount <= 200 &&
    allCourseIds.length > 0 &&
    invalidIds.length === 0 &&
    !!campusCode

  // Reset all state
  const resetForm = () => {
    setSemesterId(undefined)
    setDepartmentId(undefined)
    setProgramId(undefined)
    setCourseSnapshot([])
    setChecked(new Set())
    setManualIdsInput('')
    setManualIdsExpanded(false)
    setRole('')
    setCount('')
    setResult(null)
    setView('input')
    mutation.reset()
  }

  // Selected courses for preview
  const selectedCourses = [...checked].sort().map((i) => courseSnapshot[i])

  // ── Result Panel ──
  if (view === 'preview' && result) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Seed Result</h3>
        <div className="rounded-md border p-4 space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="default">{result.usersCreated} users created</Badge>
            {result.usersFailed > 0 && (
              <Badge variant="destructive">{result.usersFailed} failed</Badge>
            )}
            <Badge variant="secondary">
              {result.enrolmentsCreated} enrolments
            </Badge>
            <span className="text-muted-foreground">
              in {result.durationMs}ms
            </span>
          </div>
          {result.warnings.length > 0 && (
            <div className="space-y-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-600">
                  {w}
                </p>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={resetForm}>
            Reset
          </Button>
        </div>
      </div>
    )
  }

  // ── Preview View ──
  if (view === 'preview') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setView('input')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        <div className="rounded-md border p-4 space-y-2">
          <p className="text-sm">
            Generate <strong>{parsedCount}</strong>{' '}
            <strong>{role}</strong> users on campus{' '}
            <strong>{campusCode}</strong>
          </p>
          <p className="text-sm">
            Enrol into <strong>{allCourseIds.length}</strong> courses:
          </p>
        </div>

        {selectedCourses.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              Selected Courses ({selectedCourses.length})
            </h3>
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-56">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shortname</TableHead>
                      <TableHead>Fullname</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCourses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">
                          {c.shortname}
                        </TableCell>
                        <TableCell className="text-xs">{c.fullname}</TableCell>
                        <TableCell className="text-xs">
                          {c.enrolledusercount ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        )}

        {validManualIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedCourses.length > 0
              ? `Additionally enrolling into ${validManualIds.length} courses by ID: ${validManualIds.join(', ')}`
              : `Enrolling into ${validManualIds.length} courses by ID: ${validManualIds.join(', ')}`}
          </p>
        )}

        <Button
          onClick={() =>
            mutation.mutate(
              {
                count: parsedCount,
                role: role as 'student' | 'faculty',
                campus: campusCode!,
                courseIds: allCourseIds,
              },
              { onSuccess: (data) => setResult(data) },
            )
          }
          disabled={mutation.isPending}
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate {parsedCount} {role === 'student' ? 'Students' : 'Faculty'}
        </Button>
      </div>
    )
  }

  // ── Input View ──
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
                  {d.code}
                  {d.name ? ` - ${d.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Program</Label>
          <Select
            value={programId ?? ''}
            onValueChange={handleProgramChange}
            disabled={!departmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code}
                  {p.name ? ` - ${p.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Role + Count */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as 'student' | 'faculty')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Count (1-200)</Label>
          <Input
            type="number"
            min={1}
            max={200}
            placeholder="e.g., 10"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
      </div>

      {/* Course picker */}
      {programId && (
        <div className="space-y-3">
          <Label>Courses</Label>

          {categoryCourses.isLoading && courseSnapshot.length === 0 && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading courses...
            </div>
          )}

          {categoryCourses.isError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
              <span>Failed to load courses from Moodle</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => categoryCourses.refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {!categoryCourses.isLoading &&
            !categoryCourses.isError &&
            courseSnapshot.length === 0 &&
            categoryCourses.data && (
              <p className="text-sm text-muted-foreground py-2">
                No courses found in this category
              </p>
            )}

          {courseSnapshot.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-72">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <Checkbox
                          checked={
                            courseSnapshot.length > 0 &&
                            checked.size === courseSnapshot.length
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Shortname</TableHead>
                      <TableHead>Fullname</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseSnapshot.map((c, i) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Checkbox
                            checked={checked.has(i)}
                            onCheckedChange={() => toggleRow(i)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {c.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {c.shortname}
                        </TableCell>
                        <TableCell className="text-xs">{c.fullname}</TableCell>
                        <TableCell className="text-xs">
                          {c.enrolledusercount ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Add by ID escape hatch */}
          <Collapsible
            open={manualIdsExpanded}
            onOpenChange={setManualIdsExpanded}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Add courses by ID
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Input
                placeholder="e.g., 42, 43, 44"
                value={manualIdsInput}
                onChange={(e) => setManualIdsInput(e.target.value)}
              />
              {invalidIds.length > 0 && (
                <p className="text-xs text-destructive">
                  Invalid course IDs: {invalidIds.join(', ')}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={() => setView('preview')} disabled={!canPreview}>
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
