import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'
import type { WorkoutSessionWithSets, PersonalRecord } from '@/types/models'
import { calc1RM } from '@/lib/utils'

type SessionInsert = Database['public']['Tables']['workout_sessions']['Insert']
type SetInsert = Database['public']['Tables']['workout_sets']['Insert']

export const workoutService = {
  async createSession(data: SessionInsert) {
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return session
  },

  async finishSession(sessionId: string, finishedAt: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({ finished_at: finishedAt })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async insertSets(sets: SetInsert[]) {
    if (sets.length === 0) return []
    const { data, error } = await supabase
      .from('workout_sets')
      .insert(sets)
      .select()

    if (error) throw error
    return data
  },

  async getSessions(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('finished_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async getSession(sessionId: string): Promise<WorkoutSessionWithSets> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        `
        *,
        workout_sets (
          *,
          exercise:exercises (*)
        ),
        workout_photos (*)
      `
      )
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return data as WorkoutSessionWithSets
  },

  async getSessionsWithSets(userId: string, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`*, workout_sets (*)`)
      .eq('user_id', userId)
      .not('finished_at', 'is', null)
      .gte('started_at', since.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error
    return data
  },

  async getSetsForExercise(userId: string, exerciseId: string, days = 90) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from('workout_sets')
      .select(`*, workout_sessions!inner(user_id, started_at)`)
      .eq('exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const { data, error } = await supabase
      .from('workout_sets')
      .select(
        `
        weight_kg,
        reps,
        created_at,
        exercise:exercises (id, name),
        workout_sessions!inner (user_id)
      `
      )
      .eq('workout_sessions.user_id', userId)
      .not('weight_kg', 'is', null)
      .not('reps', 'is', null)
      .eq('is_warmup', false)

    if (error) throw error

    // Find best set per exercise (highest 1RM)
    const prMap = new Map<string, PersonalRecord>()

    for (const set of data) {
      if (!set.weight_kg || !set.reps) continue
      const exercise = set.exercise as { id: string; name: string }
      const estimated1RM = calc1RM(set.weight_kg, set.reps)
      const existing = prMap.get(exercise.id)

      if (!existing || estimated1RM > calc1RM(existing.weight, existing.reps)) {
        prMap.set(exercise.id, {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          weight: set.weight_kg,
          reps: set.reps,
          date: set.created_at,
        })
      }
    }

    return Array.from(prMap.values()).sort((a, b) => b.weight - a.weight)
  },

  async deleteSession(sessionId: string) {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
    if (error) throw error
  },
}
