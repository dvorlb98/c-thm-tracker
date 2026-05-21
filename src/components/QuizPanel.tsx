import { useMemo, useState } from 'react'
import { CheckCircle2, RotateCcw, Send, XCircle } from 'lucide-react'
import type { AppProgress, DayPlan, UpdateProgress } from '../types'
import { createQuizSession, getBestQuizScore, getLatestQuizSession } from '../lib/quiz'
import { formatDateTime } from '../lib/date'
import { getDailyProgress } from '../lib/progress'

interface QuizPanelProps {
  day: DayPlan
  progress: AppProgress
  updateProgress: UpdateProgress
}

export function QuizPanel({ day, progress, updateProgress }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const latestSession = getLatestQuizSession(progress, day.dayNumber)
  const bestScore = getBestQuizScore(progress, day.dayNumber)
  const latestAttempts = useMemo(
    () => new Map(latestSession?.attempts.map((attempt) => [attempt.questionId, attempt]) ?? []),
    [latestSession],
  )

  const submitQuiz = () => {
    const session = createQuizSession(day, answers, startedAt)

    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)
      const failedQuizQuestions = session.attempts
        .filter((attempt) => !attempt.isCorrect)
        .map((attempt) => attempt.questionId)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            quizSessions: [...currentDay.quizSessions, session],
            failedQuizQuestions,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const retake = () => {
    setAnswers({})
    setStartedAt(new Date().toISOString())
  }

  return (
    <section aria-labelledby={`day-${day.dayNumber}-quiz-title`} className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h4 id={`day-${day.dayNumber}-quiz-title`} className="text-lg font-semibold text-white">
            Quiz
          </h4>
          <p className="mt-1 text-sm text-slate-400">
            Score 80% or higher to pass. Failed questions return to the review queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-300">
            Latest: {latestSession ? `${latestSession.score}%` : 'None'}
          </span>
          <span className="rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-300">
            Best: {bestScore}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {day.quiz.map((question, index) => {
          const latestAttempt = latestAttempts.get(question.id)

          return (
            <article key={question.id} className="rounded-md border border-white/10 bg-slate-950/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                  Q{index + 1}
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                  {question.type}
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                  {question.difficulty}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-white">{question.prompt}</p>

              {question.choices ? (
                <div className="mt-3 grid gap-2">
                  {question.choices.map((choice) => (
                    <label key={choice} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === choice}
                        onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice }))}
                        className="h-4 w-4 border-slate-500 bg-slate-950 text-cyan-300 focus:ring-cyan-200"
                      />
                      {choice}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, [question.id]: event.target.value }))
                  }
                  rows={4}
                  className="mt-3 w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  aria-label={`Answer for question ${index + 1}`}
                />
              )}

              {latestAttempt ? (
                <div
                  className={`mt-3 rounded-md border p-3 ${
                    latestAttempt.isCorrect
                      ? 'border-emerald-300/25 bg-emerald-300/10'
                      : 'border-rose-300/25 bg-rose-400/10'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {latestAttempt.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-300" aria-hidden="true" />
                    )}
                    <span className={latestAttempt.isCorrect ? 'text-emerald-100' : 'text-rose-100'}>
                      {latestAttempt.isCorrect ? 'Correct' : 'Review this'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{question.explanation}</p>
                  {!latestAttempt.isCorrect ? (
                    <p className="mt-2 text-sm text-slate-300">
                      Expected idea: {question.correctAnswer}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submitQuiz}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Submit quiz
        </button>
        <button
          type="button"
          onClick={retake}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retake
        </button>
      </div>

      {latestSession ? (
        <div className="rounded-md border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
          Latest session completed {formatDateTime(latestSession.completedAt)} with {latestSession.score}%.
          {latestSession.passed ? ' Passed.' : ' Not passed yet; failed questions are in the review queue.'}
        </div>
      ) : null}
    </section>
  )
}
