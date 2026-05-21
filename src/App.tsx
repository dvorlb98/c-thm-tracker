import { useMemo, useState } from 'react'
import { allFlashcards, curriculum } from './data/curriculum'
import { BackupPanel } from './components/BackupPanel'
import { CompetenciesDashboard } from './components/CompetenciesDashboard'
import { DeepWorkMode } from './components/DeepWorkMode'
import { DueCardsDashboard } from './components/DueCardsDashboard'
import { FlashcardReview } from './components/FlashcardReview'
import { GlobalNav, type AppView } from './components/GlobalNav'
import { Header } from './components/Header'
import { PlanView } from './components/PlanView'
import { ProgressOverview } from './components/ProgressOverview'
import { QuizResultsDashboard } from './components/QuizResultsDashboard'
import { ResourcesPanel } from './components/ResourcesPanel'
import { TodayPanel } from './components/TodayPanel'
import { useProgressStore } from './hooks/useProgressStore'
import { getCurrentDayNumber, getLocalDateKey } from './lib/date'
import {
  buildReviewQueue,
  getLastReviewedCardAt,
  getProgressStats,
  getShiftedStartDate,
} from './lib/progress'
import { getLastQuizAttemptAt } from './lib/quiz'

function App() {
  const {
    progress,
    updateProgress,
    replaceProgress,
    resetProgress,
    storageMessage,
    rawCorruptedData,
    clearStorageMessage,
  } = useProgressStore()
  const [activeView, setActiveView] = useState<AppView>('today')
  const currentDayNumber = getCurrentDayNumber(progress.startDate)
  const safeDayNumber =
    currentDayNumber && currentDayNumber >= 1 && currentDayNumber <= 30 ? currentDayNumber : 1
  const todayPlan = curriculum.find((day) => day.dayNumber === currentDayNumber)
  const stats = useMemo(() => getProgressStats(progress), [progress])
  const reviewQueue = useMemo(
    () => buildReviewQueue(progress, currentDayNumber ?? 1),
    [currentDayNumber, progress],
  )
  const lastReviewedCardAt = getLastReviewedCardAt(progress)
  const lastQuizAttemptAt = getLastQuizAttemptAt(progress)

  const startPlanToday = () => {
    updateProgress((current) => ({
      ...current,
      startDate: getLocalDateKey(),
    }))
  }

  const showToday = () => {
    if (!currentDayNumber) {
      return
    }

    setActiveView('plan')
    window.setTimeout(() => {
      document
        .getElementById(`day-${currentDayNumber}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const continueWithoutShift = () => {
    window.alert('Continuing without shifting keeps the saved start date unchanged.')
  }

  const shiftPlan = () => {
    const confirmed = window.confirm(
      'Shift the plan by one day? This moves your saved start date forward by one calendar day and makes today map to the previous plan day.',
    )

    if (!confirmed) {
      return
    }

    updateProgress((current) => ({
      ...current,
      startDate: getShiftedStartDate(current.startDate),
    }))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        lastSavedAt={progress.lastSavedAt}
        lastReviewedCardAt={lastReviewedCardAt}
        lastQuizAttemptAt={lastQuizAttemptAt}
      />
      <GlobalNav activeView={activeView} onChange={setActiveView} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {storageMessage ? (
          <div
            role="alert"
            className="flex flex-col justify-between gap-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center"
          >
            <span>{storageMessage}</span>
            <button
              type="button"
              onClick={clearStorageMessage}
              className="self-start rounded-md border border-amber-200/30 px-3 py-1.5 font-medium text-amber-50 transition hover:bg-amber-200/10 focus:outline-none focus:ring-2 focus:ring-amber-100 sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <ProgressOverview stats={stats} />

        {activeView === 'today' ? (
          <>
            <TodayPanel
              progress={progress}
              currentDayNumber={currentDayNumber}
              todayPlan={todayPlan}
              reviewQueue={reviewQueue}
              onStartPlanToday={startPlanToday}
              onShowToday={showToday}
              onContinueWithoutShift={continueWithoutShift}
              onShiftPlan={shiftPlan}
            />
            <DeepWorkMode
              progress={progress}
              updateProgress={updateProgress}
              defaultDayNumber={safeDayNumber}
            />
            <DueCardsDashboard progress={progress} />
          </>
        ) : null}

        {activeView === 'plan' ? (
          <PlanView
            progress={progress}
            currentDayNumber={currentDayNumber}
            updateProgress={updateProgress}
          />
        ) : null}

        {activeView === 'review' ? (
          <>
            <DueCardsDashboard progress={progress} />
            <FlashcardReview
              cards={allFlashcards}
              progress={progress}
              updateProgress={updateProgress}
              title="Global review queue"
            />
          </>
        ) : null}

        {activeView === 'quiz-results' ? <QuizResultsDashboard progress={progress} /> : null}

        {activeView === 'competencies' ? (
          <CompetenciesDashboard progress={progress} updateProgress={updateProgress} />
        ) : null}

        {activeView === 'resources' ? (
          <ResourcesPanel days={curriculum} progress={progress} updateProgress={updateProgress} />
        ) : null}

        {activeView === 'backup' ? (
          <BackupPanel
            progress={progress}
            rawCorruptedData={rawCorruptedData}
            onImport={replaceProgress}
            onResetAll={resetProgress}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
