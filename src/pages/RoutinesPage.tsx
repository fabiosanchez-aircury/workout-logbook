import { Link } from 'react-router-dom'
import { useRoutines } from '@/hooks/useRoutines'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'

export function RoutinesPage() {
  const { routines, isLoading, delete: deleteRoutine } = useRoutines()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await deleteRoutine(id)
  }

  return (
    <AppShell>
      <TopBar
        title="Routines"
        actions={
          <Link to="/routines/new">
            <Button size="sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
            </Button>
          </Link>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <PageSpinner />
        ) : routines.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-surface flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-text-muted))" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text">No routines yet</p>
              <p className="text-sm text-muted mt-1">Create a routine to plan your training days.</p>
            </div>
            <Link to="/routines/new">
              <Button>Create routine</Button>
            </Link>
          </div>
        ) : (
          routines.map((routine) => (
            <Card key={routine.id} className="group">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/routines/${routine.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text">{routine.name}</h3>
                    {routine.is_active && <Badge variant="success">Active</Badge>}
                  </div>
                  {routine.description && (
                    <p className="text-sm text-muted line-clamp-2">{routine.description}</p>
                  )}
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/routines/${routine.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => handleDelete(routine.id, routine.name)}
                    className="text-muted hover:text-danger"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  )
}
