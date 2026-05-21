import { useState } from 'react'
import type { AppProgress, DayPlan, UpdateProgress } from '../types'
import { calculateDayProgress } from '../lib/progress'
import { ActiveRecallPanel } from './ActiveRecallPanel'
import { CompetencyPanel } from './CompetencyPanel'
import { ConceptBrief } from './ConceptBrief'
import { DayTabs, type DayTab } from './DayTabs'
import { ExercisePanel } from './ExercisePanel'
import { FlashcardReview } from './FlashcardReview'
import { NotesShutdown } from './NotesShutdown'
import { OverviewPanel } from './OverviewPanel'
import { ProgressBar } from './ProgressBar'
import { QuizPanel } from './QuizPanel'
import { ResourcesPanel } from './ResourcesPanel'

interface DayCardProps {
  day: DayPlan
  progress: AppProgress
  isToday: boolean
  updateProgress: UpdateProgress
}

export function DayCard({ day, progress, isToday, updateProgress }: DayCardProps) {
  const [activeTab, setActiveTab] = useState<DayTab>('overview')
  const score = calculateDayProgress(day, progress)

  return (
    <article
      id={`day-${day.dayNumber}`}
      className={`scroll-mt-24 rounded-lg border p-5 shadow-2xl shadow-slate-950/20 ${
        isToday
          ? 'border-cyan-300/60 bg-cyan-300/[0.08] ring-2 ring-cyan-300/20'
          : 'border-white/10 bg-slate-900/80'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 text-sm font-bold text-slate-950">
              Day {day.dayNumber}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-sm text-slate-300">
              Week {day.weekNumber}
            </span>
            {isToday ? (
              <span className="rounded-md border border-cyan-300/30 bg-cyan-300/15 px-2.5 py-1 text-sm font-medium text-cyan-100">
                Today
              </span>
            ) : null}
            <span className={`rounded-md px-2.5 py-1 text-sm font-medium ${
              score.complete ? 'bg-emerald-300/15 text-emerald-100' : 'border border-white/10 bg-white/[0.04] text-slate-300'
            }`}
            >
              {score.complete ? 'Complete' : 'In progress'}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">{day.title}</h3>
          <p className="mt-2 text-sm font-medium text-cyan-200">{day.cTopic}</p>
          <p className="mt-1 text-sm text-violet-200">{day.thmTopic}</p>
        </div>
        <div className="min-w-56">
          <ProgressBar label="Weighted progress" value={score.total} tone={isToday ? 'cyan' : 'emerald'} />
        </div>
      </div>

      <div className="mt-5">
        <DayTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-5">
        {activeTab === 'overview' ? (
          <OverviewPanel day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
        {activeTab === 'competencies' ? (
          <CompetencyPanel day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
        {activeTab === 'active-recall' ? (
          <ActiveRecallPanel day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
        {activeTab === 'concept' ? <ConceptBrief day={day} /> : null}
        {activeTab === 'exercises' ? (
          <ExercisePanel day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
        {activeTab === 'flashcards' ? (
          <FlashcardReview
            cards={day.flashcards}
            progress={progress}
            updateProgress={updateProgress}
            title={`Day ${day.dayNumber} flashcards`}
          />
        ) : null}
        {activeTab === 'quiz' ? (
          <QuizPanel day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
        {activeTab === 'notes' ? (
          <NotesShutdown day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
        {activeTab === 'resources' ? (
          <ResourcesPanel day={day} progress={progress} updateProgress={updateProgress} />
        ) : null}
      </div>
    </article>
  )
}
