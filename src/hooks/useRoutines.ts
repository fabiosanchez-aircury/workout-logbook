import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routineService } from '@/services/routineService'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/types/database.types'

type RoutineInsert = Database['public']['Tables']['routines']['Insert']
type RoutineUpdate = Database['public']['Tables']['routines']['Update']

export function useRoutines() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['routines', userId],
    queryFn: () => routineService.getAll(userId!),
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<RoutineInsert, 'user_id'>) =>
      routineService.create({ ...data, user_id: userId! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoutineUpdate }) =>
      routineService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => routineService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })

  return {
    routines: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  }
}

export function useRoutine(id: string | undefined) {
  return useQuery({
    queryKey: ['routines', id],
    queryFn: () => routineService.getById(id!),
    enabled: !!id,
  })
}
