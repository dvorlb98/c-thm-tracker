import { BookOpenCheck, Brain, Clock3, DatabaseZap, ShieldCheck } from 'lucide-react'
import { formatDateTime } from '../lib/date'

interface HeaderProps {
  lastSavedAt: string
  lastReviewedCardAt: string | null
  lastQuizAttemptAt: string | null
}

export function Header({ lastSavedAt, lastReviewedCardAt, lastQuizAttemptAt }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                C + TryHackMe
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                <Brain className="h-4 w-4" aria-hidden="true" />
                Make It Stick
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-violet-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Local-first
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              C + THM personal learning system
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Study book, workbook, review queue, flashcards, quizzes, notes, and competency dashboard in one browser-local app.
            </p>
          </div>

          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 sm:min-w-96">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-slate-400">
                <DatabaseZap className="h-4 w-4" aria-hidden="true" />
                Last saved
              </span>
              <span className="text-right text-slate-100">{formatDateTime(lastSavedAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-slate-400">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                Last reviewed card
              </span>
              <span className="text-right text-slate-100">{formatDateTime(lastReviewedCardAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Last quiz attempt</span>
              <span className="text-right text-slate-100">{formatDateTime(lastQuizAttemptAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
