import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routineService } from '@/services/routineService'
import { exerciseService } from '@/services/exerciseService'
import { workoutService } from '@/services/workoutService'
import { useAuthStore } from '@/stores/authStore'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { AppShell } from '@/components/layout/AppShell'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import type { RoutineDayWithExercises, Exercise } from '@/types/models'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(300).optional(),
})

type FormValues = z.infer<typeof schema>

export function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  const { startSession } = useActiveSessionStore()
  const [addingDay, setAddingDay] = useState(false)
  const [newDayName, setNewDayName] = useState('')
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const { data: routine, isLoading } = useQuery({
    queryKey: ['routines', id],
    queryFn: () => routineService.getById(id!),
    enabled: !isNew && !!id,
  })

  // Auto-expand first day when data loads
  useEffect(() => {
    if (routine?.routine_days?.[0] && expandedDay === null) {
      setExpandedDay(routine.routine_days[0].id)
    }
  }, [routine?.routine_days?.[0]?.id])

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: routine ? { name: routine.name, description: routine.description ?? '' } : undefined,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isNew) {
        return routineService.create({ ...data, user_id: userId!, is_active: false })
      }
      return routineService.update(id!, data)
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      if (isNew) navigate(`/routines/${result.id}`, { replace: true })
    },
  })

  const addDayMutation = useMutation({
    mutationFn: (name: string) =>
      routineService.addDay({
        routine_id: id!,
        name,
        position: (routine?.routine_days?.length ?? 0) + 1,
      }),
    onSuccess: (day) => {
      qc.invalidateQueries({ queryKey: ['routines', id] })
      setAddingDay(false)
      setNewDayName('')
      setExpandedDay(day.id)
    },
  })

  const deleteDayMutation = useMutation({
    mutationFn: (dayId: string) => routineService.deleteDay(dayId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines', id] }),
  })

  const addExerciseMutation = useMutation({
    mutationFn: ({
      dayId,
      exercise,
      position,
    }: {
      dayId: string
      exercise: Exercise
      position: number
    }) =>
      routineService.addExerciseToDay({
        routine_day_id: dayId,
        exercise_id: exercise.id,
        position,
        target_sets: 3,
        target_reps: '8-12',
        rest_seconds: 120,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines', id] }),
  })

  const removeExerciseMutation = useMutation({
    mutationFn: (rdeId: string) => routineService.removeDayExercise(rdeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines', id] }),
  })

  const handleStartWorkout = async (day: RoutineDayWithExercises) => {
    if (!userId) return
    const session = await workoutService.createSession({
      user_id: userId,
      name: `${routine?.name ?? 'Workout'} – ${day.name}`,
      started_at: new Date().toISOString(),
    })

    startSession({
      sessionId: session.id,
      routineId: id!,
      routineDayId: day.id,
      name: `${routine?.name ?? 'Workout'} – ${day.name}`,
      exercises: day.routine_day_exercises.map((rde) => ({
        exercise: rde.exercise,
        targetSets: rde.target_sets,
        targetReps: rde.target_reps,
        targetRpe: rde.target_rpe ?? null,
        restSeconds: rde.rest_seconds,
      })),
    })

    navigate('/workout/active')
  }

  const onSubmit = handleSubmit((data) => saveMutation.mutateAsync(data))

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pb-24 sm:pb-5">
        {/* Header */}
        <div className="flex items-center gap-3 py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted hover:text-text transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-text">
            {isNew ? 'New Routine' : 'Edit Routine'}
          </h1>
        </div>

        {/* Name / description form */}
        <form onSubmit={onSubmit} className="mb-6 space-y-3">
          <Input
            label="Routine name"
            placeholder="e.g. Push Pull Legs"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Description (optional)"
            placeholder="Brief description of this routine"
            {...register('description')}
          />
          <button
            type="submit"
            disabled={saveMutation.isPending || (!isNew && !isDirty)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-primary/30 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {saveMutation.isPending && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isNew ? 'Create routine' : 'Save changes'}
          </button>
        </form>

        {/* Training days */}
        {!isNew && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Training days</h2>
            </div>

            {isLoading ? (
              <PageSpinner />
            ) : (
              <div className="space-y-3">
                {routine?.routine_days?.map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    isExpanded={expandedDay === day.id}
                    onToggle={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                    onStart={() => handleStartWorkout(day)}
                    onAddExercise={(exercise) =>
                      addExerciseMutation.mutate({
                        dayId: day.id,
                        exercise,
                        position: day.routine_day_exercises.length + 1,
                      })
                    }
                    onRemoveExercise={(rdeId) => removeExerciseMutation.mutate(rdeId)}
                    onDelete={() => {
                      if (confirm(`Delete day "${day.name}"?`)) deleteDayMutation.mutate(day.id)
                    }}
                    userId={userId}
                  />
                ))}

                {/* Add day */}
                {addingDay ? (
                  <div className="rounded-2xl border border-primary/30 bg-surface p-4">
                    <p className="mb-2 text-sm font-medium text-text">New training day</p>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        placeholder="e.g. Day 1 – Push"
                        value={newDayName}
                        onChange={(e) => setNewDayName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newDayName.trim()) addDayMutation.mutate(newDayName.trim())
                          if (e.key === 'Escape') { setAddingDay(false); setNewDayName('') }
                        }}
                        className="flex-1 rounded-xl bg-surface-elevated px-3 py-2 text-sm text-text placeholder:text-muted border border-border focus:outline-none focus:border-primary/50"
                      />
                      <button
                        onClick={() => { if (newDayName.trim()) addDayMutation.mutate(newDayName.trim()) }}
                        disabled={!newDayName.trim() || addDayMutation.isPending}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingDay(false); setNewDayName('') }}
                        className="rounded-xl bg-surface-elevated px-3 py-2 text-sm text-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingDay(true)}
                    className="w-full rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    + Add training day
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

interface DayCardProps {
  day: RoutineDayWithExercises
  isExpanded: boolean
  onToggle: () => void
  onStart: () => void
  onAddExercise: (exercise: Exercise) => void
  onRemoveExercise: (rdeId: string) => void
  onDelete: () => void
  userId?: string
}

function DayCard({ day, isExpanded, onToggle, onStart, onAddExercise, onRemoveExercise, onDelete, userId }: DayCardProps) {
  const [showExercisePicker, setShowExercisePicker] = useState(false)

  return (
    <div className={`rounded-2xl border transition-all ${isExpanded ? 'border-primary/30 bg-gradient-to-br from-slate-800/80 to-slate-900' : 'border-border bg-surface/40'}`}>
      {/* Day header */}
      <button
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={onToggle}
      >
        <div>
          <p className="font-semibold text-text">{day.name}</p>
          <p className="text-xs text-muted mt-0.5">
            {day.routine_day_exercises.length === 0
              ? 'No exercises yet'
              : `${day.routine_day_exercises.length} exercise${day.routine_day_exercises.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Exercise list */}
          {day.routine_day_exercises.length > 0 && (
            <div className="mb-3 divide-y divide-border/50">
              {day.routine_day_exercises.map((rde) => (
                <div key={rde.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2">
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{rde.exercise.name}</p>
                      <p className="text-xs text-muted">
                        {rde.target_sets}×{rde.target_reps}
                        {rde.rest_seconds && <> · {rde.rest_seconds}s rest</>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveExercise(rde.id)}
                    className="p-1.5 text-muted hover:text-danger transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add exercise button */}
          {showExercisePicker ? (
            <ExercisePicker
              userId={userId}
              onSelect={(ex) => { onAddExercise(ex); setShowExercisePicker(false) }}
              onClose={() => setShowExercisePicker(false)}
            />
          ) : (
            <button
              onClick={() => setShowExercisePicker(true)}
              className="mb-3 w-full rounded-xl border border-dashed border-border py-2.5 text-sm text-muted hover:border-primary/40 hover:text-primary transition-colors"
            >
              + Add exercise
            </button>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onStart}
              disabled={day.routine_day_exercises.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-primary/30 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Start workout
            </button>
            <button
              onClick={onDelete}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-muted hover:text-danger transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ExercisePickerProps {
  userId?: string
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

function ExercisePicker({ userId, onSelect, onClose }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', 'search', search, userId],
    queryFn: () =>
      search.trim()
        ? exerciseService.search(search, userId)
        : exerciseService.getAll(userId),
    placeholderData: (prev: unknown) => prev,
  })

  return (
    <div className="mb-3 rounded-xl border border-border bg-surface-elevated">
      <div className="flex items-center gap-2 p-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted flex-shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
        />
        <button onClick={onClose} className="text-muted hover:text-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-border/50">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-muted">Loading...</div>
        ) : (exercises ?? []).length === 0 ? (
          <div className="py-4 text-center text-xs text-muted">No exercises found</div>
        ) : (
          (exercises ?? []).slice(0, 20).map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface transition-colors"
            >
              <span className="text-sm font-medium text-text">{ex.name}</span>
              {ex.muscle_group && (
                <span className="text-xs text-muted">{ex.muscle_group}</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
