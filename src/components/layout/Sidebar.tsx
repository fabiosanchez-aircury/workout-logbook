import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    to: '/routines',
    label: 'Routines',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/workout/history',
    label: 'History',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
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

  return (
    <aside className="hidden sm:flex flex-col w-64 min-h-screen bg-surface border-r border-border px-3 py-6">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-lg font-bold text-text">Workout Logbook</h1>
      </div>

      {/* Active session banner */}
      {isSessionActive && (
        <NavLink
          to="/workout/active"
          className="mb-4 flex items-center gap-2 rounded-lg bg-primary/15 border border-primary/30 px-3 py-2 text-sm text-primary font-medium hover:bg-primary/20 transition-colors"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Active session
        </NavLink>
      )}

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted hover:bg-surface-elevated hover:text-text'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {profile && (
        <div className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {profile.display_name ?? profile.username ?? 'User'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
