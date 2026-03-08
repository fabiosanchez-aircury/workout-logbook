import { useState } from 'react'
import { useVolumeChart, usePersonalRecords } from '@/hooks/useChartData'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatWeight } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const RANGE_OPTIONS = [
  { label: '2W', days: 14 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
]

export function ProgressPage() {
  const [range, setRange] = useState(30)
  const { data: volumeData, isLoading: loadingVolume } = useVolumeChart(range)
  const { data: prs, isLoading: loadingPrs } = usePersonalRecords()

  const totalVolume = volumeData?.reduce((sum, d) => sum + d.totalVolume, 0) ?? 0
  const totalSessions = volumeData?.reduce((sum, d) => sum + d.sessionCount, 0) ?? 0

  return (
    <AppShell>
      <TopBar title="Progress" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Range selector */}
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setRange(opt.days)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                range === opt.days
                  ? 'bg-primary text-white'
                  : 'bg-surface-elevated text-muted hover:text-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-muted">Total volume</p>
            <p className="text-2xl font-bold text-text mt-1">
              {(totalVolume / 1000).toFixed(1)}
              <span className="text-sm font-normal text-muted ml-1">t</span>
            </p>
          </Card>
          <Card>
            <p className="text-xs text-muted">Sessions</p>
            <p className="text-2xl font-bold text-text mt-1">{totalSessions}</p>
          </Card>
        </div>

        {/* Volume chart */}
        <Card>
          <CardHeader>
            <CardTitle>Training volume</CardTitle>
          </CardHeader>
          {loadingVolume ? (
            <PageSpinner />
          ) : volumeData && volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220 90% 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220 90% 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--color-text-muted))', fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--color-text-muted))', fontSize: 11 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}t`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--color-surface-elevated))',
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--color-text))',
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(2)}t`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="totalVolume"
                  stroke="hsl(220 90% 56%)"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted text-center py-8">
              No sessions in this period.
            </p>
          )}
        </Card>

        {/* Personal records */}
        <Card>
          <CardHeader>
            <CardTitle>Personal records</CardTitle>
          </CardHeader>
          {loadingPrs ? (
            <PageSpinner />
          ) : prs && prs.length > 0 ? (
            <div className="divide-y divide-border">
              {prs.slice(0, 10).map((pr) => (
                <div key={pr.exerciseId} className="flex items-center justify-between py-2.5">
                  <p className="text-sm text-text">{pr.exerciseName}</p>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text font-mono">
                      {formatWeight(pr.weight)} kg × {pr.reps}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">
              Complete workouts to see personal records.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
