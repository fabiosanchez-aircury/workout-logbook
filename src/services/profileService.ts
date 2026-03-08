import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export const profileService = {
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async getByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error) throw error
    return data
  },

  async update(userId: string, data: Omit<ProfileUpdate, 'id'>) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return profile
  },

  async generateShareToken(userId: string) {
    const token = crypto.randomUUID().replace(/-/g, '')
    const { data, error } = await supabase
      .from('profiles')
      .update({ share_token: token })
      .eq('id', userId)
      .select('share_token')
      .single()

    if (error) throw error
    return data.share_token
  },

  async createShare(
    ownerId: string,
    permission: 'read' | 'edit',
    expiresAt?: string
  ) {
    const { data, error } = await supabase
      .from('profile_shares')
      .insert({
        owner_id: ownerId,
        permission,
        expires_at: expiresAt ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getShares(ownerId: string) {
    const { data, error } = await supabase
      .from('profile_shares')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async deleteShare(shareId: string) {
    const { error } = await supabase.from('profile_shares').delete().eq('id', shareId)
    if (error) throw error
  },
}
