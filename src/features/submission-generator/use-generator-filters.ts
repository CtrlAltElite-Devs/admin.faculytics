import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type {
  FacultyFilterOption,
  CourseFilterOption,
  QuestionnaireTypeOption,
  QuestionnaireVersionOption,
  SubmissionStatus,
} from '@/types/api'

function useAuth() {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )
  return { activeEnvId, isAuth }
}

export function useFacultyFilter() {
  const { activeEnvId, isAuth } = useAuth()
  return useQuery<FacultyFilterOption[]>({
    queryKey: ['generator-filters', 'faculty', activeEnvId],
    queryFn: () => apiClient<FacultyFilterOption[]>('/admin/filters/faculty'),
    enabled: !!activeEnvId && isAuth,
    staleTime: 5 * 60_000,
  })
}

export function useCoursesFilter(facultyUsername?: string) {
  const { activeEnvId, isAuth } = useAuth()
  return useQuery<CourseFilterOption[]>({
    queryKey: ['generator-filters', 'courses', facultyUsername, activeEnvId],
    queryFn: () =>
      apiClient<CourseFilterOption[]>(
        `/admin/filters/courses?facultyUsername=${encodeURIComponent(facultyUsername!)}`,
      ),
    enabled: !!activeEnvId && isAuth && !!facultyUsername,
    staleTime: 5 * 60_000,
  })
}

export function useQuestionnaireTypesFilter() {
  const { activeEnvId, isAuth } = useAuth()
  return useQuery<QuestionnaireTypeOption[]>({
    queryKey: ['generator-filters', 'questionnaire-types', activeEnvId],
    queryFn: () =>
      apiClient<QuestionnaireTypeOption[]>('/admin/filters/questionnaire-types'),
    enabled: !!activeEnvId && isAuth,
    staleTime: 5 * 60_000,
  })
}

export function useSubmissionStatus(
  versionId?: string,
  facultyUsername?: string,
  courseShortname?: string,
) {
  const { activeEnvId, isAuth } = useAuth()
  const allSet = !!versionId && !!facultyUsername && !!courseShortname
  return useQuery<SubmissionStatus>({
    queryKey: [
      'generator-filters',
      'status',
      versionId,
      facultyUsername,
      courseShortname,
      activeEnvId,
    ],
    queryFn: () =>
      apiClient<SubmissionStatus>(
        `/admin/generate-submissions/status?versionId=${encodeURIComponent(versionId!)}&facultyUsername=${encodeURIComponent(facultyUsername!)}&courseShortname=${encodeURIComponent(courseShortname!)}`,
      ),
    enabled: !!activeEnvId && isAuth && allSet,
    staleTime: 30_000,
  })
}

export function useVersionsFilter(typeId?: string) {
  const { activeEnvId, isAuth } = useAuth()
  return useQuery<QuestionnaireVersionOption[]>({
    queryKey: ['generator-filters', 'versions', typeId, activeEnvId],
    queryFn: () =>
      apiClient<QuestionnaireVersionOption[]>(
        `/admin/filters/questionnaire-versions?typeId=${encodeURIComponent(typeId!)}`,
      ),
    enabled: !!activeEnvId && isAuth && !!typeId,
    staleTime: 5 * 60_000,
  })
}
