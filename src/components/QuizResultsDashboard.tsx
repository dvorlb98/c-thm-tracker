import { BarChart3, CircleAlert } from 'lucide-react'
import { curriculum } from '../data/curriculum'
import type { AppProgress } from '../types'
import { formatDateTime } from '../lib/date'
import { getBestQuizScore, getLatestQuizSession } from '../lib/quiz'
import { getDailyProgress } from '../lib/progress'

interface QuizResultsDashboardProps {
  progress: AppProgress
}

export function QuizResultsDashboard({ progress }: QuizResultsDashboardProps) {
  const failedQuestions = curriculum.flatMap((day) => {
    const dayProgress = getDailyProgress(progress, day.dayNumber)
    return dayProgress.failedQuizQuestions.flatMap((questionId) => {
      const question = day.quiz.find((candidate) => candidate.id === questionId)
      return question ? [{ day, question }] : []
    })
  })

  return (
    <section aria-labelledby="quiz-results-title" className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
        <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Quiz Results
        </div>
        <h2 id="quiz-results-title" className="text-xl font-semibold text-white">
          Testing effect dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Latest score, best score, pass status, and failed questions are saved locally.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Latest</th>
                <th className="px-4 py-3">Best</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {curriculum.map((day) => {
                const latest = getLatestQuizSession(progress, day.dayNumber)
                const best = getBestQuizScore(progress, day.dayNumber)
                const sessions = getDailyProgress(progress, day.dayNumber).quizSessions
                const passed = sessions.some((session) => session.passed)

                return (
                  <tr key={day.dayNumber} className="text-slate-300">
                    <td className="px-4 py-3 font-semibold text-white">Day {day.dayNumber}</td>
                    <td className="px-4 py-3">{day.title}</td>
                    <td className="px-4 py-3">
                      {latest ? `${latest.score}% (${formatDateTime(latest.completedAt)})` : 'Not taken'}
                    </td>
                    <td className="px-4 py-3">{best}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        passed ? 'bg-emerald-300/10 text-emerald-100' : 'bg-amber-300/10 text-amber-100'
                      }`}
                      >
                        {passed ? 'Passed' : 'Not passed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sessions.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <section aria-labelledby="failed-questions-title" className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
        <div className="flex items-center gap-2">
          <CircleAlert className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <h3 id="failed-questions-title" className="text-lg font-semibold text-white">
            Failed questions needing review
          </h3>
        </div>
        {failedQuestions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No failed questions saved yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {failedQuestions.map(({ day, question }) => (
              <article key={question.id} className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3">
                <p className="text-xs font-semibold text-amber-200">Day {day.dayNumber}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-100">{question.prompt}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{question.explanation}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
