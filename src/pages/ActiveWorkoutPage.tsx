import { useNavigate } from 'react-router-dom'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { useRestTimer } from '@/hooks/useRestTimer'
import { workoutService } from '@/services/workoutService'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { formatDuration, formatElapsedTime, getRpeColor } from '@/lib/utils'
import type { ActiveSet } from '@/types/models'

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
          <p className="text-text font-semibold">No active session</p>
          <Button onClick={() => navigate('/routines')}>Start a workout</Button>
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

  return (
    <AppShell>
      <TopBar
        title={sessionName}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleDiscard} className="text-danger">
              Discard
            </Button>
            <Button size="sm" onClick={handleFinish}>
              Finish
            </Button>
          </div>
        }
      />

      {/* Rest timer */}
      {(isRunning || secondsLeft > 0) && (
        <div className="sticky top-14 z-20 bg-surface/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            <ProgressRing progress={progress} size={56} strokeWidth={4}>
              <span className="text-xs font-mono font-semibold text-primary">
                {formatDuration(secondsLeft)}
              </span>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm font-medium text-text">Rest timer</p>
              <p className="text-xs text-muted">{formatDuration(totalSeconds)} total</p>
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <Button size="sm" variant="secondary" onClick={pause}>Pause</Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={resume}>Resume</Button>
              )}
              <Button size="sm" variant="ghost" onClick={stop}>Skip</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Elapsed time */}
        {startedAt && (
          <p className="text-sm text-muted text-center">
            Elapsed: {formatElapsedTime(startedAt)}
          </p>
        )}

        {exercises.map((ex) => (
          <Card key={ex.exerciseId}>
            <CardHeader>
              <CardTitle>{ex.exercise.name}</CardTitle>
              {ex.targetReps && (
                <Badge variant="muted">{ex.targetSets}×{ex.targetReps}</Badge>
              )}
            </CardHeader>

            {/* Sets */}
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 text-xs text-muted px-1">
                <span>#</span>
                <span>kg</span>
                <span>reps</span>
                <span>RPE</span>
                <span />
              </div>

              {ex.sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  onUpdate={(updates) => updateSet(ex.exerciseId, set.id, updates)}
                  onComplete={() =>
                    handleCompleteSet(ex.exerciseId, set.id, ex.restSeconds)
                  }
                  onRemove={() => removeSet(ex.exerciseId, set.id)}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full border border-dashed border-border text-muted hover:border-primary/50 hover:text-primary"
              onClick={() => addSet(ex.exerciseId)}
            >
              + Add set
            </Button>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}

interface SetRowProps {
  set: ActiveSet
  onUpdate: (updates: Partial<ActiveSet>) => void
  onComplete: () => void
  onRemove: () => void
}

function SetRow({ set, onUpdate, onComplete, onRemove }: SetRowProps) {
  return (
    <div
      className={`grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 items-center rounded-lg px-1 py-1.5 ${
        set.completed ? 'bg-success/10' : ''
      }`}
    >
      <span className="text-sm text-muted font-mono text-center">{set.setNumber}</span>

      <input
        type="number"
        inputMode="decimal"
        placeholder="—"
        value={set.weightKg ?? ''}
        onChange={(e) =>
          onUpdate({ weightKg: e.target.value ? parseFloat(e.target.value) : null })
        }
        className="w-full rounded-md bg-surface-elevated px-2 py-1.5 text-sm text-center font-mono text-text border border-border focus:outline-none focus:border-primary"
      />

      <input
        type="number"
        inputMode="numeric"
        placeholder="—"
        value={set.reps ?? ''}
        onChange={(e) =>
          onUpdate({ reps: e.target.value ? parseInt(e.target.value) : null })
        }
        className="w-full rounded-md bg-surface-elevated px-2 py-1.5 text-sm text-center font-mono text-text border border-border focus:outline-none focus:border-primary"
      />

      <input
        type="number"
        inputMode="numeric"
        placeholder="—"
        min={1}
        max={10}
        value={set.rpe ?? ''}
        onChange={(e) =>
          onUpdate({ rpe: e.target.value ? parseInt(e.target.value) : null })
        }
        className={`w-full rounded-md bg-surface-elevated px-2 py-1.5 text-sm text-center font-mono border border-border focus:outline-none focus:border-primary ${getRpeColor(set.rpe)}`}
      />

      <button
        onClick={set.completed ? onRemove : onComplete}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          set.completed
            ? 'bg-success/20 text-success hover:bg-danger/20 hover:text-danger'
            : 'bg-surface-elevated text-muted hover:bg-primary/20 hover:text-primary'
        }`}
        title={set.completed ? 'Remove set' : 'Mark complete'}
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
