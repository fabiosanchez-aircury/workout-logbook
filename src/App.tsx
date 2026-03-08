import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/hooks/useAuth'

import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RoutinesPage } from '@/pages/RoutinesPage'
import { RoutineDetailPage } from '@/pages/RoutineDetailPage'
import { ActiveWorkoutPage } from '@/pages/ActiveWorkoutPage'
import { WorkoutHistoryPage } from '@/pages/WorkoutHistoryPage'
import { WorkoutDetailPage } from '@/pages/WorkoutDetailPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PublicProfilePage } from '@/pages/PublicProfilePage'

function AppRoutes() {
  useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/routines"
          element={
            <AuthGuard>
              <RoutinesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/routines/:id"
          element={
            <AuthGuard>
              <RoutineDetailPage />
            </AuthGuard>
          }
        />
        <Route
          path="/workout/active"
          element={
            <AuthGuard>
              <ActiveWorkoutPage />
            </AuthGuard>
          }
        />
        <Route
          path="/workout/history"
          element={
            <AuthGuard>
              <WorkoutHistoryPage />
            </AuthGuard>
          }
        />
        <Route
          path="/workout/:sessionId"
          element={
            <AuthGuard>
              <WorkoutDetailPage />
            </AuthGuard>
          }
        />
        <Route
          path="/progress"
          element={
            <AuthGuard>
              <ProgressPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
