import { NotebookText } from 'lucide-react'
import type { DailyNotes } from '../types'

interface NotesSectionProps {
  dayNumber: number
  notes: DailyNotes
  onChange: (dayNumber: number, patch: Partial<DailyNotes>) => void
}

export function NotesSection({ dayNumber, notes, onChange }: NotesSectionProps) {
  return (
    <section aria-labelledby={`day-${dayNumber}-notes-title`} className="space-y-4">
      <div className="flex items-center gap-2 text-slate-200">
        <NotebookText className="h-4 w-4 text-violet-300" aria-hidden="true" />
        <h4 id={`day-${dayNumber}-notes-title`} className="font-semibold">
          Notes and daily shutdown
        </h4>
      </div>

      <div>
        <label htmlFor={`day-${dayNumber}-notes`} className="mb-2 block text-sm text-slate-300">
          Day notes
        </label>
        <textarea
          id={`day-${dayNumber}-notes`}
          value={notes.notes}
          onChange={(event) => onChange(dayNumber, { notes: event.target.value })}
          rows={4}
          placeholder="Confusions, examples, commands, links, or ideas to review."
          className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label
            htmlFor={`day-${dayNumber}-learned`}
            className="mb-2 block text-sm text-slate-300"
          >
            Today I learned
          </label>
          <textarea
            id={`day-${dayNumber}-learned`}
            value={notes.todayLearned}
            onChange={(event) => onChange(dayNumber, { todayLearned: event.target.value })}
            rows={3}
            className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
          />
        </div>
        <div>
          <label
            htmlFor={`day-${dayNumber}-problems`}
            className="mb-2 block text-sm text-slate-300"
          >
            Problems I hit
          </label>
          <textarea
            id={`day-${dayNumber}-problems`}
            value={notes.problems}
            onChange={(event) => onChange(dayNumber, { problems: event.target.value })}
            rows={3}
            className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
          />
        </div>
        <div>
          <label
            htmlFor={`day-${dayNumber}-tomorrow`}
            className="mb-2 block text-sm text-slate-300"
          >
            Tomorrow I start with
          </label>
          <textarea
            id={`day-${dayNumber}-tomorrow`}
            value={notes.tomorrowStart}
            onChange={(event) => onChange(dayNumber, { tomorrowStart: event.target.value })}
            rows={3}
            className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
          />
        </div>
      </div>
    </section>
  )
}
