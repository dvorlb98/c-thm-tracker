import { Clock3 } from 'lucide-react'
import { dailyBlocks } from '../data/plan'

export function DailyTemplate() {
  return (
    <section
      aria-labelledby="daily-template-title"
      className="rounded-lg border border-white/10 bg-slate-900/80 p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-cyan-300" aria-hidden="true" />
        <h2 id="daily-template-title" className="text-lg font-semibold text-white">
          Flexible 10-hour blocks
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dailyBlocks.map((block) => (
          <div key={block.label} className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <div className="text-sm font-semibold text-cyan-200">{block.label}</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">{block.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
