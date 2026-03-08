import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

const FIXTURE_USERS = [
  { id: 'alice', email: 'alice@dev.local', label: 'Alice', description: 'New user, no data' },
  { id: 'bob', email: 'bob@dev.local', label: 'Bob', description: '3 months of history' },
  { id: 'carol', email: 'carol@dev.local', label: 'Carol', description: 'Public profile' },
  { id: 'dave', email: 'dave@dev.local', label: 'Dave', description: 'Coach (edit permission)' },
  { id: 'eve', email: 'eve@dev.local', label: 'Eve', description: 'Heavy data, perf test' },
]

export function DevQuickLogin() {
  const [loading, setLoading] = useState<string | null>(null)

  const signInAs = async (email: string, userId: string) => {
    setLoading(userId)
    try {
      // Use magic link / password for local dev
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dev-password-123',
      })
      if (error) throw error
    } catch (err) {
      console.error('Dev login failed:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-4">
      <p className="mb-3 text-xs font-medium text-warning uppercase tracking-wider">
        Dev — Quick Login
      </p>
      <div className="grid grid-cols-1 gap-2">
        {FIXTURE_USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => signInAs(user.email, user.id)}
            disabled={loading === user.id}
            className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-2 text-left text-sm hover:bg-border transition-colors disabled:opacity-50"
          >
            <span>
              <span className="font-medium text-text">{user.label}</span>
              <span className="ml-2 text-muted">{user.description}</span>
            </span>
            {loading === user.id && (
              <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
