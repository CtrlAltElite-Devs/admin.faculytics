import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CAMPUSES } from '@/lib/constants'
import { useDebouncedValue, useQuickCoursePreview, useQuickCourseCreate } from '../use-quick-course'
import { ProvisionResultDialog } from './provision-result-dialog'
import type { QuickCourseRequest, ProvisionResultResponse } from '@/types/api'

export function QuickCourseTab() {
  const [courseCode, setCourseCode] = useState('')
  const [descriptiveTitle, setDescriptiveTitle] = useState('')
  const [campus, setCampus] = useState('')
  const [department, setDepartment] = useState('')
  const [program, setProgram] = useState('')
  const [semester, setSemester] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<ProvisionResultResponse | null>(null)

  const previewMutation = useQuickCoursePreview()
  const createMutation = useQuickCourseCreate()

  const formValues: QuickCourseRequest | null =
    courseCode && descriptiveTitle && campus && department && program && semester && startDate && endDate && startDate < endDate
      ? { courseCode, descriptiveTitle, campus, department, program, semester, startDate, endDate }
      : null

  const [debouncedValues] = useDebouncedValue(formValues, 300)

  useEffect(() => {
    if (debouncedValues) {
      previewMutation.mutate(debouncedValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValues])

  const handleCreate = () => {
    if (!formValues) return
    createMutation.mutate(formValues, {
      onSuccess: (data) => setResult(data),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Course Code</Label>
          <Input placeholder="e.g., CS 101" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Descriptive Title</Label>
          <Input
            placeholder="e.g., Introduction to Computer Science"
            value={descriptiveTitle}
            onChange={(e) => setDescriptiveTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Campus</Label>
          <Select value={campus} onValueChange={setCampus}>
            <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
            <SelectContent>
              {CAMPUSES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Input placeholder="e.g., CCS" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Program</Label>
          <Input placeholder="e.g., BSCS" value={program} onChange={(e) => setProgram(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Semester</Label>
          <Select value={semester?.toString() ?? ''} onValueChange={(v) => setSemester(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semester 1</SelectItem>
              <SelectItem value="2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
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

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Live Preview</h3>
          {previewMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading preview...
            </div>
          )}
          {previewMutation.isError && !previewMutation.isPending && (
            <p className="text-sm text-destructive">
              {(previewMutation.error as any)?.body?.message ?? 'Failed to generate preview'}
            </p>
          )}
          {previewMutation.data && !previewMutation.isPending && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Shortname: </span>
                <span className="font-mono">{previewMutation.data.shortname}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category: </span>
                <span className="font-mono">{previewMutation.data.categoryPath}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dates: </span>
                {previewMutation.data.startDate} — {previewMutation.data.endDate}
              </div>
            </div>
          )}
          {!formValues && !previewMutation.isPending && !previewMutation.data && (
            <p className="text-sm text-muted-foreground">Fill all fields to see a preview</p>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleCreate}
        disabled={!formValues || !previewMutation.data || createMutation.isPending}
      >
        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Course
      </Button>

      <ProvisionResultDialog
        result={result}
        open={!!result}
        onClose={() => setResult(null)}
      />
    </div>
  )
}
