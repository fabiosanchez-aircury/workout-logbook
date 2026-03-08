import { useState } from 'react'
import { useVolumeChart, usePersonalRecords } from '@/hooks/useChartData'
import { AppShell } from '@/components/layout/AppShell'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatWeight } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const RANGES = [
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 },
  { label: '3M', days: 90 },
  { label: 'Year', days: 365 },
]

export function ProgressPage() {
  const [range, setRange] = useState(30)
  const { data: volumeData, isLoading: loadingVolume } = useVolumeChart(range)
  const { data: prs, isLoading: loadingPrs } = usePersonalRecords()

  const totalVolume = volumeData?.reduce((sum, d) => sum + d.totalVolume, 0) ?? 0
  const totalSessions = volumeData?.reduce((sum, d) => sum + d.sessionCount, 0) ?? 0
  const maxVolume = volumeData ? Math.max(...volumeData.map((d) => d.totalVolume), 0) : 0

  // Compute change vs previous period
  const half = Math.floor((volumeData?.length ?? 0) / 2)
  const firstHalf = volumeData?.slice(0, half).reduce((s, d) => s + d.totalVolume, 0) ?? 0
  const secondHalf = volumeData?.slice(half).reduce((s, d) => s + d.totalVolume, 0) ?? 0
  const pctChange = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pb-24 sm:pb-5">
        {/* Header */}
        <div className="flex items-center justify-between py-5">
          <h1 className="text-xl font-semibold text-text">Analytics</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted hover:text-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        {/* Time range segmented control */}
        <div className="mb-5 flex gap-1 rounded-2xl bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                range === r.days
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Chart card */}
        <div className="mb-4 rounded-2xl bg-surface p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Training Volume</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-text">
                  {(totalVolume / 1000).toFixed(1)}
                  <span className="text-sm font-normal text-muted ml-1">t</span>
                </p>
                {volumeData && volumeData.length > 2 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    pctChange >= 0
                      ? 'bg-success/15 text-success'
                      : 'bg-danger/15 text-danger'
                  }`}>
                    {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {loadingVolume ? (
            <div className="flex items-center justify-center h-40">
              <PageSpinner />
            </div>
          ) : volumeData && volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={volumeData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--color-text-muted))', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--color-text-muted))', fontSize: 10 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}t`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--color-surface-elevated))',
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--color-text))',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(2)}t`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="totalVolume"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#vGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted">
              No sessions in this period.
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: totalSessions.toString() },
            { label: 'Volume', value: `${(totalVolume / 1000).toFixed(1)}t` },
            { label: 'Records', value: (prs?.length ?? 0).toString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-surface p-3 text-center">
              <p className="text-xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Personal records */}
        <div className="rounded-2xl bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h2 className="text-sm font-semibold text-text">Personal Records</h2>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(var(--color-warning))" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          {loadingPrs ? (
            <div className="py-8 flex items-center justify-center">
              <PageSpinner />
            </div>
          ) : prs && prs.length > 0 ? (
            <div className="divide-y divide-border/50">
              {prs.slice(0, 10).map((pr, i) => (
                <div key={pr.exerciseId} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-warning/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(var(--color-warning))" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{pr.exerciseName}</p>
                    <p className="text-xs text-muted">{new Date(pr.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-primary">
                    {formatWeight(pr.weight)} kg × {pr.reps}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-muted">Complete workouts to see personal records.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
