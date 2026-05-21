import { Brain, CheckCircle2, Flame, LibraryBig, Target } from 'lucide-react'
import type { ProgressStats } from '../types'
import { ProgressBar } from './ProgressBar'

interface ProgressOverviewProps {
  stats: ProgressStats
}

export function ProgressOverview({ stats }: ProgressOverviewProps) {
  const cards = [
    {
      label: 'Completed days',
      value: `${stats.completedDays}/${stats.totalDays}`,
      detail: 'Evidence-based completion',
      icon: CheckCircle2,
      tone: 'text-emerald-300',
    },
    {
      label: 'Due cards',
      value: String(stats.dueCards),
      detail: `${stats.overdueCards} overdue, ${stats.reviewedToday} reviewed today`,
      icon: Brain,
      tone: 'text-cyan-300',
    },
    {
      label: 'Quiz passes',
      value: `${stats.passedQuizzes}/${stats.totalDays}`,
      detail: `${stats.totalQuizSessions} saved sessions`,
      icon: Target,
      tone: 'text-violet-300',
    },
    {
      label: 'Weak competencies',
      value: String(stats.weakCompetencies),
      detail: 'Not yet or basic',
      icon: Flame,
      tone: 'text-amber-300',
    },
  ]

  return (
    <section aria-labelledby="progress-overview-title" className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/20">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="progress-overview-title" className="text-lg font-semibold text-white">
              Global progress
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Weighted by tasks, exercises, quiz, cards, recall, and shutdown evidence.
            </p>
          </div>
          <div className="rounded-md border border-emerald-400/25 bg-emerald-400/10 p-3 text-emerald-200">
            <LibraryBig className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <ProgressBar label="Average weighted progress" value={stats.averageWeightedProgress} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className="rounded-lg border border-white/10 bg-slate-900/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium uppercase tracking-normal text-slate-400">
                  {card.label}
                </h3>
                <Icon className={`h-5 w-5 ${card.tone}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-sm text-slate-400">{card.detail}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
