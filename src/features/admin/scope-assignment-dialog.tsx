import { useMemo, useState } from 'react'
import { Building2, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDepartments, usePrograms } from './use-admin-filters'
import { useUpdateScopeAssignment } from './use-scope-assignment'
import type {
  AdminUserDetail,
  AdminUserScopedRelation,
  FilterOption,
  UpdateScopeAssignmentRequest,
} from '@/types/api'

interface ScopeAssignmentDialogProps {
  user: AdminUserDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

function relationToOption(
  relation: AdminUserScopedRelation | null,
): FilterOption | null {
  if (!relation) return null
  return {
    id: relation.id,
    code: relation.code,
    name: relation.name ?? null,
  }
}

function spliceCurrent(
  list: FilterOption[] | undefined,
  current: FilterOption | null,
): FilterOption[] {
  const base = list ?? []
  if (current && !base.find((opt) => opt.id === current.id)) {
    return [current, ...base]
  }
  return base
}

function describeOption(opt: FilterOption): string {
  return opt.name ? `${opt.code} — ${opt.name}` : opt.code
}

export function ScopeAssignmentDialog({
  user,
  open,
  onOpenChange,
}: ScopeAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Remount the form on every open so React re-derives initial state
            from the latest user values. Avoids a useEffect+setState dance. */}
        {open && (
          <ScopeAssignmentForm
            key={`${user.id}-${user.department?.id ?? 'none'}-${user.program?.id ?? 'none'}`}
            user={user}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ScopeAssignmentFormProps {
  user: AdminUserDetail
  onClose: () => void
}

function ScopeAssignmentForm({ user, onClose }: ScopeAssignmentFormProps) {
  const [departmentId, setDepartmentId] = useState(user.department?.id ?? '')
  const [programId, setProgramId] = useState(user.program?.id ?? '')

  const departmentsQuery = useDepartments()
  const programsQuery = usePrograms(departmentId || undefined)

  const departmentOptions = useMemo(
    () => spliceCurrent(departmentsQuery.data, relationToOption(user.department)),
    [departmentsQuery.data, user.department],
  )

  const programOptions = useMemo(
    () => spliceCurrent(programsQuery.data, relationToOption(user.program)),
    [programsQuery.data, user.program],
  )

  const updateMutation = useUpdateScopeAssignment(user.id)

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value)
    if (value !== (user.department?.id ?? '')) {
      // Reset program when department changes — matches users-page filter UX.
      setProgramId('')
    } else {
      setProgramId(user.program?.id ?? '')
    }
  }

  const hasDepartmentChange = departmentId !== (user.department?.id ?? '')
  const hasProgramChange = programId !== (user.program?.id ?? '')
  const hasAnyChange = hasDepartmentChange || hasProgramChange

  const buildSubmitBody = (): UpdateScopeAssignmentRequest => {
    const body: UpdateScopeAssignmentRequest = {}
    if (hasDepartmentChange) body.departmentId = departmentId || null
    if (hasProgramChange) body.programId = programId || null
    return body
  }

  const handleSubmit = () => {
    if (!hasAnyChange) return
    updateMutation.mutate(buildSubmitBody(), {
      onSuccess: onClose,
    })
  }

  const handleResetDepartment = () => {
    updateMutation.mutate({ departmentId: null }, { onSuccess: onClose })
  }

  const handleResetProgram = () => {
    updateMutation.mutate({ programId: null }, { onSuccess: onClose })
  }

  return (
    <>
      <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Edit Institutional Assignment
          </DialogTitle>
          <DialogDescription>
            Override the department and program for {user.fullName}. Setting a
            value flips its source to <strong>manual</strong> and protects it
            from sync overwrites.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2">
          {/* Department */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="scope-department" className="text-xs text-muted-foreground">
                Department
              </Label>
              {user.departmentSource === 'manual' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto gap-1 px-1.5 py-0.5 text-[11px] text-amber-600 hover:text-amber-700"
                  onClick={handleResetDepartment}
                  disabled={updateMutation.isPending}
                >
                  <RotateCcw className="size-3" />
                  Reset to Auto
                </Button>
              )}
            </div>
            <Select
              value={departmentId}
              onValueChange={handleDepartmentChange}
              disabled={updateMutation.isPending || departmentsQuery.isLoading}
            >
              <SelectTrigger id="scope-department">
                <SelectValue
                  placeholder={
                    departmentsQuery.isLoading ? 'Loading…' : 'Select department'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {describeOption(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Program */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="scope-program" className="text-xs text-muted-foreground">
                Program
              </Label>
              {user.programSource === 'manual' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto gap-1 px-1.5 py-0.5 text-[11px] text-amber-600 hover:text-amber-700"
                  onClick={handleResetProgram}
                  disabled={updateMutation.isPending}
                >
                  <RotateCcw className="size-3" />
                  Reset to Auto
                </Button>
              )}
            </div>
            <Select
              value={programId}
              onValueChange={setProgramId}
              disabled={
                updateMutation.isPending ||
                !departmentId ||
                programsQuery.isLoading
              }
            >
              <SelectTrigger id="scope-program">
                <SelectValue
                  placeholder={
                    !departmentId
                      ? 'Pick a department first'
                      : programsQuery.isLoading
                        ? 'Loading…'
                        : 'Select program'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {programOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {describeOption(opt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!hasAnyChange || updateMutation.isPending}
          className="gap-1.5"
        >
          {updateMutation.isPending && (
            <Loader2 className="size-3.5 animate-spin" />
          )}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}
