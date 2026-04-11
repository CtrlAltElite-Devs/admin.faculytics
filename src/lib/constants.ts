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

/**
 * Returns default start/end dates for an academic year based on semester.
 * Sem 1: Aug 1 – Dec 18 (startYear)
 * Sem 2: Jan 20 – Jun 1 (endYear)
 */
export function getSemesterDates(
  semester: number,
  startYear: number,
  endYear: number,
): { startDate: string; endDate: string } | null {
  if (semester === 1) {
    return {
      startDate: `${startYear}-08-01`,
      endDate: `${startYear}-12-18`,
    }
  }
  if (semester === 2) {
    return {
      startDate: `${endYear}-01-20`,
      endDate: `${endYear}-06-01`,
    }
  }
  return null
}
