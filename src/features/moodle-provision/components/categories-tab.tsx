import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CAMPUSES } from '@/lib/constants'
import { useProvisionCategories } from '../use-provision-categories'
import { ProvisionResultDialog } from './provision-result-dialog'
import type { ProvisionResultResponse } from '@/types/api'

interface DeptEntry {
  code: string
  programs: string[]
}

export function CategoriesTab() {
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([])
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [departments, setDepartments] = useState<DeptEntry[]>([])
  const [deptInput, setDeptInput] = useState('')
  const [programInputs, setProgramInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ProvisionResultResponse | null>(null)

  const mutation = useProvisionCategories()

  const toggleCampus = (campus: string) =>
    setSelectedCampuses((prev) =>
      prev.includes(campus) ? prev.filter((c) => c !== campus) : [...prev, campus],
    )

  const toggleSemester = (sem: number) =>
    setSelectedSemesters((prev) =>
      prev.includes(sem) ? prev.filter((s) => s !== sem) : [...prev, sem],
    )

  const addDepartment = () => {
    const code = deptInput.trim().toUpperCase()
    if (!code || departments.some((d) => d.code === code)) return
    setDepartments([...departments, { code, programs: [] }])
    setDeptInput('')
  }

  const removeDepartment = (code: string) =>
    setDepartments(departments.filter((d) => d.code !== code))

  const addProgram = (deptCode: string) => {
    const prog = (programInputs[deptCode] ?? '').trim().toUpperCase()
    if (!prog) return
    setDepartments(
      departments.map((d) =>
        d.code === deptCode && !d.programs.includes(prog)
          ? { ...d, programs: [...d.programs, prog] }
          : d,
      ),
    )
    setProgramInputs({ ...programInputs, [deptCode]: '' })
  }

  const removeProgram = (deptCode: string, prog: string) =>
    setDepartments(
      departments.map((d) =>
        d.code === deptCode ? { ...d, programs: d.programs.filter((p) => p !== prog) } : d,
      ),
    )

  const isValid =
    selectedCampuses.length > 0 &&
    selectedSemesters.length > 0 &&
    startDate &&
    endDate &&
    startDate < endDate &&
    departments.length > 0 &&
    departments.every((d) => d.programs.length > 0)

  const handleSubmit = () => {
    mutation.mutate(
      {
        campuses: selectedCampuses,
        semesters: selectedSemesters,
        startDate,
        endDate,
        departments,
      },
      { onSuccess: (data) => setResult(data) },
    )
  }

  const resetForm = () => {
    setSelectedCampuses([])
    setSelectedSemesters([])
    setStartDate('')
    setEndDate('')
    setDepartments([])
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Campuses</Label>
        <div className="flex flex-wrap gap-3">
          {CAMPUSES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedCampuses.includes(c)}
                onCheckedChange={() => toggleCampus(c)}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Semesters</Label>
        <div className="flex gap-4">
          {[1, 2].map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedSemesters.includes(s)}
                onCheckedChange={() => toggleSemester(s)}
              />
              Semester {s}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Departments & Programs</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Department code (e.g., CCS)"
            value={deptInput}
            onChange={(e) => setDeptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
          />
          <Button variant="outline" size="icon" onClick={addDepartment}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {departments.map((dept) => (
          <div key={dept.code} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-medium text-sm">{dept.code}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeDepartment(dept.code)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {dept.programs.map((prog) => (
                <Badge key={prog} variant="secondary" className="gap-1">
                  {prog}
                  <button onClick={() => removeProgram(dept.code, prog)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Program code (e.g., BSCS)"
                className="h-8 text-sm"
                value={programInputs[dept.code] ?? ''}
                onChange={(e) =>
                  setProgramInputs({ ...programInputs, [dept.code]: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && addProgram(dept.code)}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => addProgram(dept.code)}
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={!isValid || mutation.isPending}>
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Provision Categories
      </Button>

      <ProvisionResultDialog result={result} open={!!result} onClose={resetForm} />
    </div>
  )
}
