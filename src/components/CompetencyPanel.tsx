import type { AppProgress, DayPlan, MasteryRating, UpdateProgress } from '../types'
import { competencyMap } from '../data/competencies'
import { getDailyProgress } from '../lib/progress'

interface CompetencyPanelProps {
  day: DayPlan
  progress: AppProgress
  updateProgress: UpdateProgress
}

const ratingOptions: { value: MasteryRating; label: string }[] = [
  { value: 'not-yet', label: 'Not yet' },
  { value: 'basic', label: 'Basic' },
  { value: 'good', label: 'Good' },
  { value: 'strong', label: 'Strong' },
]

export function CompetencyPanel({ day, progress, updateProgress }: CompetencyPanelProps) {
  const setRating = (competencyId: string, rating: MasteryRating) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        competencyRatings: {
          ...current.competencyRatings,
          [competencyId]: rating,
        },
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            competencySelfRatings: {
              ...currentDay.competencySelfRatings,
              [competencyId]: rating,
            },
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  return (
    <section aria-labelledby={`day-${day.dayNumber}-competencies-title`} className="space-y-4">
      <div>
        <h4 id={`day-${day.dayNumber}-competencies-title`} className="text-lg font-semibold text-white">
          Competencies
        </h4>
        <p className="mt-1 text-sm text-slate-400">
          Ratings autosave and weak ratings appear in the Hour 1 review queue.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {day.competencies.map((competencyId) => {
          const competency = competencyMap.get(competencyId)

          if (!competency) {
            return null
          }

          const rating = progress.competencyRatings[competency.id] ?? 'not-yet'

          return (
            <article key={competency.id} className="rounded-md border border-white/10 bg-slate-950/50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h5 className="font-semibold text-white">{competency.title}</h5>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{competency.description}</p>
                </div>
                <select
                  value={rating}
                  onChange={(event) => setRating(competency.id, event.target.value as MasteryRating)}
                  className="min-h-10 rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  aria-label={`Self-rating for ${competency.title}`}
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Mastery criteria</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                    {competency.masteryCriteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Evidence</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                    {competency.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
