import { Brain, CheckCircle2, ClockAlert, Layers, TrendingUp } from 'lucide-react'
import { allFlashcards } from '../data/curriculum'
import type { AppProgress } from '../types'
import { getFlashcardStats } from '../lib/flashcards'

interface DueCardsDashboardProps {
  progress: AppProgress
}

export function DueCardsDashboard({ progress }: DueCardsDashboardProps) {
  const stats = getFlashcardStats(allFlashcards, progress)
  const items = [
    { label: 'Due today', value: stats.dueCards, icon: Brain, tone: 'text-cyan-300' },
    { label: 'Overdue', value: stats.overdueCards, icon: ClockAlert, tone: 'text-amber-300' },
    { label: 'Reviewed today', value: stats.reviewedToday, icon: CheckCircle2, tone: 'text-emerald-300' },
    { label: 'Mature cards', value: stats.matureCards, icon: TrendingUp, tone: 'text-violet-300' },
    { label: 'Weak cards', value: stats.weakCards, icon: Layers, tone: 'text-rose-300' },
    { label: 'Total cards', value: stats.totalCards, icon: Layers, tone: 'text-slate-300' },
  ]

  return (
    <section aria-labelledby="cards-dashboard-title" className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
      <h2 id="cards-dashboard-title" className="text-lg font-semibold text-white">
        Flashcard dashboard
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="rounded-md border border-white/10 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-normal text-slate-500">
                  {item.label}
                </span>
                <Icon className={`h-4 w-4 ${item.tone}`} aria-hidden="true" />
              </div>
              <p className="text-2xl font-semibold text-white">{item.value}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
