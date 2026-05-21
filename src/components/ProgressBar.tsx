interface ProgressBarProps {
  value: number
  label: string
  tone?: 'emerald' | 'cyan' | 'violet'
}

const toneClasses = {
  emerald: 'from-emerald-400 to-cyan-300',
  cyan: 'from-cyan-400 to-sky-300',
  violet: 'from-violet-400 to-fuchsia-300',
}

export function ProgressBar({ value, label, tone = 'emerald' }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-normal text-slate-400">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneClasses[tone]} transition-all duration-300`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}
