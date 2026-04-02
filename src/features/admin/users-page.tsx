import { useState, useDeferredValue } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAdminUsers } from './use-admin-users'
import { useCampuses, useDepartments, usePrograms, useRoles } from './use-admin-filters'
import { RoleActionDialog } from './role-action-dialog'
import type { AdminUserItem, ListUsersQuery, UserRole } from '@/types/api'

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
  ADMIN: 'bg-orange-100 text-orange-700 border-orange-200',
  DEAN: 'bg-purple-100 text-purple-700 border-purple-200',
  CHAIRPERSON: 'bg-blue-100 text-blue-700 border-blue-200',
  FACULTY: 'bg-green-100 text-green-700 border-green-200',
  STUDENT: 'bg-slate-100 text-slate-700 border-slate-200',
}

const ALL_VALUE = '__all__'

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>(ALL_VALUE)
  const [activeFilter, setActiveFilter] = useState<string>(ALL_VALUE)
  const [campusId, setCampusId] = useState<string>(ALL_VALUE)
  const [departmentId, setDepartmentId] = useState<string>(ALL_VALUE)
  const [programId, setProgramId] = useState<string>(ALL_VALUE)
  const [page, setPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)

  const deferredSearch = useDeferredValue(search)

  const query: ListUsersQuery = {
    search: deferredSearch || undefined,
    role: roleFilter !== ALL_VALUE ? (roleFilter as UserRole) : undefined,
    isActive: activeFilter !== ALL_VALUE ? activeFilter === 'true' : undefined,
    campusId: campusId !== ALL_VALUE ? campusId : undefined,
    departmentId: departmentId !== ALL_VALUE ? departmentId : undefined,
    programId: programId !== ALL_VALUE ? programId : undefined,
    page,
    limit: 20,
  }

  const { data, isLoading, isFetching } = useAdminUsers(query)
  const { data: roles } = useRoles()
  const { data: campuses } = useCampuses()
  const { data: departments } = useDepartments(
    campusId !== ALL_VALUE ? campusId : undefined,
  )
  const { data: programs } = usePrograms(
    departmentId !== ALL_VALUE ? departmentId : undefined,
  )

  const clearFilters = () => {
    setSearch('')
    setRoleFilter(ALL_VALUE)
    setActiveFilter(ALL_VALUE)
    setCampusId(ALL_VALUE)
    setDepartmentId(ALL_VALUE)
    setProgramId(ALL_VALUE)
    setPage(1)
  }

  const hasActiveFilters =
    search ||
    roleFilter !== ALL_VALUE ||
    activeFilter !== ALL_VALUE ||
    campusId !== ALL_VALUE ||
    departmentId !== ALL_VALUE ||
    programId !== ALL_VALUE

  const openRoleDialog = (user: AdminUserItem) => {
    setSelectedUser(user)
    setRoleDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users and institutional role assignments
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">User Directory</CardTitle>
              <CardDescription>
                {data
                  ? `${data.meta.totalItems} users found`
                  : 'Loading users...'}
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or ID..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {/* Role filter */}
              <Select
                value={roleFilter}
                onValueChange={(v) => { setRoleFilter(v); setPage(1) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All roles</SelectItem>
                  {roles?.roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Active filter */}
              <Select
                value={activeFilter}
                onValueChange={(v) => { setActiveFilter(v); setPage(1) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Campus filter */}
              <Select
                value={campusId}
                onValueChange={(v) => {
                  setCampusId(v)
                  setDepartmentId(ALL_VALUE)
                  setProgramId(ALL_VALUE)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All campuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All campuses</SelectItem>
                  {campuses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Department filter */}
              <Select
                value={departmentId}
                onValueChange={(v) => {
                  setDepartmentId(v)
                  setProgramId(ALL_VALUE)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All departments</SelectItem>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name || d.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Program filter */}
              <Select
                value={programId}
                onValueChange={(v) => { setProgramId(v); setPage(1) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All programs</SelectItem>
                  {programs?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || p.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="relative">
                {isFetching && !isLoading && (
                  <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded">
                    <div className="h-full w-1/3 animate-pulse bg-primary/30" />
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Campus</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.userName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${ROLE_COLORS[role] ?? ''}`}
                              >
                                {role.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.campus ? (
                            <Tooltip>
                              <TooltipTrigger className="text-left">
                                {user.campus.code}
                              </TooltipTrigger>
                              <TooltipContent>{user.campus.name || user.campus.code}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.department ? (
                            <Tooltip>
                              <TooltipTrigger className="text-left">
                                {user.department.code}
                              </TooltipTrigger>
                              <TooltipContent>{user.department.name || user.department.code}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.program ? (
                            <Tooltip>
                              <TooltipTrigger className="text-left">
                                {user.program.code}
                              </TooltipTrigger>
                              <TooltipContent>{user.program.name || user.program.code}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.isActive
                                ? 'border-green-500/50 text-green-600'
                                : 'border-muted-foreground/50 text-muted-foreground'
                            }
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                            className="text-xs"
                          >
                            Roles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Page {data.meta.currentPage} of {data.meta.totalPages} ({data.meta.totalItems} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <RoleActionDialog
        user={selectedUser}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
      />
    </div>
  )
}
