import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useActiveSessionStore } from '@/stores/activeSessionStore'

const navItems = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    to: '/routines',
    label: 'Routines',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const isSessionActive = useActiveSessionStore((s) => s.isActive)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-border pb-safe sm:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-text'
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      {isSessionActive && (
        <NavLink
          to="/workout/active"
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Session active
        </NavLink>
      )}
    </nav>
  )
}
