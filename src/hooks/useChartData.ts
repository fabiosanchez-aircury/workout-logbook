import { useQuery } from '@tanstack/react-query'
import { workoutService } from '@/services/workoutService'
import { useAuthStore } from '@/stores/authStore'
import { calc1RM, calcVolume } from '@/lib/utils'
import type { VolumeDataPoint, StrengthDataPoint, PersonalRecord } from '@/types/models'

export function useVolumeChart(days = 30) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['charts', 'volume', userId, days],
    queryFn: async (): Promise<VolumeDataPoint[]> => {
      const sessions = await workoutService.getSessionsWithSets(userId!, days)

      // Group by date
      const byDate = new Map<string, { totalVolume: number; sessionCount: number }>()

      for (const session of sessions) {
        const date = session.started_at.split('T')[0]
        const existing = byDate.get(date) ?? { totalVolume: 0, sessionCount: 0 }
        const sessionVolume = session.workout_sets.reduce((sum, s) => {
          return sum + calcVolume(s.weight_kg, s.reps)
        }, 0)
        byDate.set(date, {
          totalVolume: existing.totalVolume + sessionVolume,
          sessionCount: existing.sessionCount + 1,
        })
      }

      return Array.from(byDate.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    enabled: !!userId,
  })
}

export function useStrengthChart(exerciseId: string | undefined, days = 90) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['charts', 'strength', userId, exerciseId, days],
    queryFn: async (): Promise<StrengthDataPoint[]> => {
      if (!exerciseId) return []
      const sets = await workoutService.getSetsForExercise(userId!, exerciseId, days)

      // One data point per day — best set (highest 1RM)
      const byDate = new Map<string, StrengthDataPoint>()

      for (const set of sets) {
        if (!set.weight_kg || !set.reps) continue
        const date = set.created_at.split('T')[0]
        const estimated1RM = calc1RM(set.weight_kg, set.reps)
        const existing = byDate.get(date)
        if (!existing || estimated1RM > existing.estimated1RM) {
          byDate.set(date, {
            date,
            weight: set.weight_kg,
            reps: set.reps,
            estimated1RM: Math.round(estimated1RM * 10) / 10,
          })
        }
      }

      return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
    },
    enabled: !!userId && !!exerciseId,
  })
}

export function usePersonalRecords() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['charts', 'prs', userId],
    queryFn: async (): Promise<PersonalRecord[]> => {
      return workoutService.getPersonalRecords(userId!)
    },
    enabled: !!userId,
  })
}
