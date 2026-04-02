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
