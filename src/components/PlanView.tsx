import { useMemo, useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { curriculum, weekTitles } from '../data/curriculum'
import type { AppProgress, DayPlan, UpdateProgress } from '../types'
import { calculateDayProgress, dayMatchesQuery, getDailyProgress } from '../lib/progress'
import { getDueCards } from '../lib/flashcards'
import { isQuizPassed } from '../lib/quiz'
import { DayCard } from './DayCard'

interface PlanViewProps {
  progress: AppProgress
  currentDayNumber: number | null
  updateProgress: UpdateProgress
}

export function PlanView({ progress, currentDayNumber, updateProgress }: PlanViewProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [incompleteOnly, setIncompleteOnly] = useState(false)
  const [dueFlashcardsOnly, setDueFlashcardsOnly] = useState(false)
  const [quizNotPassedOnly, setQuizNotPassedOnly] = useState(false)
  const [weakCompetenciesOnly, setWeakCompetenciesOnly] = useState(false)
  const [resourcesMissingOnly, setResourcesMissingOnly] = useState(false)

  const filteredDays = useMemo(
    () =>
      curriculum.filter((day) => {
        const matchesWeek = selectedWeek === 'all' || day.weekNumber === selectedWeek
        const matchesQuery = dayMatchesQuery(day, searchQuery)
        const matchesIncomplete = !incompleteOnly || !calculateDayProgress(day, progress).complete
        const matchesDueCards = !dueFlashcardsOnly || getDueCards(day.flashcards, progress).length > 0
        const matchesQuiz = !quizNotPassedOnly || !isQuizPassed(progress, day.dayNumber)
        const matchesWeak =
          !weakCompetenciesOnly ||
          day.competencies.some((competencyId) => {
            const rating = progress.competencyRatings[competencyId] ?? 'not-yet'
            return rating === 'not-yet' || rating === 'basic'
          })
        const matchesResources =
          !resourcesMissingOnly || getDailyProgress(progress, day.dayNumber).userResourceLinks.length === 0

        return (
          matchesWeek &&
          matchesQuery &&
          matchesIncomplete &&
          matchesDueCards &&
          matchesQuiz &&
          matchesWeak &&
          matchesResources
        )
      }),
    [
      dueFlashcardsOnly,
      incompleteOnly,
      progress,
      quizNotPassedOnly,
      resourcesMissingOnly,
      searchQuery,
      selectedWeek,
      weakCompetenciesOnly,
    ],
  )

  const groupedDays = useMemo(() => {
    const groups = new Map<number, DayPlan[]>()
    filteredDays.forEach((day) => groups.set(day.weekNumber, [...(groups.get(day.weekNumber) ?? []), day]))
    return Array.from(groups.entries()).sort(([firstWeek], [secondWeek]) => firstWeek - secondWeek)
  }, [filteredDays])

  const clearFilters = () => {
    setSelectedWeek('all')
    setSearchQuery('')
    setIncompleteOnly(false)
    setDueFlashcardsOnly(false)
    setQuizNotPassedOnly(false)
    setWeakCompetenciesOnly(false)
    setResourcesMissingOnly(false)
  }

  return (
    <section aria-labelledby="plan-title" className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 id="plan-title" className="text-xl font-semibold text-white">
              30-day plan
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Showing {filteredDays.length} of {curriculum.length} days. Search covers days, topics, competencies, cards, quizzes, and resources.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="block text-sm text-slate-300">
            <span className="mb-2 block font-medium">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="pointers, HTTP, structs, Linux, files"
                className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-10 py-2 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              />
            </div>
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 block font-medium">Week</span>
            <select
              value={selectedWeek}
              onChange={(event) => setSelectedWeek(event.target.value === 'all' ? 'all' : Number(event.target.value))}
              className="min-h-10 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
            >
              <option value="all">All weeks</option>
              {weekTitles.map((title, index) => (
                <option key={title} value={index + 1}>
                  Week {index + 1}: {title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['Incomplete', incompleteOnly, setIncompleteOnly],
            ['Due flashcards', dueFlashcardsOnly, setDueFlashcardsOnly],
            ['Quiz not passed', quizNotPassedOnly, setQuizNotPassedOnly],
            ['Weak competencies', weakCompetenciesOnly, setWeakCompetenciesOnly],
            ['Resources missing', resourcesMissingOnly, setResourcesMissingOnly],
          ].map(([label, checked, setChecked]) => (
            <label key={label as string} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
              <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                type="checkbox"
                checked={checked as boolean}
                onChange={(event) => (setChecked as (value: boolean) => void)(event.target.checked)}
                className="h-4 w-4 rounded border-slate-500 bg-slate-950 text-cyan-300 focus:ring-cyan-200"
              />
              {label as string}
            </label>
          ))}
        </div>
      </div>

      {groupedDays.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-slate-900/80 p-6 text-center text-slate-300">
          No days match the current filters.
        </div>
      ) : null}

      {groupedDays.map(([weekNumber, days]) => (
        <section key={weekNumber} aria-labelledby={`week-${weekNumber}-title`} className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-cyan-200">Week {weekNumber}</p>
            <h3 id={`week-${weekNumber}-title`} className="mt-1 text-xl font-semibold text-white">
              {weekTitles[weekNumber - 1]}
            </h3>
          </div>
          <div className="space-y-4">
            {days.map((day) => (
              <DayCard
                key={day.dayNumber}
                day={day}
                progress={progress}
                isToday={currentDayNumber === day.dayNumber}
                updateProgress={updateProgress}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}
