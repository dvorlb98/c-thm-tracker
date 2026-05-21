import { Check, CheckCheck } from 'lucide-react'
import type { AppProgress, DayPlan, UpdateProgress } from '../types'
import { calculateDayProgress, getDailyProgress, getTaskId } from '../lib/progress'
import { ProgressBar } from './ProgressBar'

interface OverviewPanelProps {
  day: DayPlan
  progress: AppProgress
  updateProgress: UpdateProgress
}

export function OverviewPanel({ day, progress, updateProgress }: OverviewPanelProps) {
  const dayProgress = getDailyProgress(progress, day.dayNumber)
  const score = calculateDayProgress(day, progress)

  const toggleTask = (taskId: string, checked: boolean) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)
      const completedTasks = checked
        ? [...new Set([...currentDay.completedTasks, taskId])]
        : currentDay.completedTasks.filter((id) => id !== taskId)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            completedTasks,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const markTasksComplete = () => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)
      const completedTasks = day.tasks.map((_, index) => getTaskId(day.dayNumber, index))

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            completedTasks,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  return (
    <section aria-labelledby={`day-${day.dayNumber}-overview-title`} className="space-y-5">
      <div>
        <h4 id={`day-${day.dayNumber}-overview-title`} className="text-lg font-semibold text-white">
          Objective
        </h4>
        <p className="mt-2 text-sm leading-6 text-slate-300">{day.objective}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          <span className="font-semibold text-slate-100">Expected output/evidence: </span>
          {day.expectedOutput}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ProgressBar label="Tasks 20%" value={score.tasks * 5} />
        <ProgressBar label="Exercises 20%" value={score.exercises * 5} tone="cyan" />
        <ProgressBar label="Quiz 20%" value={score.quiz * 5} tone="violet" />
        <ProgressBar label="Flashcards 15%" value={Math.round((score.flashcards / 15) * 100)} tone="cyan" />
        <ProgressBar label="Active recall 10%" value={score.activeRecall * 10} />
        <ProgressBar label="Summary + shutdown 15%" value={Math.round((score.summaryShutdown / 15) * 100)} tone="violet" />
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h4 className="text-lg font-semibold text-white">Tasks</h4>
          <p className="mt-1 text-sm text-slate-400">
            These autosave immediately and account for 20% of the day score.
          </p>
        </div>
        <button
          type="button"
          onClick={markTasksComplete}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          Mark tasks complete
        </button>
      </div>

      <div className="space-y-3">
        {day.tasks.map((task, index) => {
          const taskId = getTaskId(day.dayNumber, index)
          const checked = dayProgress.completedTasks.includes(taskId)

          return (
            <label
              key={taskId}
              htmlFor={taskId}
              className={`grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-md border p-3 transition ${
                checked
                  ? 'border-emerald-300/25 bg-emerald-300/10'
                  : 'border-white/10 bg-slate-950/50 hover:border-cyan-300/30'
              }`}
            >
              <span className="relative mt-0.5 inline-flex h-5 w-5 items-center justify-center">
                <input
                  id={taskId}
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleTask(taskId, event.target.checked)}
                  className="peer h-5 w-5 appearance-none rounded border border-slate-500 bg-slate-950 transition checked:border-emerald-300 checked:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-slate-950 opacity-0 peer-checked:opacity-100" aria-hidden="true" />
              </span>
              <span className={`text-sm leading-6 ${checked ? 'text-emerald-50' : 'text-slate-200'}`}>
                {task}
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
