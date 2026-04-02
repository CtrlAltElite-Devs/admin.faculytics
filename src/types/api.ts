// ── Sync ──

export type SyncState = 'idle' | 'active' | 'queued'

export interface SyncStatusResponse {
  state: SyncState
  jobId?: string
  trigger?: string
  startedAt?: number
  waitingCount: number
  failedCount: number
}

export interface SyncPhaseResult {
  status: 'success' | 'failed' | 'skipped'
  durationMs: number
  fetched: number
  inserted: number
  updated: number
  deactivated: number
  errors: number
  errorMessage?: string
}

export interface SyncLogResponse {
  id: string
  trigger: string
  triggeredById?: string
  status: string
  startedAt: string
  completedAt?: string
  durationMs?: number
  categories?: SyncPhaseResult
  courses?: SyncPhaseResult
  enrollments?: SyncPhaseResult
  errorMessage?: string
  jobId?: string
  cronExpression?: string
}

export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export interface SyncHistoryResponse {
  data: SyncLogResponse[]
  meta: PaginationMeta
}

export interface SyncScheduleResponse {
  intervalMinutes: number
  cronExpression: string
  nextExecution: string | null
}

export interface TriggerSyncResponse {
  jobId: string
}

export interface UpdateSyncScheduleRequest {
  intervalMinutes: number
}

// ── Auth ──

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
}

export interface MeResponse {
  id: string
  userName: string
  moodleUserId?: number
  firstName: string
  lastName: string
  userProfilePicture: string
  fullName: string
  roles: string[]
  campus?: {
    id: string
    name?: string
    code: string
  }
}

// ── Admin ──

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DEAN: 'DEAN',
  CHAIRPERSON: 'CHAIRPERSON',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface AdminUserScopedRelation {
  id: string
  code: string
  name?: string
}

export interface AdminUserItem {
  id: string
  userName: string
  fullName: string
  moodleUserId?: number
  roles: UserRole[]
  isActive: boolean
  campus: AdminUserScopedRelation | null
  department: AdminUserScopedRelation | null
  program: AdminUserScopedRelation | null
}

export interface AdminUserListResponse {
  data: AdminUserItem[]
  meta: PaginationMeta
}

export interface ListUsersQuery {
  search?: string
  role?: UserRole
  isActive?: boolean
  campusId?: string
  departmentId?: string
  programId?: string
  page?: number
  limit?: number
}

export interface AdminEnrollmentCourse {
  id: string
  shortname: string
  fullname: string
}

export interface AdminEnrollmentItem {
  id: string
  role: string
  isActive: boolean
  course: AdminEnrollmentCourse
}

export interface AdminInstitutionalRoleCategory {
  moodleCategoryId: number
  name: string
  depth: number
}

export interface AdminInstitutionalRoleItem {
  id: string
  role: string
  source: string
  category: AdminInstitutionalRoleCategory
}

export interface AdminUserDetail {
  id: string
  userName: string
  fullName: string
  firstName: string
  lastName: string
  moodleUserId?: number
  userProfilePicture: string
  roles: UserRole[]
  isActive: boolean
  lastLoginAt: string
  createdAt: string
  campus: AdminUserScopedRelation | null
  department: AdminUserScopedRelation | null
  program: AdminUserScopedRelation | null
  enrollments: AdminEnrollmentItem[]
  institutionalRoles: AdminInstitutionalRoleItem[]
}

export interface FilterOption {
  id: string
  code: string
  name: string | null
}

export type InstitutionalRole = typeof UserRole.DEAN | typeof UserRole.CHAIRPERSON

export interface AssignInstitutionalRoleRequest {
  userId: string
  role: InstitutionalRole
  moodleCategoryId: number
}

export interface RemoveInstitutionalRoleRequest {
  userId: string
  role: InstitutionalRole
  moodleCategoryId: number
}

export interface DeanEligibleCategory {
  moodleCategoryId: number
  name: string
}

// ── Health ──

export interface HealthCheckResult {
  status: 'ok' | 'error' | 'shutting_down'
  info?: Record<string, { status: 'up' | 'down'; message?: string }>
  error?: Record<string, unknown>
}

// ── Environment ──

export interface Environment {
  id: string
  label: string
  baseUrl: string
  color: string
}
