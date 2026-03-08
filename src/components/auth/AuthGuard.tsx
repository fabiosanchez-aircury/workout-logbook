import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { PageSpinner } from '@/components/ui/Spinner'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
