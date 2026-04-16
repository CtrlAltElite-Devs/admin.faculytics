import { useState, useDeferredValue } from 'react'
import { useNavigate } from 'react-router'
import { Eye, Loader2, Search, UserX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { useSemesters } from '@/features/moodle-provision/use-semesters'
import {
  useCoursesFilter,
  useFacultyFilter,
} from '@/features/submission-generator/use-generator-filters'
import { useUsersWithoutSubmissions } from './use-users-without-submissions'
import type { ListNonSubmittersQuery } from '@/types/api'

const ALL_VALUE = '__all__'

export function UsersWithoutSubmissionsPage() {
  const [search, setSearch] = useState('')
  const [semesterId, setSemesterId] = useState<string>(ALL_VALUE)
  const [facultyUsername, setFacultyUsername] = useState<string>(ALL_VALUE)
  const [courseId, setCourseId] = useState<string>(ALL_VALUE)
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const deferredSearch = useDeferredValue(search)

  const query: ListNonSubmittersQuery = {
    search: deferredSearch || undefined,
    semesterId: semesterId !== ALL_VALUE ? semesterId : undefined,
    facultyUsername:
      facultyUsername !== ALL_VALUE ? facultyUsername : undefined,
    courseId: courseId !== ALL_VALUE ? courseId : undefined,
    page,
    limit: 20,
  }

  const { data, isLoading, isFetching } = useUsersWithoutSubmissions(query)
  const { data: semesters } = useSemesters()
  const { data: faculty } = useFacultyFilter()
  const { data: courses } = useCoursesFilter(
    facultyUsername !== ALL_VALUE ? facultyUsername : undefined,
  )

  const clearFilters = () => {
    setSearch('')
    setSemesterId(ALL_VALUE)
    setFacultyUsername(ALL_VALUE)
    setCourseId(ALL_VALUE)
    setPage(1)
  }

  const hasActiveFilters =
    search ||
    semesterId !== ALL_VALUE ||
    facultyUsername !== ALL_VALUE ||
    courseId !== ALL_VALUE

  const scopeLabel = (() => {
    if (!data?.scope?.semesterId) return null
    if (data.scope.semesterLabel) {
      const ay = data.scope.academicYear
      return `${data.scope.semesterLabel}${ay ? ` · ${ay}` : ''}`
    }
    return data.scope.semesterCode || '—'
  })()

  return (
    <div className="space-y-6 dashboard-stagger">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Users Without Submissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Locate students who have not submitted any evaluations for the scope
          semester.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Non-Submitters</CardTitle>
              <CardDescription>
                {data
                  ? `${data.meta.totalItems} student${data.meta.totalItems === 1 ? '' : 's'} found${scopeLabel ? ` · Scope: ${scopeLabel}` : ''}`
                  : 'Loading students...'}
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1.5"
              >
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:min-w-0">
              <Select
                value={semesterId}
                onValueChange={(v) => {
                  setSemesterId(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Latest semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Latest semester</SelectItem>
                  {semesters?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} · {s.academicYear} ({s.campusCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={facultyUsername}
                onValueChange={(v) => {
                  setFacultyUsername(v)
                  setCourseId(ALL_VALUE)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All faculty</SelectItem>
                  {faculty?.map((f) => (
                    <SelectItem key={f.id} value={f.username}>
                      {f.fullName} ({f.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={courseId}
                onValueChange={(v) => {
                  setCourseId(v)
                  setPage(1)
                }}
                disabled={facultyUsername === ALL_VALUE}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      facultyUsername === ALL_VALUE
                        ? 'Select a faculty first'
                        : 'All courses'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All courses</SelectItem>
                  {courses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.shortname} · {c.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
                      <TableHead>Student</TableHead>
                      <TableHead>Campus</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead className="text-right">Enrolled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-12"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <UserX className="size-5 text-muted-foreground/60" />
                            <span>No non-submitters found for this scope</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {data?.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.userName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.campus ? (
                            <Tooltip>
                              <TooltipTrigger className="text-left">
                                {user.campus.code}
                              </TooltipTrigger>
                              <TooltipContent>
                                {user.campus.name || user.campus.code}
                              </TooltipContent>
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
                              <TooltipContent>
                                {user.department.name || user.department.code}
                              </TooltipContent>
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
                              <TooltipContent>
                                {user.program.name || user.program.code}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {user.enrolledCoursesInSemester}
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
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="text-xs gap-1"
                          >
                            <Eye className="size-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Page {data.meta.currentPage} of {data.meta.totalPages} (
                    {data.meta.totalItems} total)
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
    </div>
  )
}
