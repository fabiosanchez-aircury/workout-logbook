import { describe, it, expect, beforeEach } from 'vitest'
import { useActiveSessionStore } from '@/stores/activeSessionStore'
import type { Exercise } from '@/types/models'

const mockExercise: Exercise = {
  id: 'ex-1',
  name: 'Squat',
  category: 'compound',
  muscle_group: 'legs',
  equipment: 'barbell',
  is_global: true,
  user_id: null,
  created_at: new Date().toISOString(),
}

describe('activeSessionStore', () => {
  beforeEach(() => {
    useActiveSessionStore.setState({
      sessionId: null,
      routineId: null,
      routineDayId: null,
      sessionName: '',
      startedAt: null,
      exercises: [],
      isActive: false,
    })
  })

  it('starts a session correctly', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: 'routine-1',
      routineDayId: 'day-1',
      name: 'Push Day',
      exercises: [
        {
          exercise: mockExercise,
          targetSets: 4,
          targetReps: '5',
          targetRpe: 8,
          restSeconds: 180,
        },
      ],
    })

    const state = useActiveSessionStore.getState()
    expect(state.isActive).toBe(true)
    expect(state.sessionName).toBe('Push Day')
    expect(state.exercises).toHaveLength(1)
    expect(state.exercises[0].exerciseId).toBe('ex-1')
    expect(state.exercises[0].sets).toHaveLength(0)
  })

  it('adds a set to an exercise', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Test',
      exercises: [{ exercise: mockExercise, targetSets: null, targetReps: null, targetRpe: null, restSeconds: null }],
    })

    const setId = useActiveSessionStore.getState().addSet('ex-1')
    const sets = useActiveSessionStore.getState().exercises[0].sets

    expect(sets).toHaveLength(1)
    expect(sets[0].id).toBe(setId)
    expect(sets[0].setNumber).toBe(1)
    expect(sets[0].completed).toBe(false)
  })

  it('updates a set', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Test',
      exercises: [{ exercise: mockExercise, targetSets: null, targetReps: null, targetRpe: null, restSeconds: null }],
    })

    const setId = useActiveSessionStore.getState().addSet('ex-1')
    useActiveSessionStore.getState().updateSet('ex-1', setId, { weightKg: 100, reps: 5 })

    const set = useActiveSessionStore.getState().exercises[0].sets[0]
    expect(set.weightKg).toBe(100)
    expect(set.reps).toBe(5)
  })

  it('completes a set', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Test',
      exercises: [{ exercise: mockExercise, targetSets: null, targetReps: null, targetRpe: null, restSeconds: null }],
    })

    const setId = useActiveSessionStore.getState().addSet('ex-1')
    useActiveSessionStore.getState().completeSet('ex-1', setId)

    expect(useActiveSessionStore.getState().exercises[0].sets[0].completed).toBe(true)
  })

  it('removes a set and renumbers remaining', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Test',
      exercises: [{ exercise: mockExercise, targetSets: null, targetReps: null, targetRpe: null, restSeconds: null }],
    })

    useActiveSessionStore.getState().addSet('ex-1')
    const setId2 = useActiveSessionStore.getState().addSet('ex-1')
    useActiveSessionStore.getState().addSet('ex-1')

    useActiveSessionStore.getState().removeSet('ex-1', setId2)
    const sets = useActiveSessionStore.getState().exercises[0].sets

    expect(sets).toHaveLength(2)
    expect(sets[0].setNumber).toBe(1)
    expect(sets[1].setNumber).toBe(2)
  })

  it('finishes session and resets state', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Test',
      exercises: [{ exercise: mockExercise, targetSets: null, targetReps: null, targetRpe: null, restSeconds: null }],
    })

    const exercises = useActiveSessionStore.getState().finishSession()
    expect(exercises).toHaveLength(1)
    expect(useActiveSessionStore.getState().isActive).toBe(false)
    expect(useActiveSessionStore.getState().exercises).toHaveLength(0)
  })

  it('fills rest time for a set', () => {
    useActiveSessionStore.getState().startSession({
      sessionId: 'session-1',
      routineId: null,
      routineDayId: null,
      name: 'Test',
      exercises: [{ exercise: mockExercise, targetSets: null, targetReps: null, targetRpe: null, restSeconds: null }],
    })

    const setId = useActiveSessionStore.getState().addSet('ex-1')
    useActiveSessionStore.getState().fillRestTime(setId, 120)

    const set = useActiveSessionStore.getState().exercises[0].sets[0]
    expect(set.restSec).toBe(120)
  })
})
