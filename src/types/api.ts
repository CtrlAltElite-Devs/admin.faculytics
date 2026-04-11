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

export interface ProgramFilterOption extends FilterOption {
  moodleCategoryId: number
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

// ── Submission Generator ──

export interface FacultyFilterOption {
  id: string
  username: string
  fullName: string
}

export interface CourseFilterOption {
  id: string
  shortname: string
  fullname: string
}

export interface QuestionnaireTypeOption {
  id: string
  name: string
  code: string
}

export interface QuestionnaireVersionOption {
  id: string
  versionNumber: number
  isActive: boolean
}

export interface SubmissionStatus {
  totalEnrolled: number
  alreadySubmitted: number
  availableStudents: number
}

export interface GeneratePreviewRequest {
  versionId: string
  facultyUsername: string
  courseShortname: string
}

export interface GeneratedRow {
  externalId: string
  username: string
  facultyUsername: string
  courseShortname: string
  answers: Record<string, number>
  comment?: string
}

export interface PreviewQuestion {
  id: string
  text: string
  sectionName: string
}

export interface GeneratePreviewResponse {
  metadata: {
    faculty: { username: string; fullName: string }
    course: { shortname: string; fullname: string }
    semester: { code: string; label: string; academicYear: string }
    version: { id: string; versionNumber: number }
    maxScore: number
    totalEnrolled: number
    alreadySubmitted: number
    availableStudents: number
    generatingCount: number
  }
  questions: PreviewQuestion[]
  rows: GeneratedRow[]
}

export interface GenerateCommitRequest {
  versionId: string
  rows: GeneratedRow[]
}

export interface CommitRecordResult {
  externalId: string
  success: boolean
  error?: string
  internalId?: string
}

export interface CommitResult {
  commitId: string
  total: number
  successes: number
  failures: number
  dryRun: boolean
  records: CommitRecordResult[]
}

// ── Semester Filter ──

export interface SemesterFilterOption {
  id: string
  code: string
  label: string
  academicYear: string
  campusCode: string
  startDate: string
  endDate: string
}

// ── Moodle Provisioning ──

export interface ProvisionCategoriesRequest {
  campuses: string[]
  semesters: number[]
  startDate: string
  endDate: string
  departments: { code: string; programs: string[] }[]
}

export interface ProvisionDetailItem {
  name: string
  status: 'created' | 'skipped' | 'error'
  reason?: string
  moodleId?: number
}

export interface ProvisionResultResponse {
  created: number
  skipped: number
  errors: number
  details: ProvisionDetailItem[]
  durationMs: number
  syncCompleted?: boolean
}

export interface SeedCoursesContext {
  campus: string
  department: string
  startDate: string
  endDate: string
}

export interface CoursePreviewRow {
  shortname: string
  fullname: string
  categoryPath: string
  categoryId: number
  startDate: string
  endDate: string
  program: string
  semester: string
  courseCode: string
}

export interface SkippedRow {
  rowNumber: number
  courseCode: string
  reason: string
}

export interface ParseError {
  rowNumber: number
  message: string
}

export interface CoursePreviewResponse {
  valid: CoursePreviewRow[]
  skipped: SkippedRow[]
  errors: ParseError[]
  shortnameNote: string
}

export interface ConfirmedCourseRow {
  courseCode: string
  descriptiveTitle: string
  program: string
  semester: string
  categoryId: number
}

export interface ExecuteCoursesRequest {
  rows: ConfirmedCourseRow[]
  campus: string
  department: string
  startDate: string
  endDate: string
}

export interface QuickCourseRequest {
  courseCode: string
  descriptiveTitle: string
  campus: string
  department: string
  program: string
  semester: number
  startDate: string
  endDate: string
}

export interface BulkCoursePreviewRequest {
  semesterId: string
  departmentId: string
  programId: string
  startDate: string
  endDate: string
  courses: { courseCode: string; descriptiveTitle: string }[]
}

export interface BulkCourseExecuteRequest {
  semesterId: string
  departmentId: string
  programId: string
  startDate: string
  endDate: string
  courses: { courseCode: string; descriptiveTitle: string; categoryId: number }[]
}

export interface SeedUsersRequest {
  count: number
  role: 'student' | 'faculty'
  campus: string
  courseIds: number[]
}

export interface SeedUsersResponse {
  usersCreated: number
  usersFailed: number
  enrolmentsCreated: number
  warnings: string[]
  durationMs: number
}

// ── Audit Logs ──

export interface AuditLogItem {
  id: string
  action: string
  actorId?: string
  actorUsername?: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  browserName?: string
  os?: string
  ipAddress?: string
  occurredAt: string
}

export interface AuditLogDetail {
  id: string
  action: string
  actorId?: string
  actorUsername?: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  browserName?: string
  os?: string
  ipAddress?: string
  occurredAt: string
}

export interface AuditLogListResponse {
  data: AuditLogItem[]
  meta: PaginationMeta
}

export interface ListAuditLogsQuery {
  action?: string
  actorId?: string
  actorUsername?: string
  resourceType?: string
  resourceId?: string
  from?: string
  to?: string
  search?: string
  page?: number
  limit?: number
}

// ── Moodle Tree Explorer ──

export interface MoodleCategoryTreeNode {
  id: number
  name: string
  depth: number
  coursecount: number
  /** 0=hidden, 1=visible (Moodle convention) */
  visible: number
  children: MoodleCategoryTreeNode[]
}

export interface MoodleCategoryTreeResponse {
  tree: MoodleCategoryTreeNode[]
  fetchedAt: string
  totalCategories: number
}

export interface MoodleCoursePreview {
  id: number
  shortname: string
  fullname: string
  /** May be 0 or absent depending on Moodle version/master key permissions */
  enrolledusercount?: number
  /** 0=hidden, 1=visible (Moodle convention) */
  visible: number
  startdate: number
  enddate: number
}

export interface MoodleCategoryCoursesResponse {
  categoryId: number
  courses: MoodleCoursePreview[]
}
