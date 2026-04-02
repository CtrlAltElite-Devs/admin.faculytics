import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api-client'
import { useEnvStore } from '@/stores/env-store'
import { useAuthStore } from '@/stores/auth-store'
import type {
  AssignInstitutionalRoleRequest,
  DeanEligibleCategory,
  RemoveInstitutionalRoleRequest,
} from '@/types/api'

export function useDeanEligibleCategories(userId: string | undefined) {
  const activeEnvId = useEnvStore((s) => s.activeEnvId)
  const isAuth = useAuthStore((s) =>
    activeEnvId ? s.isAuthenticated(activeEnvId) : false,
  )

  return useQuery<DeanEligibleCategory[]>({
    queryKey: ['dean-eligible-categories', activeEnvId, userId],
    queryFn: () =>
      apiClient<DeanEligibleCategory[]>(
        `/admin/institutional-roles/dean-eligible-categories?userId=${userId}`,
      ),
    enabled: !!activeEnvId && isAuth && !!userId,
    staleTime: 30_000,
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AssignInstitutionalRoleRequest) =>
      apiClient('/admin/institutional-roles', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      const envId = useEnvStore.getState().activeEnvId
      toast.success('Role assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users', envId] })
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 404) {
        toast.error('User or category not found')
      } else {
        toast.error('Failed to assign role')
      }
    },
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RemoveInstitutionalRoleRequest) =>
      apiClient('/admin/institutional-roles', {
        method: 'DELETE',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      const envId = useEnvStore.getState().activeEnvId
      toast.success('Role removed successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users', envId] })
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 404) {
        toast.error('Role assignment not found')
      } else {
        toast.error('Failed to remove role')
      }
    },
  })
}
