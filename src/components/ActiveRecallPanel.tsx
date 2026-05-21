import type { AppProgress, DayPlan, UpdateProgress } from '../types'
import {
  getActiveRecallPromptId,
  getDailyProgress,
  getInterleavingPromptId,
} from '../lib/progress'

interface ActiveRecallPanelProps {
  day: DayPlan
  progress: AppProgress
  updateProgress: UpdateProgress
}

export function ActiveRecallPanel({ day, progress, updateProgress }: ActiveRecallPanelProps) {
  const dayProgress = getDailyProgress(progress, day.dayNumber)

  const updateRecallAnswer = (promptId: string, answer: string) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            activeRecallAnswers: {
              ...currentDay.activeRecallAnswers,
              [promptId]: answer,
            },
            activeRecallAnswerMeta: {
              ...currentDay.activeRecallAnswerMeta,
              [promptId]: {
                promptId,
                answer,
                answeredAt: currentDay.activeRecallAnswerMeta[promptId]?.answeredAt ?? savedAt,
                dayNumber: day.dayNumber,
                lastUpdatedAt: savedAt,
              },
            },
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const updateInterleavingAnswer = (promptId: string, answer: string) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            interleavingAnswers: {
              ...currentDay.interleavingAnswers,
              [promptId]: answer,
            },
            interleavingAnswerMeta: {
              ...currentDay.interleavingAnswerMeta,
              [promptId]: {
                promptId,
                answer,
                answeredAt: currentDay.interleavingAnswerMeta[promptId]?.answeredAt ?? savedAt,
                dayNumber: day.dayNumber,
                lastUpdatedAt: savedAt,
              },
            },
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const interleavingId = getInterleavingPromptId(day.dayNumber)

  return (
    <section aria-labelledby={`day-${day.dayNumber}-recall-title`} className="space-y-5">
      <div>
        <h4 id={`day-${day.dayNumber}-recall-title`} className="text-lg font-semibold text-white">
          Active recall before study
        </h4>
        <p className="mt-1 text-sm text-slate-400">
          Answer from memory first. Textareas autosave with timestamps.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {day.activeRecallPrompts.map((prompt, index) => {
          const promptId = getActiveRecallPromptId(day.dayNumber, index)

          return (
            <div key={promptId}>
              <label htmlFor={promptId} className="mb-2 block text-sm font-medium text-slate-300">
                {prompt}
              </label>
              <textarea
                id={promptId}
                value={dayProgress.activeRecallAnswers[promptId] ?? ''}
                onChange={(event) => updateRecallAnswer(promptId, event.target.value)}
                rows={4}
                className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
            </div>
          )
        })}
      </div>

      <div className="rounded-md border border-violet-300/20 bg-violet-300/10 p-4">
        <label htmlFor={interleavingId} className="mb-2 block text-sm font-semibold text-violet-100">
          Interleaving prompt
        </label>
        <p className="mb-3 text-sm leading-6 text-slate-300">{day.interleavingPrompt}</p>
        <textarea
          id={interleavingId}
          value={dayProgress.interleavingAnswers[interleavingId] ?? ''}
          onChange={(event) => updateInterleavingAnswer(interleavingId, event.target.value)}
          rows={4}
          className="w-full resize-y rounded-md border border-violet-300/20 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
        />
      </div>
    </section>
  )
}
