import { Check, NotebookText } from 'lucide-react'
import type { AppProgress, DayPlan, UpdateProgress } from '../types'
import { getDailyProgress } from '../lib/progress'

interface NotesShutdownProps {
  day: DayPlan
  progress: AppProgress
  updateProgress: UpdateProgress
}

const selfExplanationPrompts = [
  'What are the 3 most important ideas?',
  'What confused me',
  'What can I now do that I could not do before?',
]

const shutdownChecks = ['Did I commit code?', 'Did I review flashcards?', 'Did I write tomorrow\'s first action?']

export function NotesShutdown({ day, progress, updateProgress }: NotesShutdownProps) {
  const dayProgress = getDailyProgress(progress, day.dayNumber)

  const updateSelfSummary = (value: string) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            selfSummary: value,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const updateShutdownNote = (key: string, value: string) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            shutdownNotes: {
              ...currentDay.shutdownNotes,
              [key]: value,
            },
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const updateShutdownCheck = (key: string, value: boolean) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            shutdownChecks: {
              ...currentDay.shutdownChecks,
              [key]: value,
            },
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const setShutdownComplete = (value: boolean) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            shutdownComplete: value,
            completedAt: value ? savedAt : currentDay.completedAt,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  return (
    <section aria-labelledby={`day-${day.dayNumber}-notes-title`} className="space-y-5">
      <div className="flex items-center gap-2">
        <NotebookText className="h-5 w-5 text-violet-300" aria-hidden="true" />
        <h4 id={`day-${day.dayNumber}-notes-title`} className="text-lg font-semibold text-white">
          Notes / shutdown
        </h4>
      </div>

      <div>
        <label htmlFor={`day-${day.dayNumber}-self-summary`} className="mb-2 block text-sm font-medium text-slate-300">
          Explain today&apos;s topic as if teaching a beginner
        </label>
        <textarea
          id={`day-${day.dayNumber}-self-summary`}
          value={dayProgress.selfSummary}
          onChange={(event) => updateSelfSummary(event.target.value)}
          rows={5}
          className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {selfExplanationPrompts.map((prompt) => (
          <div key={prompt}>
            <label htmlFor={`day-${day.dayNumber}-${prompt}`} className="mb-2 block text-sm font-medium text-slate-300">
              {prompt}
            </label>
            <textarea
              id={`day-${day.dayNumber}-${prompt}`}
              value={dayProgress.shutdownNotes[prompt] ?? ''}
              onChange={(event) => updateShutdownNote(prompt, event.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {day.shutdownPrompts.map((prompt) => (
          <div key={prompt}>
            <label htmlFor={`day-${day.dayNumber}-${prompt}`} className="mb-2 block text-sm font-medium text-slate-300">
              {prompt}
            </label>
            <textarea
              id={`day-${day.dayNumber}-${prompt}`}
              value={dayProgress.shutdownNotes[prompt] ?? ''}
              onChange={(event) => updateShutdownNote(prompt, event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {shutdownChecks.map((check) => (
          <label key={check} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(dayProgress.shutdownChecks[check])}
              onChange={(event) => updateShutdownCheck(check, event.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-950 text-emerald-400 focus:ring-emerald-200"
            />
            {check}
          </label>
        ))}
      </div>

      <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <input
            type="checkbox"
            checked={dayProgress.shutdownComplete}
            onChange={(event) => setShutdownComplete(event.target.checked)}
            className="peer h-5 w-5 appearance-none rounded border border-emerald-300/40 bg-slate-950 checked:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <Check className="pointer-events-none absolute h-3.5 w-3.5 text-slate-950 opacity-0 peer-checked:opacity-100" aria-hidden="true" />
        </span>
        Shutdown complete
      </label>
    </section>
  )
}
