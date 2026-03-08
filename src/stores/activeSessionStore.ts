import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { ActiveSet, ActiveExercise, Exercise } from '@/types/models'

const STORAGE_KEY = 'workout-logbook:active-session'

interface ActiveSessionState {
  sessionId: string | null
  routineId: string | null
  routineDayId: string | null
  sessionName: string
  startedAt: string | null
  exercises: ActiveExercise[]
  isActive: boolean

  // Actions
  startSession: (params: {
    sessionId: string
    routineId: string | null
    routineDayId: string | null
    name: string
    exercises: Array<{
      exercise: Exercise
      targetSets: number | null
      targetReps: string | null
      targetRpe: number | null
      restSeconds: number | null
    }>
  }) => void
  addSet: (exerciseId: string) => string
  updateSet: (exerciseId: string, setId: string, updates: Partial<ActiveSet>) => void
  completeSet: (exerciseId: string, setId: string) => void
  removeSet: (exerciseId: string, setId: string) => void
  addExercise: (exercise: Exercise) => void
  removeExercise: (exerciseId: string) => void
  fillRestTime: (setId: string, restSec: number) => void
  finishSession: () => ActiveSessionState['exercises']
  discardSession: () => void
}

const initialState = {
  sessionId: null,
  routineId: null,
  routineDayId: null,
  sessionName: '',
  startedAt: null,
  exercises: [],
  isActive: false,
}

export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: ({ sessionId, routineId, routineDayId, name, exercises }) => {
        const activeExercises: ActiveExercise[] = exercises.map(
          ({ exercise, targetSets, targetReps, targetRpe, restSeconds }) => ({
            exerciseId: exercise.id,
            exercise,
            sets: [],
            targetSets,
            targetReps,
            targetRpe,
            restSeconds,
          })
        )

        set({
          sessionId,
          routineId,
          routineDayId,
          sessionName: name,
          startedAt: new Date().toISOString(),
          exercises: activeExercises,
          isActive: true,
        })
      },

      addSet: (exerciseId) => {
        const setId = generateId()
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex
            const nextNumber = ex.sets.length + 1
            const newSet: ActiveSet = {
              id: setId,
              exerciseId,
              setNumber: nextNumber,
              weightKg: null,
              reps: null,
              rpe: null,
              restSec: null,
              isWarmup: false,
              completed: false,
              notes: null,
            }
            return { ...ex, sets: [...ex.sets, newSet] }
          }),
        }))
        return setId
      },

      updateSet: (exerciseId, setId, updates) => {
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
            }
          }),
        }))
      },

      completeSet: (exerciseId, setId) => {
        get().updateSet(exerciseId, setId, { completed: true })
      },

      removeSet: (exerciseId, setId) => {
        set((state) => ({
          exercises: state.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex
            const filtered = ex.sets.filter((s) => s.id !== setId)
            // Renumber sets
            const renumbered = filtered.map((s, i) => ({ ...s, setNumber: i + 1 }))
            return { ...ex, sets: renumbered }
          }),
        }))
      },

      addExercise: (exercise) => {
        set((state) => {
          const exists = state.exercises.some((ex) => ex.exerciseId === exercise.id)
          if (exists) return state
          const newExercise: ActiveExercise = {
            exerciseId: exercise.id,
            exercise,
            sets: [],
            targetSets: null,
            targetReps: null,
            targetRpe: null,
            restSeconds: null,
          }
          return { exercises: [...state.exercises, newExercise] }
        })
      },

      removeExercise: (exerciseId) => {
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.exerciseId !== exerciseId),
        }))
      },

      fillRestTime: (setId, restSec) => {
        set((state) => ({
          exercises: state.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, restSec } : s)),
          })),
        }))
      },

      finishSession: () => {
        const { exercises } = get()
        set(initialState)
        return exercises
      },

      discardSession: () => {
        set(initialState)
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist during active session
      partialize: (state) =>
        state.isActive
          ? state
          : {
              sessionId: null,
              routineId: null,
              routineDayId: null,
              sessionName: '',
              startedAt: null,
              exercises: [],
              isActive: false,
            },
    }
  )
)
