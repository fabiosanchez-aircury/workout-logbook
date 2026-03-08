import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { profileService } from '@/services/profileService'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscores').optional().or(z.literal('')),
  display_name: z.string().max(60).optional().or(z.literal('')),
  bio: z.string().max(200).optional().or(z.literal('')),
  is_public: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)
  const { signOut } = useAuth()
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copyLabel, setCopyLabel] = useState('Copy link')

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
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
    onSuccess: (updated) => setProfile(updated),
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
    setTimeout(() => setCopyLabel('Copy link'), 2000)
  }

  const onSubmit = handleSubmit((data) => saveMutation.mutateAsync(data))

  if (!profile) return null

  return (
    <AppShell>
      <TopBar title="Profile" />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-text">
              {profile.display_name ?? profile.username ?? 'User'}
            </p>
            {profile.username && (
              <p className="text-sm text-muted">@{profile.username}</p>
            )}
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={onSubmit} className="space-y-4">
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
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
              {...register('is_public')}
            />
            <span className="text-sm text-text">Public profile</span>
          </label>
          <Button type="submit" loading={saveMutation.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </form>

        {/* Sharing */}
        <Card>
          <p className="text-sm font-semibold text-text mb-3">Share profile</p>
          <p className="text-xs text-muted mb-3">
            Generate a private link to share your workout history with someone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => generateTokenMutation.mutateAsync()}
              loading={generateTokenMutation.isPending}
            >
              Generate link
            </Button>
            {(shareToken ?? profile.share_token) && (
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copyLabel}
              </Button>
            )}
          </div>
        </Card>

        {/* Sign out */}
        <Button variant="ghost" className="w-full text-danger" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </AppShell>
  )
}
