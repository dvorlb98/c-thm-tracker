import { CalendarCheck2, CheckCircle2, Target } from 'lucide-react'
import type { ProgressStats } from '../types'
import { ProgressBar } from './ProgressBar'

interface ProgressOverviewProps {
  stats: ProgressStats
}

export function ProgressOverview({ stats }: ProgressOverviewProps) {
  return (
    <section
      aria-labelledby="progress-overview-title"
      className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]"
    >
      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/20">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="progress-overview-title" className="text-lg font-semibold text-white">
              Global progress
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {stats.completedTasks} / {stats.totalTasks} tasks completed
            </p>
          </div>
          <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-3 text-emerald-200">
            <Target className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <ProgressBar label="Total completion" value={stats.totalPercent} />
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium uppercase tracking-normal text-slate-400">
            Completed days
          </h3>
          <CalendarCheck2 className="h-5 w-5 text-cyan-300" aria-hidden="true" />
        </div>
        <p className="text-4xl font-semibold text-white">{stats.completedDays}/30</p>
        <p className="mt-2 text-sm text-slate-400">A day counts when all tasks are checked.</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium uppercase tracking-normal text-slate-400">
            Remaining
          </h3>
          <CheckCircle2 className="h-5 w-5 text-violet-300" aria-hidden="true" />
        </div>
        <p className="text-4xl font-semibold text-white">
          {Math.max(0, stats.totalTasks - stats.completedTasks)}
        </p>
        <p className="mt-2 text-sm text-slate-400">Open checklist items across the plan.</p>
      </div>
    </section>
  )
}
