import { CalendarDays, MoveRight, Play } from 'lucide-react'
import type { DayPlan } from '../types'

interface TodayPanelProps {
  startDate: string | null
  currentDayNumber: number | null
  todayPlan: DayPlan | undefined
  onStartPlanToday: () => void
  onShowToday: () => void
}

export function TodayPanel({
  startDate,
  currentDayNumber,
  todayPlan,
  onStartPlanToday,
  onShowToday,
}: TodayPanelProps) {
  const isActivePlanDay =
    currentDayNumber !== null && currentDayNumber >= 1 && currentDayNumber <= 30

  return (
    <section
      aria-labelledby="today-panel-title"
      className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Today view
          </div>
          <h2 id="today-panel-title" className="text-xl font-semibold text-white">
            {!startDate && 'Choose your plan start'}
            {startDate && isActivePlanDay && `Day ${currentDayNumber} is due today`}
            {startDate && currentDayNumber !== null && currentDayNumber > 30 && 'Plan completed / review mode'}
            {startDate && currentDayNumber !== null && currentDayNumber < 1 && 'Plan starts later'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {!startDate &&
              'Set today as Day 1. The app will calculate the current plan day from that saved date.'}
            {startDate && isActivePlanDay && todayPlan
              ? `${todayPlan.cTopic} | ${todayPlan.thmTopic}`
              : null}
            {startDate && currentDayNumber !== null && currentDayNumber > 30
              ? 'All 30 calendar days have passed. You can keep checking, reviewing notes, and exporting backups.'
              : null}
            {startDate && currentDayNumber !== null && currentDayNumber < 1
              ? `Saved start date: ${startDate}.`
              : null}
          </p>
          {startDate ? <p className="mt-2 text-xs text-slate-400">Start date: {startDate}</p> : null}
        </div>

        {!startDate ? (
          <button
            type="button"
            onClick={onStartPlanToday}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="Start plan today"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Start plan today
          </button>
        ) : null}

        {isActivePlanDay ? (
          <button
            type="button"
            onClick={onShowToday}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            aria-label={`Jump to day ${currentDayNumber}`}
          >
            Show Day {currentDayNumber}
            <MoveRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </section>
  )
}
