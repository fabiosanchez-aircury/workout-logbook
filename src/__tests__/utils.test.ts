import { describe, it, expect } from 'vitest'
import { formatDuration, calcVolume, calc1RM, formatWeight, clamp, cn } from '@/lib/utils'

describe('formatDuration', () => {
  it('formats seconds under 1 hour as MM:SS', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(59)).toBe('00:59')
    expect(formatDuration(90)).toBe('01:30')
    expect(formatDuration(3599)).toBe('59:59')
  })

  it('formats seconds over 1 hour as HH:MM:SS', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3661)).toBe('1:01:01')
    expect(formatDuration(7322)).toBe('2:02:02')
  })
})

describe('calcVolume', () => {
  it('returns weight × reps', () => {
    expect(calcVolume(100, 5)).toBe(500)
    expect(calcVolume(80.5, 8)).toBe(644)
  })

  it('returns 0 for null values', () => {
    expect(calcVolume(null, 5)).toBe(0)
    expect(calcVolume(100, null)).toBe(0)
    expect(calcVolume(null, null)).toBe(0)
  })
})

describe('calc1RM', () => {
  it('returns weight directly for 1 rep', () => {
    expect(calc1RM(100, 1)).toBe(100)
  })

  it('estimates 1RM with Epley formula', () => {
    // 100kg × (1 + 5/30) = 116.67
    expect(calc1RM(100, 5)).toBeCloseTo(116.67, 1)
  })
})

describe('formatWeight', () => {
  it('formats integers without decimals', () => {
    expect(formatWeight(100)).toBe('100')
    expect(formatWeight(0)).toBe('0')
  })

  it('formats decimals with 1 decimal place', () => {
    expect(formatWeight(80.5)).toBe('80.5')
  })

  it('returns dash for null', () => {
    expect(formatWeight(null)).toBe('—')
  })
})

describe('clamp', () => {
  it('clamps value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('p-4', 'p-8')).toBe('p-8') // tailwind-merge dedupes
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })
})
