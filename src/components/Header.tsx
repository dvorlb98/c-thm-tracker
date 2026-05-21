import { BookOpen, Code2, ShieldCheck } from 'lucide-react'
import { formatDateTime } from '../utils/progress'

interface HeaderProps {
  lastSavedAt: string | null
  lastCompletedTaskAt: string | null
}

export function Header({ lastSavedAt, lastCompletedTaskAt }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950/85">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                <Code2 className="h-4 w-4" aria-hidden="true" />
                C study tracker
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                TryHackMe roadmap
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              30-day C + THM progress dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Flexible 10-hour study blocks, daily checklists, notes, backup JSON,
              and local progress persistence.
            </p>
          </div>

          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 sm:min-w-80">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-slate-400">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Last saved
              </span>
              <span className="text-right text-slate-100">{formatDateTime(lastSavedAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Last completed task</span>
              <span className="text-right text-slate-100">
                {formatDateTime(lastCompletedTaskAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
