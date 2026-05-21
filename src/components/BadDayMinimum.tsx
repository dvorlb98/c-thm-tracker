import { Flame } from 'lucide-react'
import { badDayMinimum } from '../data/plan'

export function BadDayMinimum() {
  return (
    <section
      aria-labelledby="bad-day-minimum-title"
      className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-emerald-300" aria-hidden="true" />
        <h2 id="bad-day-minimum-title" className="text-lg font-semibold text-white">
          Bad Day Minimum
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {badDayMinimum.map((item) => (
          <div
            key={item}
            className="rounded-lg border border-emerald-300/20 bg-slate-950/50 px-4 py-3 text-sm font-medium text-emerald-100"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
