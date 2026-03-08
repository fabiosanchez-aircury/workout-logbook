import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { useRestTimer } from '@/hooks/useRestTimer'
import { workoutService } from '@/services/workoutService'
import { AppShell } from '@/components/layout/AppShell'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { formatDuration, formatElapsedTime, getRpeColor } from '@/lib/utils'
import type { ActiveSet } from '@/types/models'

function ElapsedClock({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(formatElapsedTime(startedAt))

  useEffect(() => {
    const id = setInterval(() => setElapsed(formatElapsedTime(startedAt)), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return <span className="font-mono text-primary text-sm font-semibold">{elapsed}</span>
}

export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const {
    sessionId,
    sessionName,
    startedAt,
    exercises,
    isActive,
    addSet,
    updateSet,
    completeSet,
    removeSet,
    finishSession,
    discardSession,
  } = useActiveSessionStore()

  const { isRunning, secondsLeft, totalSeconds, progress, startTimer, pause, resume, stop } =
    useRestTimer()

  if (!isActive) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-text-muted))" strokeWidth="1.5">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-text">No active session</p>
            <p className="text-sm text-muted mt-1">Go to Routines to start a workout.</p>
          </div>
          <button
            onClick={() => navigate('/routines')}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Go to Routines
          </button>
        </div>
      </AppShell>
    )
  }

  const handleCompleteSet = (exerciseId: string, setId: string, restSeconds: number | null) => {
    completeSet(exerciseId, setId)
    if (restSeconds && restSeconds > 0) {
      startTimer(restSeconds, setId)
    }
  }

  const handleFinish = async () => {
    if (!confirm('Finish this session?')) return
    const completedExercises = finishSession()
    const finishedAt = new Date().toISOString()
    stop()

    if (sessionId && startedAt) {
      try {
        await workoutService.finishSession(sessionId, finishedAt)
        const allSets = completedExercises.flatMap((ex) =>
          ex.sets
            .filter((s) => s.completed)
            .map((s) => ({
              session_id: sessionId,
              exercise_id: s.exerciseId,
              set_number: s.setNumber,
              weight_kg: s.weightKg,
              reps: s.reps,
              rpe: s.rpe,
              rest_sec: s.restSec,
              is_warmup: s.isWarmup,
              notes: s.notes,
            }))
        )
        await workoutService.insertSets(allSets)
        navigate(`/workout/${sessionId}`)
      } catch (err) {
        console.error('Failed to save session:', err)
      }
    }
  }

  const handleDiscard = () => {
    if (!confirm('Discard this session? All data will be lost.')) return
    stop()
    discardSession()
    navigate('/')
  }

  const completedSets = exercises.flatMap((ex) => ex.sets).filter((s) => s.completed).length
  const totalSets = exercises.flatMap((ex) => ex.sets).length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <button
          onClick={handleDiscard}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-text transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-text leading-tight">{sessionName}</p>
          {startedAt && <ElapsedClock startedAt={startedAt} />}
        </div>
        <button
          onClick={handleFinish}
          className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-primary/30 transition-all active:scale-95"
        >
          Finish
        </button>
      </header>

      {/* Progress bar */}
      {totalSets > 0 && (
        <div className="h-1 bg-surface">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(completedSets / totalSets) * 100}%` }}
          />
        </div>
      )}

      {/* Rest timer */}
      {(isRunning || secondsLeft > 0) && (
        <div className="mx-4 mt-4 rounded-2xl border border-success/20 bg-success/5 p-4">
          <div className="flex items-center gap-4">
            <ProgressRing progress={progress} size={56} strokeWidth={4} color="hsl(var(--color-success))">
              <span className="text-xs font-mono font-semibold text-success">
                {formatDuration(secondsLeft)}
              </span>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">Rest timer</p>
              <p className="text-xs text-muted">{formatDuration(totalSeconds)} total</p>
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <button
                  onClick={pause}
                  className="rounded-xl bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resume}
                  className="rounded-xl bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
                >
                  Resume
                </button>
              )}
              <button
                onClick={stop}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise sections */}
      <div className="flex-1 space-y-4 px-4 py-4 pb-32">
        {exercises.map((ex) => (
          <section key={ex.exerciseId} className="rounded-2xl bg-surface overflow-hidden">
            {/* Exercise header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div>
                <h3 className="font-semibold text-text">{ex.exercise.name}</h3>
                {ex.targetReps && (
                  <p className="text-xs text-muted mt-0.5">
                    {ex.targetSets}×{ex.targetReps}
                    {ex.restSeconds && <> · {ex.restSeconds}s rest</>}
                  </p>
                )}
              </div>
              <span className="text-xs font-medium text-muted">
                {ex.sets.filter((s) => s.completed).length}/{ex.sets.length}
              </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_2.5rem] gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted">
              <span className="text-center">Set</span>
              <span className="text-center">kg</span>
              <span className="text-center">Reps</span>
              <span className="text-center">RPE</span>
              <span />
            </div>

            {/* Sets */}
            <div className="px-2 pb-2">
              {ex.sets.map((set, idx) => {
                const isActive = !set.completed && idx === ex.sets.findIndex((s) => !s.completed)
                return (
                  <SetRow
                    key={set.id}
                    set={set}
                    isActiveSet={isActive}
                    onUpdate={(updates) => updateSet(ex.exerciseId, set.id, updates)}
                    onComplete={() => handleCompleteSet(ex.exerciseId, set.id, ex.restSeconds)}
                    onRemove={() => removeSet(ex.exerciseId, set.id)}
                  />
                )
              })}
            </div>

            {/* Add set */}
            <button
              onClick={() => addSet(ex.exerciseId)}
              className="mx-4 mb-3 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted hover:border-primary/40 hover:text-primary transition-colors"
            >
              + Add set
            </button>
          </section>
        ))}
      </div>

      {/* Fixed finish button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-6 pt-8">
        <button
          onClick={handleFinish}
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/30 transition-all active:scale-[0.99]"
        >
          Finish Workout
        </button>
      </div>
    </div>
  )
}

interface SetRowProps {
  set: ActiveSet
  isActiveSet: boolean
  onUpdate: (updates: Partial<ActiveSet>) => void
  onComplete: () => void
  onRemove: () => void
}

function SetRow({ set, isActiveSet, onUpdate, onComplete, onRemove }: SetRowProps) {
  return (
    <div
      className={`grid grid-cols-[2.5rem_1fr_1fr_1fr_2.5rem] gap-2 items-center rounded-xl px-2 py-1.5 mb-1 transition-all ${
        set.completed
          ? 'opacity-50'
          : isActiveSet
          ? 'border border-primary/40 bg-primary/5'
          : 'opacity-70'
      }`}
    >
      <span className="text-center text-sm font-mono text-muted">{set.setNumber}</span>

      <input
        type="number"
        inputMode="decimal"
        placeholder="—"
        value={set.weightKg ?? ''}
        onChange={(e) => onUpdate({ weightKg: e.target.value ? parseFloat(e.target.value) : null })}
        disabled={set.completed}
        className="w-full rounded-lg bg-surface-elevated px-2 py-1.5 text-sm text-center font-mono text-text border border-border/50 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
      />

      <input
        type="number"
        inputMode="numeric"
        placeholder="—"
        value={set.reps ?? ''}
        onChange={(e) => onUpdate({ reps: e.target.value ? parseInt(e.target.value) : null })}
        disabled={set.completed}
        className="w-full rounded-lg bg-surface-elevated px-2 py-1.5 text-sm text-center font-mono text-text border border-border/50 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
      />

      <input
        type="number"
        inputMode="numeric"
        placeholder="—"
        min={1}
        max={10}
        value={set.rpe ?? ''}
        onChange={(e) => onUpdate({ rpe: e.target.value ? parseInt(e.target.value) : null })}
        disabled={set.completed}
        className={`w-full rounded-lg bg-surface-elevated px-2 py-1.5 text-sm text-center font-mono border border-border/50 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors ${getRpeColor(set.rpe)}`}
      />

      <button
        onClick={set.completed ? onRemove : onComplete}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90 ${
          set.completed
            ? 'bg-success/20 text-success'
            : isActiveSet
            ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
            : 'bg-surface-elevated text-muted hover:bg-primary/20 hover:text-primary'
        }`}
        title={set.completed ? 'Undo' : 'Mark complete'}
      >
        {set.completed ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </button>
    </div>
  )
}
