import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { profileService } from '@/services/profileService'
import { workoutService } from '@/services/workoutService'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscores')
    .optional()
    .or(z.literal('')),
  display_name: z.string().max(60).optional().or(z.literal('')),
  bio: z.string().max(200).optional().or(z.literal('')),
  is_public: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const setProfile = useAuthStore((s) => s.setProfile)
  const { signOut } = useAuth()
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copyLabel, setCopyLabel] = useState('Copy')
  const [editMode, setEditMode] = useState(false)

  const { data: allSessions } = useQuery({
    queryKey: ['sessions', 'all', user?.id],
    queryFn: () => workoutService.getSessions(user!.id, 1000),
    enabled: !!user,
  })

  const totalWorkouts = allSessions?.length ?? 0
  const monthlyWorkouts =
    allSessions?.filter((s) => {
      const d = new Date(s.started_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length ?? 0

  // Streak: consecutive days ending today
  const streak = (() => {
    if (!allSessions?.length) return 0
    const dates = new Set(allSessions.map((s) => new Date(s.started_at).toDateString()))
    let count = 0
    const d = new Date()
    while (dates.has(d.toDateString())) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      username: profile?.username ?? '',
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
      is_public: profile?.is_public ?? false,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => profileService.update(profile!.id, data),
    onSuccess: (updated) => { setProfile(updated); setEditMode(false) },
  })

  const generateTokenMutation = useMutation({
    mutationFn: () => profileService.generateShareToken(profile!.id),
    onSuccess: (token) => setShareToken(token),
  })

  const copyLink = () => {
    const token = shareToken ?? profile?.share_token
    if (!token) return
    const url = `${window.location.origin}/u/${profile?.username ?? profile?.id}?token=${token}`
    navigator.clipboard.writeText(url)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }

  const onSubmit = handleSubmit((data) => saveMutation.mutateAsync(data))

  if (!profile) return null

  const displayName = profile.display_name ?? profile.username ?? 'User'
  const initials = displayName.slice(0, 1).toUpperCase()
  const memberSince = new Date(profile.created_at ?? Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 pb-24 sm:pb-5">
        {/* Header */}
        <div className="flex items-center justify-between py-5">
          <h1 className="text-xl font-semibold text-text">Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted hover:text-text transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/20 text-3xl font-bold text-primary">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <div className="text-center">
            <p className="font-semibold text-text text-lg">{displayName}</p>
            <p className="text-sm text-muted">Member since {memberSince}</p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="rounded-xl border border-border px-4 py-1.5 text-sm font-medium text-text hover:border-primary/40 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Workouts', value: totalWorkouts },
            { label: 'This month', value: monthlyWorkouts },
            { label: 'Day streak', value: streak },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {editMode && (
          <form onSubmit={onSubmit} className="mb-5 rounded-2xl bg-surface p-4 space-y-3">
            <h2 className="text-sm font-semibold text-text">Edit profile</h2>
            <Input
              label="Username"
              placeholder="yourname"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Display name"
              placeholder="Your Name"
              error={errors.display_name?.message}
              {...register('display_name')}
            />
            <Input
              label="Bio"
              placeholder="A short bio..."
              error={errors.bio?.message}
              {...register('bio')}
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saveMutation.isPending || !isDirty}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-xl bg-surface-elevated px-4 py-2.5 text-sm font-medium text-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* My Routines shortcut */}
        <Link to="/routines">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3.5 transition-all active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-text">My Routines</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Link>

        {/* Share profile */}
        <div className="mb-3 rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text">Share Profile</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-muted">Public</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={profile.is_public ?? false}
                  onChange={async (e) => {
                    const updated = await profileService.update(profile.id, { is_public: e.target.checked })
                    setProfile(updated)
                  }}
                />
                <div className="w-10 h-5 rounded-full bg-border peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          </div>
          {(shareToken ?? profile.share_token) ? (
            <div className="flex gap-2">
              <div className="flex-1 truncate rounded-xl bg-surface-elevated px-3 py-2 text-xs text-muted font-mono">
                {`${window.location.origin}/u/${profile.username ?? profile.id}?token=${shareToken ?? profile.share_token}`}
              </div>
              <button
                onClick={copyLink}
                className="flex-shrink-0 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-semibold text-primary"
              >
                {copyLabel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => generateTokenMutation.mutateAsync()}
              disabled={generateTokenMutation.isPending}
              className="w-full rounded-xl border border-border py-2 text-sm text-muted hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50"
            >
              {generateTokenMutation.isPending ? 'Generating...' : 'Generate share link'}
            </button>
          )}
        </div>

        {/* Preferences */}
        <div className="mb-5 rounded-2xl bg-surface overflow-hidden">
          {[
            {
              label: 'Weight Units',
              value: 'kg',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                  <path d="M12 8v4l3 3" />
                </svg>
              ),
            },
            {
              label: 'Notifications',
              value: 'On',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              ),
            },
            {
              label: 'Privacy Settings',
              value: '',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ),
            },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              className={`flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-surface-elevated transition-colors ${
                i < arr.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-muted">{item.icon}</span>
                <span className="text-sm font-medium text-text">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-xs text-muted">{item.value}</span>}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full rounded-2xl bg-danger/10 py-3.5 text-sm font-semibold text-danger transition-all active:scale-[0.99]"
        >
          Sign out
        </button>
      </div>
    </AppShell>
  )
}
