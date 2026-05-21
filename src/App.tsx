import { useMemo, useState } from 'react'
import { BadDayMinimum } from './components/BadDayMinimum'
import { DailyTemplate } from './components/DailyTemplate'
import { DayCard } from './components/DayCard'
import { Header } from './components/Header'
import { ImportExportControls } from './components/ImportExportControls'
import { ProgressOverview } from './components/ProgressOverview'
import { SearchBar } from './components/SearchBar'
import { TodayPanel } from './components/TodayPanel'
import { WeekFilter } from './components/WeekFilter'
import { plan, weekTitles } from './data/plan'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { DailyNotes, DayPlan, ProgressState } from './types'
import {
  STORAGE_KEY,
  createEmptyNotes,
  createEmptyProgress,
  dayMatchesQuery,
  getCurrentDayNumber,
  getLocalDateKey,
  getProgressStats,
  isProgressState,
} from './utils/progress'

function App() {
  const [progress, setProgress, storageMeta] = useLocalStorage<ProgressState>(
    STORAGE_KEY,
    createEmptyProgress(),
    isProgressState,
  )
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => getProgressStats(plan, progress), [progress])
  const currentDayNumber = getCurrentDayNumber(progress.startDate)
  const todayPlan = plan.find((day) => day.dayNumber === currentDayNumber)

  const filteredDays = useMemo(
    () =>
      plan.filter((day) => {
        const matchesWeek = selectedWeek === 'all' || day.weekNumber === selectedWeek
        return matchesWeek && dayMatchesQuery(day, searchQuery)
      }),
    [searchQuery, selectedWeek],
  )

  const groupedDays = useMemo(() => {
    const groups = new Map<number, DayPlan[]>()

    filteredDays.forEach((day) => {
      groups.set(day.weekNumber, [...(groups.get(day.weekNumber) ?? []), day])
    })

    return Array.from(groups.entries()).sort(([firstWeek], [secondWeek]) => firstWeek - secondWeek)
  }, [filteredDays])

  const updateProgress = (updater: (current: ProgressState, savedAt: string) => ProgressState) => {
    setProgress((current) => updater(current, new Date().toISOString()))
  }

  const handleToggleTask = (dayNumber: number, taskId: string, completed: boolean) => {
    updateProgress((current, savedAt) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [taskId]: {
          completed,
          completedAt: completed ? savedAt : null,
          dayNumber,
          taskId,
        },
      },
      lastSavedAt: savedAt,
      lastCompletedTaskAt: completed ? savedAt : current.lastCompletedTaskAt,
    }))
  }

  const handleMarkDayComplete = (day: DayPlan) => {
    updateProgress((current, savedAt) => {
      const nextTasks = { ...current.tasks }

      day.tasks.forEach((task) => {
        nextTasks[task.id] = {
          completed: true,
          completedAt: current.tasks[task.id]?.completedAt ?? savedAt,
          dayNumber: day.dayNumber,
          taskId: task.id,
        }
      })

      return {
        ...current,
        tasks: nextTasks,
        lastSavedAt: savedAt,
        lastCompletedTaskAt: savedAt,
      }
    })
  }

  const handleClearDay = (day: DayPlan) => {
    updateProgress((current, savedAt) => {
      const nextTasks = { ...current.tasks }

      day.tasks.forEach((task) => {
        nextTasks[task.id] = {
          completed: false,
          completedAt: null,
          dayNumber: day.dayNumber,
          taskId: task.id,
        }
      })

      return {
        ...current,
        tasks: nextTasks,
        lastSavedAt: savedAt,
      }
    })
  }

  const handleUpdateNotes = (dayNumber: number, patch: Partial<DailyNotes>) => {
    updateProgress((current, savedAt) => {
      const dayKey = String(dayNumber)

      return {
        ...current,
        notes: {
          ...current.notes,
          [dayKey]: {
            ...createEmptyNotes(),
            ...current.notes[dayKey],
            ...patch,
            updatedAt: savedAt,
          },
        },
        lastSavedAt: savedAt,
      }
    })
  }

  const handleStartPlanToday = () => {
    updateProgress((current, savedAt) => ({
      ...current,
      startDate: getLocalDateKey(),
      lastSavedAt: savedAt,
    }))
  }

  const handleShowToday = () => {
    if (currentDayNumber === null) {
      return
    }

    const targetDay = plan.find((day) => day.dayNumber === currentDayNumber)

    if (targetDay) {
      setSelectedWeek(targetDay.weekNumber)
      setSearchQuery('')
    }

    window.setTimeout(() => {
      document
        .getElementById(`day-${currentDayNumber}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const handleImportProgress = (importedProgress: ProgressState) => {
    setProgress({
      ...importedProgress,
      lastSavedAt: new Date().toISOString(),
    })
  }

  const handleResetAll = () => {
    const confirmed = window.confirm(
      'Reset all progress, notes, shutdown fields, and the start date? This cannot be undone unless you exported a JSON backup.',
    )

    if (!confirmed) {
      return
    }

    setProgress({
      ...createEmptyProgress(),
      lastSavedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        lastSavedAt={progress.lastSavedAt}
        lastCompletedTaskAt={progress.lastCompletedTaskAt}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {storageMeta.loadError ? (
          <div
            role="alert"
            className="flex flex-col justify-between gap-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center"
          >
            <span>{storageMeta.loadError}</span>
            <button
              type="button"
              onClick={storageMeta.clearLoadError}
              className="self-start rounded-md border border-amber-200/30 px-3 py-1.5 font-medium text-amber-50 transition hover:bg-amber-200/10 focus:outline-none focus:ring-2 focus:ring-amber-100 sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <ProgressOverview stats={stats} />

        <TodayPanel
          startDate={progress.startDate}
          currentDayNumber={currentDayNumber}
          todayPlan={todayPlan}
          onStartPlanToday={handleStartPlanToday}
          onShowToday={handleShowToday}
        />

        <ImportExportControls
          progress={progress}
          onImport={handleImportProgress}
          onResetAll={handleResetAll}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
          <div className="grid gap-5">
            <WeekFilter
              selectedWeek={selectedWeek}
              weekTitles={weekTitles}
              onChange={setSelectedWeek}
            />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="grid gap-5">
            <BadDayMinimum />
          </div>
        </div>

        <DailyTemplate />

        <section aria-labelledby="plan-title" className="space-y-6">
          <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="plan-title" className="text-2xl font-semibold text-white">
                30-day plan
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Showing {filteredDays.length} of {plan.length} days.
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Search and filters do not change saved progress.
            </p>
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
                    onToggleTask={handleToggleTask}
                    onMarkDayComplete={handleMarkDayComplete}
                    onClearDay={handleClearDay}
                    onUpdateNotes={handleUpdateNotes}
                  />
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
