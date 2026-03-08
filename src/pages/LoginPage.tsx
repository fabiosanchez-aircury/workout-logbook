import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { DevQuickLogin } from '@/components/auth/DevQuickLogin'
import { Spinner } from '@/components/ui/Spinner'

export function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Background gym image effect */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23334155' width='100' height='100'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--color-primary))"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6.5 6.5h11M5 9h14M5 12h9M5 15h7M5 18h5" />
              <rect x="2" y="3" width="20" height="18" rx="2" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text">Workout Logbook</h1>
          <p className="mt-2 text-sm text-muted">Track your training, measure your progress.</p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          <button
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-medium text-text transition-all hover:border-border/80 hover:bg-surface-elevated active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.83.03 3.02 2.65 4.03 2.68 4.04l-.06.2zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button className="w-full text-sm font-medium text-muted underline-offset-4 hover:text-text hover:underline transition-colors">
          Continue with email
        </button>

        {/* Dev quick login */}
        {import.meta.env.DEV && <DevQuickLogin />}

        <p className="mt-10 text-center text-xs text-muted">
          By continuing, you agree to our{' '}
          <span className="cursor-pointer text-muted underline-offset-4 hover:underline">Terms</span>{' '}
          and{' '}
          <span className="cursor-pointer text-muted underline-offset-4 hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}
