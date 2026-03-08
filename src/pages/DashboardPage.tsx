import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { workoutService } from '@/services/workoutService'
import { routineService } from '@/services/routineService'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatRelativeTime, formatElapsedTime } from '@/lib/utils'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const isSessionActive = useActiveSessionStore((s) => s.isActive)
  const sessionName = useActiveSessionStore((s) => s.sessionName)
  const startedAt = useActiveSessionStore((s) => s.startedAt)

  const { data: recentSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', 'recent', user?.id],
    queryFn: () => workoutService.getSessions(user!.id, 5),
    enabled: !!user,
  })

  const { data: routines, isLoading: loadingRoutines } = useQuery({
    queryKey: ['routines', user?.id],
    queryFn: () => routineService.getAll(user!.id),
    enabled: !!user,
  })

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = profile?.display_name ?? profile?.username ?? 'there'

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text">
            {greeting()}, {displayName}
          </h1>
          <p className="text-muted text-sm mt-1">Ready to train?</p>
        </div>

        {/* Active session banner */}
        {isSessionActive && startedAt && (
          <Link to="/workout/active">
            <Card className="border-primary/40 bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                  <div>
                    <p className="font-medium text-text">{sessionName}</p>
                    <p className="text-sm text-muted">{formatElapsedTime(startedAt)}</p>
                  </div>
                </div>
                <Badge variant="default">In progress</Badge>
              </div>
            </Card>
          </Link>
        )}

        {/* Quick start */}
        {!isSessionActive && (
          <div>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Quick start
            </h2>
            {loadingRoutines ? (
              <PageSpinner />
            ) : routines && routines.length > 0 ? (
              <div className="grid gap-2">
                {routines.slice(0, 3).map((routine) => (
                  <Link key={routine.id} to={`/routines/${routine.id}`}>
                    <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-text">{routine.name}</p>
                          {routine.description && (
                            <p className="text-sm text-muted line-clamp-1">{routine.description}</p>
                          )}
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
                ))}
              </div>
            ) : (
              <Card>
                <p className="text-sm text-muted text-center py-4">
                  No routines yet.{' '}
                  <Link to="/routines/new" className="text-primary hover:underline">
                    Create your first routine
                  </Link>
                </p>
              </Card>
            )}
            <div className="mt-3 flex justify-center">
              <Link to="/routines">
                <Button variant="ghost" size="sm">
                  View all routines
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Recent sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              Recent sessions
            </h2>
            <Link to="/workout/history" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {loadingSessions ? (
            <PageSpinner />
          ) : recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <Link key={session.id} to={`/workout/${session.id}`}>
                  <Card className="hover:border-border/80 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text text-sm">{session.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatRelativeTime(session.started_at)}
                          {session.finished_at && (
                            <> · {formatElapsedTime(session.started_at, session.finished_at)}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-muted text-center py-4">
                No sessions recorded yet.
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
