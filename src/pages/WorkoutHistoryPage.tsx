import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { workoutService } from '@/services/workoutService'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatElapsedTime } from '@/lib/utils'

export function WorkoutHistoryPage() {
  const userId = useAuthStore((s) => s.user?.id)

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', userId],
    queryFn: () => workoutService.getSessions(userId!, 50),
    enabled: !!userId,
  })

  return (
    <AppShell>
      <TopBar title="Workout History" back />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <PageSpinner />
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <Link key={session.id} to={`/workout/${session.id}`}>
              <Card className="hover:border-border/80 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">{session.name}</p>
                    <p className="text-sm text-muted mt-0.5">
                      {formatDate(session.started_at)}
                      {session.finished_at && (
                        <> · {formatElapsedTime(session.started_at, session.finished_at)}</>
                      )}
                    </p>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted flex-shrink-0"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted">No completed workouts yet.</p>
            <Link to="/routines">
              <button className="text-primary text-sm hover:underline">Start a workout</button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
