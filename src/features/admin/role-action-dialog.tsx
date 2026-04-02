import { useState } from 'react'
import { Loader2, Plus, Shield, Trash2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  useAssignRole,
  useDeanEligibleCategories,
  useRemoveRole,
} from './use-institutional-roles'
import { UserRole } from '@/types/api'
import type { AdminUserItem, InstitutionalRole } from '@/types/api'

const INSTITUTIONAL_ROLES: InstitutionalRole[] = [UserRole.DEAN, UserRole.CHAIRPERSON]

interface RoleActionDialogProps {
  user: AdminUserItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleActionDialog({
  user,
  open,
  onOpenChange,
}: RoleActionDialogProps) {
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()
  const deanCategories = useDeanEligibleCategories(user?.id)

  // Assign form state
  const [assignRoleValue, setAssignRoleValue] = useState<InstitutionalRole>(UserRole.DEAN)
  const [assignCategoryId, setAssignCategoryId] = useState('')

  // Remove confirmation state
  const [confirmRemove, setConfirmRemove] = useState<{
    role: InstitutionalRole
  } | null>(null)
  const [removeCategoryId, setRemoveCategoryId] = useState('')

  if (!user) return null

  const institutionalRoles = user.roles.filter((r) =>
    INSTITUTIONAL_ROLES.includes(r as InstitutionalRole),
  ) as InstitutionalRole[]

  const otherRoles = user.roles.filter(
    (r) => !INSTITUTIONAL_ROLES.includes(r as InstitutionalRole),
  )

  const handleAssign = () => {
    const catId = Number(assignCategoryId)
    if (!Number.isInteger(catId) || catId <= 0) return
    assignRole.mutate(
      {
        userId: user.id,
        role: assignRoleValue,
        moodleCategoryId: catId,
      },
      {
        onSuccess: () => {
          setAssignCategoryId('')
          onOpenChange(false)
        },
      },
    )
  }

  const handleRemove = () => {
    if (!confirmRemove) return
    const catId = Number(removeCategoryId)
    if (!Number.isInteger(catId) || catId <= 0) return
    removeRole.mutate(
      {
        userId: user.id,
        role: confirmRemove.role,
        moodleCategoryId: catId,
      },
      {
        onSuccess: () => {
          setConfirmRemove(null)
          setRemoveCategoryId('')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Manage Roles
            </DialogTitle>
            <DialogDescription>
              {user.fullName} ({user.userName})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Current roles */}
            <div>
              <Label className="text-xs text-muted-foreground">Current Roles</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {otherRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
                {institutionalRoles.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="text-xs gap-1 border-purple-300 text-purple-700 bg-purple-50"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => setConfirmRemove({ role })}
                      className="ml-0.5 rounded-full hover:bg-purple-200 p-0.5 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Badge>
                ))}
                {user.roles.length === 0 && (
                  <span className="text-xs text-muted-foreground">No roles</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Assign role form */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Assign Institutional Role</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select
                    value={assignRoleValue}
                    onValueChange={(v) => {
                      setAssignRoleValue(v as InstitutionalRole)
                      setAssignCategoryId('')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTITUTIONAL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {assignRoleValue === UserRole.DEAN ? 'Department' : 'Moodle Category ID'}
                  </Label>
                  {assignRoleValue === UserRole.DEAN ? (
                    <Select
                      value={assignCategoryId}
                      onValueChange={setAssignCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          deanCategories.isLoading
                            ? 'Loading...'
                            : deanCategories.data?.length === 0
                              ? 'No eligible departments'
                              : 'Select department'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {(deanCategories.data ?? []).map((cat) => (
                          <SelectItem
                            key={cat.moodleCategoryId}
                            value={String(cat.moodleCategoryId)}
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      placeholder="e.g. 42"
                      value={assignCategoryId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAssignCategoryId(e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
              {assignCategoryId && (
                <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-xs space-y-1">
                  <p className="font-medium text-muted-foreground">Assignment Summary</p>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{assignRoleValue}</span>
                    {assignRoleValue === UserRole.DEAN && (() => {
                      const selected = deanCategories.data?.find(
                        (c) => String(c.moodleCategoryId) === assignCategoryId,
                      )
                      return selected ? (
                        <>
                          <span className="text-muted-foreground">Department</span>
                          <span className="font-medium">{selected.name}</span>
                        </>
                      ) : null
                    })()}
                    {assignRoleValue === UserRole.CHAIRPERSON && (
                      <>
                        <span className="text-muted-foreground">Category ID</span>
                        <span className="font-medium">{assignCategoryId}</span>
                      </>
                    )}
                    {user.campus && (
                      <>
                        <span className="text-muted-foreground">Campus</span>
                        <span className="font-medium">
                          {user.campus.code}{user.campus.name ? ` \u2014 ${user.campus.name}` : ''}
                        </span>
                      </>
                    )}
                    {assignRoleValue === UserRole.CHAIRPERSON && user.program && (
                      <>
                        <span className="text-muted-foreground">Program</span>
                        <span className="font-medium">
                          {user.program.code}{user.program.name ? ` \u2014 ${user.program.name}` : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={handleAssign}
                disabled={
                  !assignCategoryId ||
                  assignRole.isPending ||
                  (assignRoleValue === UserRole.DEAN && deanCategories.isLoading)
                }
                className="w-full gap-1.5"
                size="sm"
              >
                {assignRole.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                Assign {assignRoleValue}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmRemove(null)
            setRemoveCategoryId('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmRemove?.role} Role</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Remove the <strong>{confirmRemove?.role}</strong> role from{' '}
                  <strong>{user.fullName}</strong>? This will revoke their
                  institutional access for the specified Moodle category.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Moodle Category ID</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 42"
                    value={removeCategoryId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRemoveCategoryId(e.target.value)
                    }
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={!removeCategoryId || removeRole.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRole.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
