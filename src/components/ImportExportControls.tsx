import { Download, Trash2, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import type { ProgressState } from '../types'
import { getLocalDateKey, isProgressState } from '../utils/progress'

interface ImportExportControlsProps {
  progress: ProgressState
  onImport: (progress: ProgressState) => void
  onResetAll: () => void
}

export function ImportExportControls({
  progress,
  onImport,
  onResetAll,
}: ImportExportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `c-thm-progress-${getLocalDateKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setError(null)
    setMessage('Progress exported as JSON.')
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsedValue: unknown = JSON.parse(text)

      if (!isProgressState(parsedValue)) {
        throw new Error('The selected JSON does not match the expected progress shape.')
      }

      onImport(parsedValue)
      setError(null)
      setMessage(`Imported ${file.name}.`)
    } catch (importError) {
      const detail = importError instanceof Error ? importError.message : 'Unknown import error.'
      setMessage(null)
      setError(detail)
    }
  }

  return (
    <section
      aria-labelledby="backup-controls-title"
      className="rounded-lg border border-white/10 bg-slate-900/80 p-5"
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 id="backup-controls-title" className="text-lg font-semibold text-white">
            Backup controls
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Export a local JSON backup or import one before replacing current progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="Export progress as JSON"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            aria-label="Import progress from JSON"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
            aria-label="Choose progress JSON file"
          />
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 focus:outline-none focus:ring-2 focus:ring-rose-200"
            aria-label="Reset all progress"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Reset all
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-200">{message}</p> : null}
      {error ? (
        <p className="mt-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
