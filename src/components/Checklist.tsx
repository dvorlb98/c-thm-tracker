import { Check } from 'lucide-react'
import type { DayPlan, ProgressState } from '../types'
import { formatDateTime, getTaskProgress } from '../utils/progress'

interface ChecklistProps {
  day: DayPlan
  progress: ProgressState
  onToggleTask: (dayNumber: number, taskId: string, completed: boolean) => void
}

export function Checklist({ day, progress, onToggleTask }: ChecklistProps) {
  return (
    <div className="space-y-3">
      {day.tasks.map((task, index) => {
        const taskProgress = getTaskProgress(progress, day.dayNumber, task.id)
        const inputId = `${task.id}-checkbox`

        return (
          <label
            key={task.id}
            htmlFor={inputId}
            className={`grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border p-3 transition ${
              taskProgress.completed
                ? 'border-emerald-300/25 bg-emerald-300/10'
                : 'border-white/10 bg-slate-950/50 hover:border-cyan-300/30'
            }`}
          >
            <span className="relative mt-0.5 inline-flex h-5 w-5 items-center justify-center">
              <input
                id={inputId}
                type="checkbox"
                checked={taskProgress.completed}
                onChange={(event) =>
                  onToggleTask(day.dayNumber, task.id, event.target.checked)
                }
                className="peer h-5 w-5 appearance-none rounded border border-slate-500 bg-slate-950 transition checked:border-emerald-300 checked:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                aria-label={`Day ${day.dayNumber} task ${index + 1}: ${task.text}`}
              />
              <Check
                className="pointer-events-none absolute h-3.5 w-3.5 text-slate-950 opacity-0 peer-checked:opacity-100"
                aria-hidden="true"
              />
            </span>
            <span>
              <span
                className={`block text-sm leading-6 ${
                  taskProgress.completed ? 'text-emerald-50' : 'text-slate-200'
                }`}
              >
                {task.text}
              </span>
              {taskProgress.completedAt ? (
                <span className="mt-1 block text-xs text-emerald-200/80">
                  Completed {formatDateTime(taskProgress.completedAt)}
                </span>
              ) : null}
            </span>
          </label>
        )
      })}
    </div>
  )
}
