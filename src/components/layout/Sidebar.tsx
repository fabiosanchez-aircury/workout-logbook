import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    to: '/routines',
    label: 'Routines',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
        <rect x="14" y="3" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/workout/history',
    label: 'History',
    icon: (_active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Analytics',
    icon: (_active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (_active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const isSessionActive = useActiveSessionStore((s) => s.isActive)
  const profile = useAuthStore((s) => s.profile)
  const displayName = profile?.display_name ?? profile?.username ?? 'User'
  const initials = displayName.slice(0, 1).toUpperCase()

  return (
    <aside className="hidden sm:flex flex-col w-64 min-h-screen bg-surface border-r border-border py-6">
      {/* Logo */}
      <div className="mb-8 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2">
              <path d="M6.5 6.5h11M5 9h14M5 12h9M5 15h7M5 18h5" />
              <rect x="2" y="3" width="20" height="18" rx="2" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold text-text">Workout Logbook</h1>
        </div>
      </div>

      {/* Active session banner */}
      {isSessionActive && (
        <NavLink
          to="/workout/active"
          className="mx-3 mb-4 flex items-center gap-2.5 rounded-xl bg-primary/15 border border-primary/30 px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/20 transition-colors"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary flex-shrink-0" />
          Active session
        </NavLink>
      )}

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-surface-elevated hover:text-text'
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      {profile && (
        <div className="mx-3 mt-4 rounded-xl bg-surface-elevated p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{displayName}</p>
              {profile.username && (
                <p className="text-xs text-muted truncate">@{profile.username}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
