import {
  BookOpenText,
  Brain,
  ClipboardList,
  Dumbbell,
  FileText,
  Layers,
  MessageSquareText,
  NotebookText,
  Trophy,
} from 'lucide-react'

export type DayTab =
  | 'overview'
  | 'competencies'
  | 'active-recall'
  | 'concept'
  | 'exercises'
  | 'flashcards'
  | 'quiz'
  | 'notes'
  | 'resources'

interface DayTabsProps {
  activeTab: DayTab
  onChange: (tab: DayTab) => void
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'competencies', label: 'Competencies', icon: Trophy },
  { id: 'active-recall', label: 'Active Recall', icon: Brain },
  { id: 'concept', label: 'Concept Brief', icon: BookOpenText },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: MessageSquareText },
  { id: 'notes', label: 'Notes / Shutdown', icon: NotebookText },
  { id: 'resources', label: 'Resources', icon: FileText },
] satisfies { id: DayTab; label: string; icon: typeof ClipboardList }[]

export function DayTabs({ activeTab, onChange }: DayTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-3" role="tablist" aria-label="Day sections">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
              active
                ? 'bg-white text-slate-950'
                : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
