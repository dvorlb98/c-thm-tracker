interface WeekFilterProps {
  selectedWeek: number | 'all'
  weekTitles: string[]
  onChange: (week: number | 'all') => void
}

export function WeekFilter({ selectedWeek, weekTitles, onChange }: WeekFilterProps) {
  return (
    <section aria-label="Filter by week" className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
      <div className="mb-3 text-sm font-medium text-slate-300">Week filter</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={selectedWeek === 'all'}
          onClick={() => onChange('all')}
          className={`rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
            selectedWeek === 'all'
              ? 'bg-white text-slate-950'
              : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10'
          }`}
        >
          All weeks
        </button>
        {weekTitles.map((title, index) => {
          const weekNumber = index + 1

          return (
            <button
              key={title}
              type="button"
              aria-pressed={selectedWeek === weekNumber}
              onClick={() => onChange(weekNumber)}
              className={`rounded-md px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-200 ${
                selectedWeek === weekNumber
                  ? 'bg-cyan-300 text-slate-950'
                  : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10'
              }`}
              title={title}
            >
              Week {weekNumber}
            </button>
          )
        })}
      </div>
    </section>
  )
}
