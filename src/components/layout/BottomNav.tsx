import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useActiveSessionStore } from '@/stores/activeSessionStore'

const navItems = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    to: '/routines',
    label: 'Routines',
    end: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} />
        <rect x="14" y="3" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} />
        <rect x="3" y="14" width="7" height="7" rx="1" fill={active ? 'currentColor' : 'none'} />
        <rect x="14" y="14" width="7" height="7" rx="1" fill="none" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Stats',
    end: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" strokeWidth={active ? '2.5' : '2'} />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    end: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
]

export function BottomNav() {
  const navigate = useNavigate()
  const isSessionActive = useActiveSessionStore((s) => s.isActive)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border pb-safe sm:hidden">
      <div className="flex items-center">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 flex-1 px-2 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-text'
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center FAB */}
        <div className="relative flex flex-col items-center flex-1">
          <button
            onClick={() => isSessionActive ? navigate('/workout/active') : navigate('/routines')}
            className={cn(
              'absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95',
              isSessionActive
                ? 'bg-success shadow-success/30 animate-pulse-ring'
                : 'bg-primary shadow-primary/40'
            )}
          >
            {isSessionActive ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
          <span className="mt-9 text-[11px] font-medium text-muted">
            {isSessionActive ? 'Active' : 'Log'}
          </span>
        </div>

        {/* Right 2 items */}
        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 flex-1 px-2 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-text'
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
