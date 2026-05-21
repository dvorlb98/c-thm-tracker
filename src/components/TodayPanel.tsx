import { CalendarDays, MoveRight, Play, RotateCcw } from 'lucide-react'
import type { AppProgress, DayPlan, ReviewQueueItem } from '../types'
import { getDailyProgress, getTaskId, getWeakCompetencies } from '../lib/progress'
import { getDueCards } from '../lib/flashcards'
import { allFlashcards } from '../data/curriculum'
import { getLatestQuizStatus } from '../lib/progress'
import { ReviewQueue } from './ReviewQueue'

interface TodayPanelProps {
  progress: AppProgress
  currentDayNumber: number | null
  todayPlan: DayPlan | undefined
  reviewQueue: ReviewQueueItem[]
  onStartPlanToday: () => void
  onShowToday: () => void
  onContinueWithoutShift: () => void
  onShiftPlan: () => void
}

export function TodayPanel({
  progress,
  currentDayNumber,
  todayPlan,
  reviewQueue,
  onStartPlanToday,
  onShowToday,
  onContinueWithoutShift,
  onShiftPlan,
}: TodayPanelProps) {
  const isActivePlanDay =
    currentDayNumber !== null && currentDayNumber >= 1 && currentDayNumber <= 30
  const dayProgress = todayPlan ? getDailyProgress(progress, todayPlan.dayNumber) : null
  const unfinishedTasks = todayPlan
    ? todayPlan.tasks.filter((_, index) => !dayProgress?.completedTasks.includes(getTaskId(todayPlan.dayNumber, index)))
    : []
  const dueCards = todayPlan
    ? getDueCards(todayPlan.flashcards, progress).length
    : getDueCards(allFlashcards, progress).length
  const quizStatus = todayPlan ? getLatestQuizStatus(progress, todayPlan.dayNumber) : null
  const weakCompetencies = getWeakCompetencies(progress)

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="today-panel-title"
        className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5"
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Today
            </div>
            <h2 id="today-panel-title" className="text-xl font-semibold text-white">
              {!progress.startDate && 'Start plan today'}
              {progress.startDate && isActivePlanDay && `Day ${currentDayNumber}: ${todayPlan?.title}`}
              {progress.startDate && currentDayNumber !== null && currentDayNumber > 30 && 'Plan completed / review mode'}
              {progress.startDate && currentDayNumber !== null && currentDayNumber < 1 && 'Plan starts later'}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              {!progress.startDate
                ? 'Set today as Day 1. Progress stays in this browser unless you export/import a JSON backup.'
                : null}
              {progress.startDate && isActivePlanDay && todayPlan
                ? `${todayPlan.objective} Expected evidence: ${todayPlan.expectedOutput}`
                : null}
              {progress.startDate && currentDayNumber !== null && currentDayNumber > 30
                ? 'Focus on due cards, weak competencies, unfinished quizzes, failed questions, and final review.'
                : null}
            </p>
            {progress.startDate ? (
              <p className="mt-2 text-xs text-slate-400">Start date: {progress.startDate}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {!progress.startDate ? (
              <button
                type="button"
                onClick={onStartPlanToday}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Start plan today
              </button>
            ) : null}
            {isActivePlanDay ? (
              <button
                type="button"
                onClick={onShowToday}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                Show Day {currentDayNumber}
                <MoveRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        {todayPlan ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-normal text-slate-500">Due cards</p>
              <p className="mt-1 text-2xl font-semibold text-white">{dueCards}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-normal text-slate-500">Unfinished tasks</p>
              <p className="mt-1 text-2xl font-semibold text-white">{unfinishedTasks.length}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-normal text-slate-500">Quiz</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {quizStatus?.passed ? 'Passed' : quizStatus?.latestScore === null ? 'Not taken' : `${quizStatus?.latestScore}%`}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-normal text-slate-500">Shutdown</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {dayProgress?.shutdownComplete ? 'Complete' : 'Open'}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-normal text-slate-500">Weak areas</p>
              <p className="mt-1 text-2xl font-semibold text-white">{weakCompetencies.length}</p>
            </div>
          </div>
        ) : null}

        {progress.startDate ? (
          <div className="mt-5 rounded-md border border-white/10 bg-slate-950/50 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="font-semibold text-white">I missed a day</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Continue without shifting keeps calendar progress unchanged. Shift plan by one day moves the saved start date forward, so today becomes the previous plan day.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onContinueWithoutShift}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                >
                  <MoveRight className="h-4 w-4" aria-hidden="true" />
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onShiftPlan}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Shift one day
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <ReviewQueue items={reviewQueue} />
    </div>
  )
}
