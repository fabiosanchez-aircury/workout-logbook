import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'
import { workoutService } from '@/services/workoutService'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatElapsedTime } from '@/lib/utils'

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileService.getByUsername(username!),
    enabled: !!username,
  })

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', 'public', profile?.id],
    queryFn: () => workoutService.getSessions(profile!.id, 20),
    enabled: !!profile && (profile.is_public || !!token),
  })

  if (loadingProfile) return <PageSpinner />
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Profile not found.</p>
      </div>
    )
  }

  if (!profile.is_public && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">This profile is private.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">
              {profile.display_name ?? profile.username}
            </h1>
            {profile.username && <p className="text-sm text-muted">@{profile.username}</p>}
            {profile.bio && <p className="text-sm text-muted mt-1">{profile.bio}</p>}
          </div>
          {token && (
            <Badge variant="warning" className="ml-auto">
              Shared view
            </Badge>
          )}
        </div>

        {/* Recent sessions */}
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Recent sessions
          </h2>
          {loadingSessions ? (
            <PageSpinner />
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card key={session.id}>
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
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No sessions recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
