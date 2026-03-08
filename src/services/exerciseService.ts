import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']

export const exerciseService = {
  async getAll(userId?: string) {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })

    if (userId) {
      query = query.or(`is_global.eq.true,user_id.eq.${userId}`)
    } else {
      query = query.eq('is_global', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async search(term: string, userId?: string) {
    let query = supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${term}%`)
      .order('name', { ascending: true })
      .limit(20)

    if (userId) {
      query = query.or(`is_global.eq.true,user_id.eq.${userId}`)
    } else {
      query = query.eq('is_global', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(data: Omit<ExerciseInsert, 'is_global'>) {
    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert({ ...data, is_global: false })
      .select()
      .single()

    if (error) throw error
    return exercise
  },
}
