import { useTimerStore } from '@/stores/timerStore'
import { useActiveSessionStore } from '@/stores/activeSessionStore'

export function useRestTimer() {
  const { isRunning, secondsLeft, totalSeconds, start, pause, resume, stop } = useTimerStore()
  const fillRestTime = useActiveSessionStore((s) => s.fillRestTime)

  const startTimer = (seconds: number, setId: string) => {
    start(seconds, setId, (completedSetId) => {
      fillRestTime(completedSetId, seconds)
    })
  }

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0

  return { isRunning, secondsLeft, totalSeconds, progress, startTimer, pause, resume, stop }
}
