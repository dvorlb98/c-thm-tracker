import { BookOpenText } from 'lucide-react'
import type { DayPlan } from '../types'

interface ConceptBriefProps {
  day: DayPlan
}

export function ConceptBrief({ day }: ConceptBriefProps) {
  return (
    <section aria-labelledby={`day-${day.dayNumber}-concept-title`} className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpenText className="h-5 w-5 text-cyan-300" aria-hidden="true" />
        <h4 id={`day-${day.dayNumber}-concept-title`} className="text-lg font-semibold text-white">
          Concept brief
        </h4>
      </div>
      <p className="max-w-4xl text-sm leading-7 text-slate-300">{day.conceptBrief}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">C topic</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{day.cTopic}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">TryHackMe topic</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{day.thmTopic}</p>
        </div>
      </div>
    </section>
  )
}
