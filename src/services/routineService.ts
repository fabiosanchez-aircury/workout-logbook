import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'
import type { RoutineWithDays } from '@/types/models'

type RoutineInsert = Database['public']['Tables']['routines']['Insert']
type RoutineUpdate = Database['public']['Tables']['routines']['Update']
type RoutineDayInsert = Database['public']['Tables']['routine_days']['Insert']
type RoutineDayExerciseInsert =
  Database['public']['Tables']['routine_day_exercises']['Insert']

export const routineService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getById(id: string): Promise<RoutineWithDays> {
    const { data, error } = await supabase
      .from('routines')
      .select(
        `
        *,
        routine_days (
          *,
          routine_day_exercises (
            *,
            exercise:exercises (*)
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error

    // Sort days by position, exercises by position
    const sorted: RoutineWithDays = {
      ...data,
      routine_days: [...(data.routine_days ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((day) => ({
          ...day,
          routine_day_exercises: [...(day.routine_day_exercises ?? [])].sort(
            (a, b) => a.position - b.position
          ),
        })),
    }

    return sorted
  },

  async create(data: RoutineInsert) {
    const { data: routine, error } = await supabase
      .from('routines')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return routine
  },

  async update(id: string, data: RoutineUpdate) {
    const { data: routine, error } = await supabase
      .from('routines')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return routine
  },

  async delete(id: string) {
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (error) throw error
  },

  async addDay(data: RoutineDayInsert) {
    const { data: day, error } = await supabase
      .from('routine_days')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return day
  },

  async updateDay(id: string, data: Partial<RoutineDayInsert>) {
    const { data: day, error } = await supabase
      .from('routine_days')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return day
  },

  async deleteDay(id: string) {
    const { error } = await supabase.from('routine_days').delete().eq('id', id)
    if (error) throw error
  },

  async addExerciseToDay(data: RoutineDayExerciseInsert) {
    const { data: rde, error } = await supabase
      .from('routine_day_exercises')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return rde
  },

  async updateDayExercise(
    id: string,
    data: Partial<RoutineDayExerciseInsert>
  ) {
    const { data: rde, error } = await supabase
      .from('routine_day_exercises')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return rde
  },

  async removeDayExercise(id: string) {
    const { error } = await supabase.from('routine_day_exercises').delete().eq('id', id)
    if (error) throw error
  },

  /**
   * Reorder days — updates position field for each day
   */
  async reorderDays(days: Array<{ id: string; position: number }>) {
    const updates = days.map(({ id, position }) =>
      supabase.from('routine_days').update({ position }).eq('id', id)
    )
    await Promise.all(updates)
  },

  /**
   * Validate routine has at least one day with at least one exercise
   */
  validateRoutine(routine: RoutineWithDays): string[] {
    const errors: string[] = []
    if (!routine.name.trim()) errors.push('Routine name is required')
    if (routine.routine_days.length === 0) errors.push('Add at least one training day')
    for (const day of routine.routine_days) {
      if (day.routine_day_exercises.length === 0) {
        errors.push(`Day "${day.name}" has no exercises`)
      }
    }
    return errors
  },
}
