import { AlertTriangle, Brain, CheckCircle2, ListChecks } from 'lucide-react'
import type { ReviewQueueItem } from '../types'

interface ReviewQueueProps {
  items: ReviewQueueItem[]
  compact?: boolean
}

const priorityClass = {
  high: 'border-rose-300/30 bg-rose-400/10 text-rose-100',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  low: 'border-slate-500/30 bg-slate-800/60 text-slate-200',
}

export function ReviewQueue({ items, compact = false }: ReviewQueueProps) {
  const highCount = items.filter((item) => item.priority === 'high').length
  const mediumCount = items.filter((item) => item.priority === 'medium').length

  return (
    <section aria-labelledby="review-queue-title" className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
            <Brain className="h-4 w-4" aria-hidden="true" />
            Hour 1: Active Recall Review
          </div>
          <h2 id="review-queue-title" className="text-xl font-semibold text-white">
            Today you should review
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {items.length === 0
              ? 'No urgent review items yet. Start with today\'s active recall prompts.'
              : `${items.length} review items: ${highCount} high priority and ${mediumCount} medium priority.`}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
          <ListChecks className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Evidence before time spent
        </div>
      </div>

      {items.length > 0 ? (
        <div className={`mt-4 grid gap-3 ${compact ? '' : 'lg:grid-cols-2'}`}>
          {items.map((item) => (
            <div key={item.id} className={`rounded-md border p-3 ${priorityClass[item.priority]}`}>
              <div className="flex items-start gap-3">
                {item.priority === 'high' ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 opacity-90">{item.description}</p>
                  {item.dayNumber ? (
                    <p className="mt-1 text-xs opacity-75">Day {item.dayNumber}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
