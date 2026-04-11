import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CAMPUSES } from '@/lib/constants'
import { useSeedUsers } from '../use-seed-users'
import type { SeedUsersResponse } from '@/types/api'

export function SeedUsersTab() {
  const [count, setCount] = useState('')
  const [role, setRole] = useState<'student' | 'faculty' | ''>('')
  const [campus, setCampus] = useState('')
  const [courseIdsInput, setCourseIdsInput] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [result, setResult] = useState<SeedUsersResponse | null>(null)

  const mutation = useSeedUsers()

  const parsedCount = parseInt(count, 10)
  const parsedCourseIds = courseIdsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
  const invalidIds = courseIdsInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && isNaN(parseInt(s, 10)))
  const validCourseIds = parsedCourseIds.filter((n) => !isNaN(n))
  const uniqueCourseIds = [...new Set(validCourseIds)]

  const isValid =
    parsedCount >= 1 &&
    parsedCount <= 200 &&
    role &&
    campus &&
    uniqueCourseIds.length > 0 &&
    invalidIds.length === 0

  const handleConfirm = () => {
    setConfirmOpen(false)
    mutation.mutate(
      { count: parsedCount, role: role as 'student' | 'faculty', campus, courseIds: uniqueCourseIds },
      {
        onSuccess: (data) => setResult(data),
      },
    )
  }

  const resetForm = () => {
    setCount('')
    setRole('')
    setCampus('')
    setCourseIdsInput('')
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as 'student' | 'faculty')}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
            </SelectContent>
          </Select>
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
          <Label>Course IDs (comma-separated)</Label>
          <Input
            placeholder="e.g., 42, 43, 44"
            value={courseIdsInput}
            onChange={(e) => setCourseIdsInput(e.target.value)}
          />
          {invalidIds.length > 0 && (
            <p className="text-xs text-destructive">
              Invalid course ID: '{invalidIds[0]}'
            </p>
          )}
        </div>
      </div>

      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={!isValid || mutation.isPending}
      >
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate & Enrol
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Seeding</AlertDialogTitle>
            <AlertDialogDescription>
              Generate {parsedCount} {role} users and enrol into {uniqueCourseIds.length} courses?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {result && (
        <div className="space-y-3 rounded-md border p-4">
          <h3 className="font-medium">Result</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="default">{result.usersCreated} users created</Badge>
            {result.usersFailed > 0 && (
              <Badge variant="destructive">{result.usersFailed} failed</Badge>
            )}
            <Badge variant="secondary">{result.enrolmentsCreated} enrolments</Badge>
            <span className="text-muted-foreground">in {result.durationMs}ms</span>
          </div>
          {result.warnings.length > 0 && (
            <div className="space-y-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-600">{w}</p>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={resetForm}>
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
