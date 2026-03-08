import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  secondsLeft: number
  totalSeconds: number
  targetSetId: string | null
  onExpire: ((setId: string) => void) | null
  intervalId: ReturnType<typeof setInterval> | null

  start: (seconds: number, setId: string, onExpire: (setId: string) => void) => void
  pause: () => void
  resume: () => void
  stop: () => void
  tick: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  secondsLeft: 0,
  totalSeconds: 0,
  targetSetId: null,
  onExpire: null,
  intervalId: null,

  start: (seconds, setId, onExpire) => {
    const state = get()
    // Clear any existing interval
    if (state.intervalId) clearInterval(state.intervalId)

    const intervalId = setInterval(() => {
      get().tick()
    }, 1000)

    set({
      isRunning: true,
      secondsLeft: seconds,
      totalSeconds: seconds,
      targetSetId: setId,
      onExpire,
      intervalId,
    })
  },

  pause: () => {
    const { intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    set({ isRunning: false, intervalId: null })
  },

  resume: () => {
    const state = get()
    if (state.isRunning || state.secondsLeft <= 0) return

    const intervalId = setInterval(() => {
      get().tick()
    }, 1000)

    set({ isRunning: true, intervalId })
  },

  stop: () => {
    const { intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    set({
      isRunning: false,
      secondsLeft: 0,
      totalSeconds: 0,
      targetSetId: null,
      onExpire: null,
      intervalId: null,
    })
  },

  tick: () => {
    const { secondsLeft, onExpire, targetSetId } = get()
    if (secondsLeft <= 1) {
      // Timer expired
      const { intervalId } = get()
      if (intervalId) clearInterval(intervalId)

      set({ isRunning: false, secondsLeft: 0, intervalId: null })

      if (onExpire && targetSetId) {
        onExpire(targetSetId)
      }
    } else {
      set({ secondsLeft: secondsLeft - 1 })
    }
  },
}))
