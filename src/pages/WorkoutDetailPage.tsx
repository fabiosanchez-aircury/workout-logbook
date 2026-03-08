import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { workoutService } from '@/services/workoutService'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatElapsedTime, formatWeight, calcVolume, getRpeColor } from '@/lib/utils'

export function WorkoutDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => workoutService.getSession(sessionId!),
    enabled: !!sessionId,
  })

  if (isLoading) return <AppShell><PageSpinner /></AppShell>
  if (!session) return <AppShell><p className="p-4 text-muted">Session not found.</p></AppShell>

  // Group sets by exercise
  const byExercise = session.workout_sets.reduce<Record<string, typeof session.workout_sets>>(
    (acc, set) => {
      const key = set.exercise_id
      if (!acc[key]) acc[key] = []
      acc[key].push(set)
      return acc
    },
    {}
  )

  const totalVolume = session.workout_sets.reduce(
    (sum, s) => sum + calcVolume(s.weight_kg, s.reps),
    0
  )

  return (
    <AppShell>
      <TopBar title={session.name} back />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>{formatDate(session.started_at)}</span>
          {session.finished_at && (
            <span>{formatElapsedTime(session.started_at, session.finished_at)}</span>
          )}
          <span>{(totalVolume / 1000).toFixed(1)}t volume</span>
        </div>

        {/* Per-exercise breakdown */}
        {Object.entries(byExercise).map(([exerciseId, sets]) => {
          const exercise = sets[0].exercise as { name: string } | undefined
          const exVolume = sets.reduce((sum, s) => sum + calcVolume(s.weight_kg, s.reps), 0)

          return (
            <Card key={exerciseId}>
              <CardHeader>
                <CardTitle>{(exercise as { name: string } | undefined)?.name ?? 'Exercise'}</CardTitle>
                <Badge variant="muted">{(exVolume / 1000).toFixed(2)}t</Badge>
              </CardHeader>
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-2 text-xs text-muted px-1 mb-1">
                  <span>#</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>RPE</span>
                </div>
                {sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-4 gap-2 text-sm px-1 py-1"
                  >
                    <span className="text-muted font-mono">{set.set_number}</span>
                    <span className="font-mono text-text">{formatWeight(set.weight_kg)} kg</span>
                    <span className="font-mono text-text">{set.reps ?? '—'}</span>
                    <span className={`font-mono ${getRpeColor(set.rpe)}`}>
                      {set.rpe ? `@${set.rpe}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}

        {session.notes && (
          <Card>
            <p className="text-sm text-muted font-medium mb-1">Notes</p>
            <p className="text-sm text-text">{session.notes}</p>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
