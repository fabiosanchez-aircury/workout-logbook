import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimerStore } from '@/stores/timerStore'

describe('timerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset store
    useTimerStore.setState({
      isRunning: false,
      secondsLeft: 0,
      totalSeconds: 0,
      targetSetId: null,
      onExpire: null,
      intervalId: null,
    })
  })

  afterEach(() => {
    useTimerStore.getState().stop()
    vi.useRealTimers()
  })

  it('starts with correct initial state', () => {
    const state = useTimerStore.getState()
    expect(state.isRunning).toBe(false)
    expect(state.secondsLeft).toBe(0)
  })

  it('starts timer with correct values', () => {
    const cb = vi.fn()
    useTimerStore.getState().start(60, 'set-1', cb)

    const state = useTimerStore.getState()
    expect(state.isRunning).toBe(true)
    expect(state.secondsLeft).toBe(60)
    expect(state.totalSeconds).toBe(60)
    expect(state.targetSetId).toBe('set-1')
  })

  it('decrements secondsLeft on tick', () => {
    const cb = vi.fn()
    useTimerStore.getState().start(30, 'set-1', cb)

    vi.advanceTimersByTime(1000)
    expect(useTimerStore.getState().secondsLeft).toBe(29)

    vi.advanceTimersByTime(5000)
    expect(useTimerStore.getState().secondsLeft).toBe(24)
  })

  it('calls onExpire when timer reaches 0', () => {
    const cb = vi.fn()
    useTimerStore.getState().start(3, 'set-42', cb)

    vi.advanceTimersByTime(3000)
    expect(cb).toHaveBeenCalledWith('set-42')
    expect(useTimerStore.getState().isRunning).toBe(false)
    expect(useTimerStore.getState().secondsLeft).toBe(0)
  })

  it('pauses timer', () => {
    const cb = vi.fn()
    useTimerStore.getState().start(30, 'set-1', cb)
    vi.advanceTimersByTime(5000)
    useTimerStore.getState().pause()

    expect(useTimerStore.getState().isRunning).toBe(false)
    expect(useTimerStore.getState().secondsLeft).toBe(25)

    // Does not continue after pause
    vi.advanceTimersByTime(5000)
    expect(useTimerStore.getState().secondsLeft).toBe(25)
  })

  it('resumes timer after pause', () => {
    const cb = vi.fn()
    useTimerStore.getState().start(30, 'set-1', cb)
    vi.advanceTimersByTime(5000)
    useTimerStore.getState().pause()
    useTimerStore.getState().resume()

    expect(useTimerStore.getState().isRunning).toBe(true)
    vi.advanceTimersByTime(5000)
    expect(useTimerStore.getState().secondsLeft).toBe(20)
  })

  it('stops and resets timer', () => {
    const cb = vi.fn()
    useTimerStore.getState().start(30, 'set-1', cb)
    useTimerStore.getState().stop()

    const state = useTimerStore.getState()
    expect(state.isRunning).toBe(false)
    expect(state.secondsLeft).toBe(0)
    expect(state.targetSetId).toBeNull()
  })
})
