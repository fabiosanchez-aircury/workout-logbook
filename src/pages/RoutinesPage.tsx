import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRoutines } from '@/hooks/useRoutines'
import { AppShell } from '@/components/layout/AppShell'
import { PageSpinner } from '@/components/ui/Spinner'

const FILTERS = ['All', 'Active', 'Inactive']

export function RoutinesPage() {
  const { routines, isLoading, delete: deleteRoutine } = useRoutines()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = routines.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Active' && r.is_active) ||
      (filter === 'Inactive' && !r.is_active)
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await deleteRoutine(id)
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pb-24 sm:pb-5">
        {/* Header */}
        <div className="flex items-center justify-between py-5">
          <h1 className="text-xl font-semibold text-text">My Routines</h1>
          <Link to="/routines/new">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all active:scale-95">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search routines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted border border-border focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filter pills */}
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
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
              <p className="font-semibold text-text">
                {routines.length === 0 ? 'No routines yet' : 'No matches'}
              </p>
              <p className="text-sm text-muted mt-1">
                {routines.length === 0
                  ? 'Create a routine to plan your training days.'
                  : 'Try a different search or filter.'}
              </p>
            </div>
            {routines.length === 0 && (
              <Link to="/routines/new">
                <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                  Create routine
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={() => handleDelete(routine.id, routine.name)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {routines.length > 0 && (
          <div className="mt-6">
            <Link to="/routines/new">
              <button className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.99]">
                + Create Routine
              </button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}

interface RoutineCardProps {
  routine: { id: string; name: string; description: string | null; is_active: boolean }
  onDelete: () => void
}

function RoutineCard({ routine, onDelete }: RoutineCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all ${
        routine.is_active
          ? 'border-primary/30 bg-gradient-to-br from-slate-800/80 to-slate-900'
          : 'border-border bg-surface/40'
      }`}
    >
      <Link to={`/routines/${routine.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text truncate">{routine.name}</h3>
              {routine.is_active && (
                <span className="flex-shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                  Active
                </span>
              )}
            </div>
            {routine.description && (
              <p className="text-sm text-muted line-clamp-2">{routine.description}</p>
            )}
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted flex-shrink-0 mt-0.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>
      {/* Delete (shown on long hover) */}
      <button
        onClick={onDelete}
        className="absolute right-12 top-4 hidden rounded-lg p-1.5 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger sm:flex"
        aria-label="Delete"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3,6 5,6 21,6" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  )
}
