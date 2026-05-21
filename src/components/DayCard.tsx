import { CheckCheck, RotateCcw } from 'lucide-react'
import type { DailyNotes, DayPlan, ProgressState } from '../types'
import { getDayNotes, getDayProgress } from '../utils/progress'
import { Checklist } from './Checklist'
import { NotesSection } from './NotesSection'
import { ProgressBar } from './ProgressBar'

interface DayCardProps {
  day: DayPlan
  progress: ProgressState
  isToday: boolean
  onToggleTask: (dayNumber: number, taskId: string, completed: boolean) => void
  onMarkDayComplete: (day: DayPlan) => void
  onClearDay: (day: DayPlan) => void
  onUpdateNotes: (dayNumber: number, patch: Partial<DailyNotes>) => void
}

export function DayCard({
  day,
  progress,
  isToday,
  onToggleTask,
  onMarkDayComplete,
  onClearDay,
  onUpdateNotes,
}: DayCardProps) {
  const dayProgress = getDayProgress(day, progress)
  const notes = getDayNotes(progress, day.dayNumber)

  return (
    <article
      id={`day-${day.dayNumber}`}
      className={`scroll-mt-6 rounded-lg border p-5 shadow-2xl shadow-slate-950/20 ${
        isToday
          ? 'border-cyan-300/60 bg-cyan-300/[0.08] ring-2 ring-cyan-300/20'
          : 'border-white/10 bg-slate-900/80'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 text-sm font-bold text-slate-950">
              Day {day.dayNumber}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-sm text-slate-300">
              Week {day.weekNumber}
            </span>
            {isToday ? (
              <span className="rounded-md border border-cyan-300/30 bg-cyan-300/15 px-2.5 py-1 text-sm font-medium text-cyan-100">
                Today
              </span>
            ) : null}
          </div>
          <h3 className="text-xl font-semibold text-white">{day.cTopic}</h3>
          <p className="mt-2 text-sm font-medium text-cyan-200">{day.thmTopic}</p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            <span className="font-semibold text-slate-100">Output: </span>
            {day.output}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onMarkDayComplete(day)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label={`Mark day ${day.dayNumber} complete`}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark day complete
          </button>
          <button
            type="button"
            onClick={() => onClearDay(day)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            aria-label={`Clear day ${day.dayNumber}`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear day
          </button>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar
          label={`${dayProgress.completedTasks} / ${dayProgress.totalTasks} tasks`}
          value={dayProgress.percent}
          tone={isToday ? 'cyan' : 'emerald'}
        />
      </div>

      <div className="mt-6">
        <Checklist day={day} progress={progress} onToggleTask={onToggleTask} />
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <NotesSection dayNumber={day.dayNumber} notes={notes} onChange={onUpdateNotes} />
      </div>
    </article>
  )
}
