import { useMemo, useState } from 'react'
import { Boxes, Search } from 'lucide-react'
import { competencies } from '../data/competencies'
import type { AppProgress, CompetencyCategory, MasteryRating, UpdateProgress } from '../types'

interface CompetenciesDashboardProps {
  progress: AppProgress
  updateProgress: UpdateProgress
}

const categoryLabels: Record<CompetencyCategory, string> = {
  'c-fundamentals': 'C fundamentals',
  'control-flow': 'Expressions and control flow',
  functions: 'Functions and organization',
  'arrays-strings': 'Arrays and strings',
  'pointers-memory': 'Pointers and memory',
  'structs-data-modeling': 'Structs and data modeling',
  'files-errors': 'Files and error handling',
  'low-level': 'Low-level programming',
  tooling: 'Tooling',
  'web-thm': 'Web/TryHackMe context',
  security: 'Security basics',
  'learning-process': 'Learning process',
  'systems-design': 'Systems design basics',
}

const ratingLabels: { value: MasteryRating; label: string }[] = [
  { value: 'not-yet', label: 'Not yet' },
  { value: 'basic', label: 'Basic' },
  { value: 'good', label: 'Good' },
  { value: 'strong', label: 'Strong' },
]

export function CompetenciesDashboard({ progress, updateProgress }: CompetenciesDashboardProps) {
  const [query, setQuery] = useState('')
  const [weakOnly, setWeakOnly] = useState(false)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return competencies.filter((competency) => {
      const rating = progress.competencyRatings[competency.id] ?? 'not-yet'
      const weak = rating === 'not-yet' || rating === 'basic'
      const matchesWeak = !weakOnly || weak
      const text = [
        competency.title,
        competency.description,
        categoryLabels[competency.category],
        ...competency.masteryCriteria,
        ...competency.evidence,
        competency.relatedDays.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return matchesWeak && (!normalized || text.includes(normalized))
    })
  }, [progress.competencyRatings, query, weakOnly])

  const setRating = (competencyId: string, rating: MasteryRating) => {
    updateProgress((current) => ({
      ...current,
      competencyRatings: {
        ...current.competencyRatings,
        [competencyId]: rating,
      },
    }))
  }

  return (
    <section aria-labelledby="competencies-title" className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
              <Boxes className="h-4 w-4" aria-hidden="true" />
              Competencies
            </div>
            <h2 id="competencies-title" className="text-xl font-semibold text-white">
              Mastery dashboard
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Not yet and Basic ratings are weak areas and feed the review queue.
            </p>
          </div>
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={weakOnly}
              onChange={(event) => setWeakOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-950 text-cyan-300 focus:ring-cyan-200"
            />
            Weak only
          </label>
        </div>
        <label className="mt-4 block text-sm text-slate-300">
          <span className="mb-2 block font-medium">Search competencies</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-10 py-2 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              placeholder="pointers, DNS, files, deep work"
            />
          </div>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((competency) => {
          const rating = progress.competencyRatings[competency.id] ?? 'not-yet'

          return (
            <article key={competency.id} className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-cyan-200">
                    {categoryLabels[competency.category]}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{competency.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{competency.description}</p>
                </div>
                <select
                  value={rating}
                  onChange={(event) => setRating(competency.id, event.target.value as MasteryRating)}
                  className="min-h-10 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  aria-label={`Self-rating for ${competency.title}`}
                >
                  {ratingLabels.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
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
              <p className="mt-4 text-xs text-slate-500">Related days: {competency.relatedDays.join(', ')}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
