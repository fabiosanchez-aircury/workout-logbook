import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { workoutService } from '@/services/workoutService'
import { routineService } from '@/services/routineService'
import { AppShell } from '@/components/layout/AppShell'
import { formatRelativeTime, formatElapsedTime, formatDuration } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const isSessionActive = useActiveSessionStore((s) => s.isActive)
  const sessionName = useActiveSessionStore((s) => s.sessionName)
  const startedAt = useActiveSessionStore((s) => s.startedAt)

  const { data: recentSessions } = useQuery({
    queryKey: ['sessions', 'recent', user?.id],
    queryFn: () => workoutService.getSessions(user!.id, 6),
    enabled: !!user,
  })

  const { data: routines } = useQuery({
    queryKey: ['routines', user?.id],
    queryFn: () => routineService.getAll(user!.id),
    enabled: !!user,
  })

  const displayName = profile?.display_name ?? profile?.username ?? 'there'
  const initials = displayName.slice(0, 1).toUpperCase()

  // Build last 7 days activity map
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d
  })
  const sessionDates = new Set(
    (recentSessions ?? []).map((s) => new Date(s.started_at).toDateString())
  )

  const nextRoutine = routines?.[0]

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-24 sm:pb-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted">{greeting()}</p>
            <h1 className="text-xl font-semibold text-text">{displayName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-text transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              {initials}
            </div>
          </div>
        </div>

        {/* Active session banner */}
        {isSessionActive && startedAt && (
          <button
            onClick={() => navigate('/workout/active')}
            className="w-full rounded-2xl border border-success/30 bg-success/10 p-4 text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" />
                </span>
                <div>
                  <p className="font-medium text-text">{sessionName}</p>
                  <p className="text-xs text-success">{formatElapsedTime(startedAt)} • In progress</p>
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        )}

        {/* Hero — Next Up card */}
        {!isSessionActive && nextRoutine && (
          <div className="relative overflow-hidden rounded-2xl bg-surface p-5">
            {/* Glow */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Next Up</p>
            <h2 className="mt-1 text-xl font-semibold text-text">{nextRoutine.name}</h2>
            {nextRoutine.description && (
              <p className="mt-1 text-sm text-muted">{nextRoutine.description}</p>
            )}
            <button
              onClick={() => navigate(`/routines/${nextRoutine.id}`)}
              className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5,3 19,12 5,21" fill="white" />
              </svg>
              Start Workout
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isSessionActive && !nextRoutine && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="1.8">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="font-medium text-text">No routines yet</p>
            <p className="mt-1 text-sm text-muted">Create a routine to start tracking workouts.</p>
            <Link to="/routines/new">
              <button className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                Create routine
              </button>
            </Link>
          </div>
        )}

        {/* Weekly progress */}
        <div className="rounded-2xl bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-text">This week</p>
            <p className="text-xs text-muted">
              {last7.filter((d) => sessionDates.has(d.toDateString())).length} / 7 days
            </p>
          </div>
          <div className="flex items-center justify-between gap-1">
            {last7.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString()
              const hasSession = sessionDates.has(d.toDateString())
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium transition-colors ${
                      isToday
                        ? 'bg-primary text-white'
                        : hasSession
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-elevated text-muted'
                    }`}
                  >
                    {d.getDate()}
                  </div>
                  <span className="text-[10px] text-muted">{DAY_LABELS[d.getDay()]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent activity */}
        {(recentSessions?.length ?? 0) > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Recent activity</h2>
              <Link to="/workout/history" className="text-xs font-medium text-primary">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {(recentSessions ?? []).slice(0, 5).map((session) => (
                <Link key={session.id} to={`/workout/${session.id}`}>
                  <div className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 transition-all active:scale-[0.99]">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2">
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{session.name}</p>
                      <p className="text-xs text-muted">
                        {formatRelativeTime(session.started_at)}
                        {session.finished_at && (
                          <> · {formatElapsedTime(session.started_at, session.finished_at)}</>
                        )}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted flex-shrink-0">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
