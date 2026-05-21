import { useEffect, useMemo, useState } from 'react'
import { Clock3, Play, Square } from 'lucide-react'
import { curriculum, deepWorkBlocks } from '../data/curriculum'
import type { AppProgress, UpdateProgress } from '../types'

interface DeepWorkModeProps {
  progress: AppProgress
  updateProgress: UpdateProgress
  defaultDayNumber: number
}

const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function DeepWorkMode({ progress, updateProgress, defaultDayNumber }: DeepWorkModeProps) {
  const [dayNumber, setDayNumber] = useState(defaultDayNumber)
  const [blockLabel, setBlockLabel] = useState(deepWorkBlocks[0].label)
  const selectedDay = useMemo(
    () => curriculum.find((day) => day.dayNumber === dayNumber) ?? curriculum[0],
    [dayNumber],
  )
  const [task, setTask] = useState(selectedDay.tasks[0] ?? '')
  const selectedTask = selectedDay.tasks.includes(task) ? task : selectedDay.tasks[0] ?? ''
  const [intention, setIntention] = useState('')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [reflection, setReflection] = useState('')
  const [distractions, setDistractions] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const activeSession = progress.deepWorkSessions.find((session) => session.id === activeSessionId)

  useEffect(() => {
    if (!activeSessionId) {
      return undefined
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [activeSessionId])

  const start = () => {
    if (!intention.trim()) {
      return
    }

    const sessionId = `deep-work-${Date.now()}`
    setActiveSessionId(sessionId)
    setNow(Date.now())

    updateProgress((current, savedAt) => ({
      ...current,
      deepWorkSessions: [
        ...current.deepWorkSessions,
        {
          id: sessionId,
          dayNumber,
          blockLabel,
          task: selectedTask,
          intention,
          startedAt: savedAt,
        },
      ],
    }))
  }

  const end = (completed: boolean) => {
    if (!activeSessionId) {
      return
    }

    updateProgress((current, savedAt) => ({
      ...current,
      deepWorkSessions: current.deepWorkSessions.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              endedAt: savedAt,
              completed,
              reflection,
              distractions,
              nextAction,
            }
          : session,
      ),
    }))
    setActiveSessionId(null)
    setReflection('')
    setDistractions('')
    setNextAction('')
  }

  const elapsedSeconds = activeSession
    ? Math.max(0, Math.floor((now - new Date(activeSession.startedAt).getTime()) / 1000))
    : 0

  return (
    <section aria-labelledby="deep-work-title" className="rounded-lg border border-violet-300/20 bg-violet-300/10 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Deep Work Mode
          </div>
          <h2 id="deep-work-title" className="text-xl font-semibold text-white">
            Focus block
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            The goal is not to obey the clock perfectly. The goal is to complete deep work blocks with evidence.
          </p>
          <p className="mt-2 text-sm font-semibold text-amber-100">
            No forums, no social media, no random browsing during this block.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-slate-950/60 px-4 py-3 text-3xl font-semibold tabular-nums text-white">
          {formatElapsed(elapsedSeconds)}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Selected day</span>
          <select
            value={dayNumber}
            onChange={(event) => setDayNumber(Number(event.target.value))}
            disabled={Boolean(activeSessionId)}
            className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20 disabled:opacity-60"
          >
            {curriculum.map((day) => (
              <option key={day.dayNumber} value={day.dayNumber}>
                Day {day.dayNumber}: {day.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Selected block</span>
          <select
            value={blockLabel}
            onChange={(event) => setBlockLabel(event.target.value)}
            disabled={Boolean(activeSessionId)}
            className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20 disabled:opacity-60"
          >
            {deepWorkBlocks.map((block) => (
              <option key={block.label} value={block.label}>
                {block.label}: {block.text}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-300">
          <span className="mb-2 block font-medium">Selected task</span>
          <select
            value={selectedTask}
            onChange={(event) => setTask(event.target.value)}
            disabled={Boolean(activeSessionId)}
            className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20 disabled:opacity-60"
          >
            {selectedDay.tasks.map((taskItem) => (
              <option key={taskItem} value={taskItem}>
                {taskItem}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm text-slate-300">
        <span className="mb-2 block font-medium">During this block I will...</span>
        <textarea
          value={intention}
          onChange={(event) => setIntention(event.target.value)}
          disabled={Boolean(activeSessionId)}
          rows={3}
          className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20 disabled:opacity-60"
        />
      </label>

      {activeSessionId ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block font-medium">What did I complete?</span>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
            />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block font-medium">What distracted me?</span>
            <textarea
              value={distractions}
              onChange={(event) => setDistractions(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
            />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block font-medium">Next concrete action</span>
            <textarea
              value={nextAction}
              onChange={(event) => setNextAction(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {!activeSessionId ? (
          <button
            type="button"
            onClick={start}
            disabled={!intention.trim()}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-violet-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Start block
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => end(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              End complete
            </button>
            <button
              type="button"
              onClick={() => end(false)}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            >
              End incomplete
            </button>
          </>
        )}
      </div>
    </section>
  )
}
