import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routineService } from '@/services/routineService'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { generateId } from '@/lib/utils'
import type { RoutineDayInsert } from '@/types/database.types'

type RoutineDayInsertType = RoutineDayInsert

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(300).optional(),
})

type FormValues = z.infer<typeof schema>

export function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  const [addingDay, setAddingDay] = useState(false)
  const [newDayName, setNewDayName] = useState('')

  const { data: routine, isLoading } = useQuery({
    queryKey: ['routines', id],
    queryFn: () => routineService.getById(id!),
    enabled: !isNew && !!id,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: routine?.name ?? '',
      description: routine?.description ?? '',
    },
    values: routine ? { name: routine.name, description: routine.description ?? '' } : undefined,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isNew) {
        const created = await routineService.create({
          ...data,
          user_id: userId!,
          is_active: false,
        })
        return created
      } else {
        return routineService.update(id!, data)
      }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      if (isNew) navigate(`/routines/${result.id}`, { replace: true })
    },
  })

  const addDayMutation = useMutation({
    mutationFn: (name: string) =>
      routineService.addDay({
        routine_id: id!,
        name,
        position: (routine?.routine_days?.length ?? 0) + 1,
      } as Parameters<typeof routineService.addDay>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines', id] })
      setAddingDay(false)
      setNewDayName('')
    },
  })

  const deleteDayMutation = useMutation({
    mutationFn: (dayId: string) => routineService.deleteDay(dayId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines', id] }),
  })

  const onSubmit = handleSubmit((data) => saveMutation.mutateAsync(data))

  return (
    <AppShell>
      <TopBar title={isNew ? 'New Routine' : 'Edit Routine'} back />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Basic info form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Routine name"
            placeholder="e.g. Push Pull Legs"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Description (optional)"
            placeholder="Brief description of this routine"
            {...register('description')}
          />
          <Button
            type="submit"
            loading={saveMutation.isPending}
            disabled={!isNew && !isDirty}
          >
            {isNew ? 'Create routine' : 'Save changes'}
          </Button>
        </form>

        {/* Days section — only shown after creation */}
        {!isNew && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
                Training days
              </h2>
              <Button size="sm" variant="ghost" onClick={() => setAddingDay(true)}>
                + Add day
              </Button>
            </div>

            {isLoading ? (
              <PageSpinner />
            ) : (
              <div className="space-y-2">
                {routine?.routine_days?.map((day) => (
                  <Card key={day.id} className="group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text">{day.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {day.routine_day_exercises?.length ?? 0} exercises
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted hover:text-danger"
                          onClick={() => {
                            if (confirm(`Delete day "${day.name}"?`))
                              deleteDayMutation.mutate(day.id)
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6l-1 14H6L5 6" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {addingDay && (
                  <Card elevated>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Day name (e.g. Day 1 – Push)"
                        value={newDayName}
                        onChange={(e) => setNewDayName(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newDayName.trim())
                            addDayMutation.mutate(newDayName.trim())
                          if (e.key === 'Escape') {
                            setAddingDay(false)
                            setNewDayName('')
                          }
                        }}
                      />
                      <Button
                        onClick={() => addDayMutation.mutate(newDayName.trim())}
                        loading={addDayMutation.isPending}
                        disabled={!newDayName.trim()}
                        size="md"
                      >
                        Add
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
