export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          is_public: boolean
          share_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      routine_days: {
        Row: {
          id: string
          routine_id: string
          name: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          name: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          name?: string
          position?: number
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          category: string
          muscle_group: string | null
          equipment: string | null
          is_global: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          muscle_group?: string | null
          equipment?: string | null
          is_global?: boolean
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          muscle_group?: string | null
          equipment?: string | null
          is_global?: boolean
          user_id?: string | null
          created_at?: string
        }
      }
      routine_day_exercises: {
        Row: {
          id: string
          routine_day_id: string
          exercise_id: string
          position: number
          target_sets: number | null
          target_reps: string | null
          target_rpe: number | null
          rest_seconds: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          routine_day_id: string
          exercise_id: string
          position: number
          target_sets?: number | null
          target_reps?: string | null
          target_rpe?: number | null
          rest_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          routine_day_id?: string
          exercise_id?: string
          position?: number
          target_sets?: number | null
          target_reps?: string | null
          target_rpe?: number | null
          rest_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          routine_day_id: string | null
          name: string
          started_at: string
          finished_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_id?: string | null
          routine_day_id?: string | null
          name: string
          started_at?: string
          finished_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string | null
          routine_day_id?: string | null
          name?: string
          started_at?: string
          finished_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          set_number: number
          weight_kg: number | null
          reps: number | null
          rpe: number | null
          rest_sec: number | null
          is_warmup: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          set_number: number
          weight_kg?: number | null
          reps?: number | null
          rpe?: number | null
          rest_sec?: number | null
          is_warmup?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          set_number?: number
          weight_kg?: number | null
          reps?: number | null
          rpe?: number | null
          rest_sec?: number | null
          is_warmup?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      workout_photos: {
        Row: {
          id: string
          session_id: string
          user_id: string
          storage_path: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          storage_path: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          storage_path?: string
          caption?: string | null
          created_at?: string
        }
      }
      profile_shares: {
        Row: {
          id: string
          owner_id: string
          shared_with_id: string | null
          token: string
          permission: 'read' | 'edit'
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          shared_with_id?: string | null
          token?: string
          permission: 'read' | 'edit'
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          shared_with_id?: string | null
          token?: string
          permission?: 'read' | 'edit'
          expires_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
