import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  back?: boolean
  actions?: ReactNode
  className?: string
}

export function TopBar({ title, back, actions, className }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 bg-background/90 backdrop-blur-sm',
        'border-b border-border px-4 h-14',
        className
      )}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-1.5 text-muted hover:bg-surface-elevated hover:text-text transition-colors -ml-1.5"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-text">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
