import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <section aria-label="Search plan" className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
      <label htmlFor="plan-search" className="mb-3 block text-sm font-medium text-slate-300">
        Search by topic
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id="plan-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="pointers, HTTP, structs, Linux, files"
          className="w-full rounded-md border border-white/10 bg-slate-950 px-10 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </section>
  )
}
