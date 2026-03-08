import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Format duration from start date to now (or end date) in human-readable form
 */
export function formatElapsedTime(startedAt: string, finishedAt?: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  const totalSeconds = Math.floor((end - start) / 1000)
  return formatDuration(totalSeconds)
}

/**
 * Calculate total volume (weight × reps) for a set
 */
export function calcVolume(weightKg: number | null, reps: number | null): number {
  if (!weightKg || !reps) return 0
  return weightKg * reps
}

/**
 * Estimate 1 Rep Max using Epley formula
 */
export function calc1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}

/**
 * Format weight for display (removes trailing zeros)
 */
export function formatWeight(kg: number | null): string {
  if (kg === null) return '—'
  return kg % 1 === 0 ? `${kg}` : `${kg.toFixed(1)}`
}

/**
 * Format a date as relative time (e.g. "2 days ago")
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (diffDay > 0) return `${diffDay}d ago`
  if (diffHour > 0) return `${diffHour}h ago`
  if (diffMin > 0) return `${diffMin}m ago`
  return 'just now'
}

/**
 * Format date as "Mon, Mar 8"
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Generate a random UUID (for optimistic updates)
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Get RPE color token
 */
export function getRpeColor(rpe: number | null): string {
  if (!rpe) return 'text-muted'
  if (rpe <= 3) return 'text-intensity-low'
  if (rpe <= 7) return 'text-intensity-mid'
  return 'text-intensity-high'
}
