import { useState } from 'react'
import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Check,
  Loader2,
  Shield,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUserDetail } from './use-user-detail'

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
  ADMIN: 'bg-orange-100 text-orange-700 border-orange-200',
  DEAN: 'bg-purple-100 text-purple-700 border-purple-200',
  CHAIRPERSON: 'bg-blue-100 text-blue-700 border-blue-200',
  FACULTY: 'bg-green-100 text-green-700 border-green-200',
  STUDENT: 'bg-slate-100 text-slate-700 border-slate-200',
}

const ENROLLMENT_ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  editingteacher: 'Editing Teacher',
}

const DEPTH_LABELS: Record<number, string> = {
  1: 'Campus',
  2: 'Semester',
  3: 'Department',
  4: 'Program',
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const { data: user, isLoading, error } = useUserDetail(userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link to="/users">
            <ArrowLeft className="size-3.5" />
            Back to users
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            User not found
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="gap-1.5">
        <Link to="/users">
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
      </Button>

      {/* User profile card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {user.userProfilePicture ? (
                <img
                  src={user.userProfilePicture}
                  alt={user.fullName}
                  className="size-14 rounded-full border object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full border bg-muted">
                  <User className="size-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{user.fullName}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  {user.userName}
                </CardDescription>
                <CopyId value={user.id} />
              </div>
            </div>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Roles */}
          <div className="flex flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <Badge
                key={role}
                variant="outline"
                className={`text-xs px-2 py-0.5 ${ROLE_COLORS[role] ?? ''}`}
              >
                {role.replace('_', ' ')}
              </Badge>
            ))}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetaCell label="Campus" value={user.campus?.name || user.campus?.code} />
            <MetaCell label="Department" value={user.department?.name || user.department?.code} />
            <MetaCell label="Program" value={user.program?.name || user.program?.code} />
            <MetaCell
              label="Moodle ID"
              value={user.moodleUserId != null ? String(user.moodleUserId) : undefined}
              mono
            />
            <MetaCell label="Last login" value={user.lastLoginAt ? formatDate(user.lastLoginAt) : undefined} />
            <MetaCell label="Created" value={user.createdAt ? formatDate(user.createdAt) : undefined} />
          </div>
        </CardContent>
      </Card>

      {/* Enrollments card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Enrollments</CardTitle>
          </div>
          <CardDescription>
            {user.enrollments.length === 0
              ? 'No active enrollments'
              : `${user.enrollments.length} active enrollment${user.enrollments.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        {user.enrollments.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Short Name</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="text-sm font-medium">
                      {enrollment.course.fullname}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground">
                        {enrollment.course.shortname}
                      </code>
                    </TableCell>
                    <TableCell>
                      <CopyId value={enrollment.course.id} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ENROLLMENT_ROLE_LABELS[enrollment.role] ?? enrollment.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* Institutional roles card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Institutional Roles</CardTitle>
          </div>
          <CardDescription>
            {user.institutionalRoles.length === 0
              ? 'No institutional role assignments'
              : `${user.institutionalRoles.length} role assignment${user.institutionalRoles.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        {user.institutionalRoles.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.institutionalRoles.map((ir) => (
                  <TableRow key={ir.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${ROLE_COLORS[ir.role] ?? ''}`}
                      >
                        {ir.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ir.category.name}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          <span className="text-xs text-muted-foreground">
                            {DEPTH_LABELS[ir.category.depth] ?? `Depth ${ir.category.depth}`}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Moodle category depth {ir.category.depth}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          ir.source === 'manual'
                            ? 'border-amber-500/50 text-amber-600 text-xs'
                            : 'text-xs'
                        }
                      >
                        {ir.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function CopyId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 -ml-1.5 hover:bg-muted transition-colors cursor-pointer"
    >
      <code className="text-[11px] font-mono text-muted-foreground">
        {value}
      </code>
      {copied ? (
        <Check className="size-3 text-green-500" />
      ) : (
        <Copy className="size-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
      )}
    </button>
  )
}

function MetaCell({
  label,
  value,
  mono,
}: {
  label: string
  value?: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-0.5">
        {label}
      </p>
      <p className={`text-sm ${mono ? 'font-mono' : ''} ${!value ? 'text-muted-foreground' : ''}`}>
        {value ?? '—'}
      </p>
    </div>
  )
}
