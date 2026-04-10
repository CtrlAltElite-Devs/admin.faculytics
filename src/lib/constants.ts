export const ENV_COLORS = [
  '#22c55e', // green — local
  '#f59e0b', // amber — staging
  '#ef4444', // red   — production
  '#3b82f6', // blue
  '#8b5cf6', // violet
] as const

export const MOODLE_SYNC_MIN_INTERVAL_MINUTES = 30

// Update when new campuses are added to the institution
export const CAMPUSES = ['UCMN', 'UCLM', 'UCB', 'UCMETC', 'UCPT'] as const
