import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Routine = Database['public']['Tables']['routines']['Row']
export type RoutineDay = Database['public']['Tables']['routine_days']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type RoutineDayExercise = Database['public']['Tables']['routine_day_exercises']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type WorkoutSet = Database['public']['Tables']['workout_sets']['Row']
export type WorkoutPhoto = Database['public']['Tables']['workout_photos']['Row']
export type ProfileShare = Database['public']['Tables']['profile_shares']['Row']

// Extended types with relations
export interface RoutineWithDays extends Routine {
  routine_days: RoutineDayWithExercises[]
}

export interface RoutineDayWithExercises extends RoutineDay {
  routine_day_exercises: RoutineDayExerciseWithExercise[]
}

export interface RoutineDayExerciseWithExercise extends RoutineDayExercise {
  exercise: Exercise
}

export interface WorkoutSessionWithSets extends WorkoutSession {
  workout_sets: WorkoutSetWithExercise[]
  workout_photos: WorkoutPhoto[]
}

export interface WorkoutSetWithExercise extends WorkoutSet {
  exercise: Exercise
}

// Active session types
export interface ActiveSet {
  id: string
  exerciseId: string
  setNumber: number
  weightKg: number | null
  reps: number | null
  rpe: number | null
  restSec: number | null
  isWarmup: boolean
  completed: boolean
  notes: string | null
}

export interface ActiveExercise {
  exerciseId: string
  exercise: Exercise
  sets: ActiveSet[]
  targetSets: number | null
  targetReps: string | null
  targetRpe: number | null
  restSeconds: number | null
}

// Chart data types
export interface VolumeDataPoint {
  date: string
  totalVolume: number
  sessionCount: number
}

export interface StrengthDataPoint {
  date: string
  weight: number
  reps: number
  estimated1RM: number
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: string
}

// Exercise categories
export type ExerciseCategory =
  | 'compound'
  | 'isolation'
  | 'cardio'
  | 'bodyweight'
  | 'olympic'
  | 'stretching'

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'calves'
  | 'forearms'
  | 'full_body'
