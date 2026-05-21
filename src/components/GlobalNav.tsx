import {
  Archive,
  BarChart3,
  BookOpen,
  Boxes,
  BrainCircuit,
  CalendarDays,
  FileText,
} from 'lucide-react'

export type AppView =
  | 'today'
  | 'plan'
  | 'review'
  | 'quiz-results'
  | 'competencies'
  | 'resources'
  | 'backup'

interface GlobalNavProps {
  activeView: AppView
  onChange: (view: AppView) => void
}

const navItems = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'plan', label: 'Plan', icon: BookOpen },
  { id: 'review', label: 'Review Cards', icon: BrainCircuit },
  { id: 'quiz-results', label: 'Quiz Results', icon: BarChart3 },
  { id: 'competencies', label: 'Competencies', icon: Boxes },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'backup', label: 'Backup', icon: Archive },
] satisfies { id: AppView; label: string; icon: typeof CalendarDays }[]

export function GlobalNav({ activeView, onChange }: GlobalNavProps) {
  return (
    <nav aria-label="Main sections" className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
                active
                  ? 'bg-cyan-300 text-slate-950'
                  : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
