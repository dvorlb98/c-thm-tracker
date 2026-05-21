import { useRef, useState, type ChangeEvent } from 'react'
import { Download, FileWarning, Trash2, Upload } from 'lucide-react'
import type { AppProgress } from '../types'
import { getLocalDateKey } from '../lib/date'
import { SCHEMA_VERSION } from '../lib/progress'
import { getProgressStorageSize, isAppProgress } from '../lib/storage'

interface BackupPanelProps {
  progress: AppProgress
  rawCorruptedData: string | null
  onImport: (progress: AppProgress) => void
  onResetAll: () => void
}

export function BackupPanel({ progress, rawCorruptedData, onImport, onResetAll }: BackupPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const progressSize = getProgressStorageSize()

  const downloadJson = (filename: string, value: unknown) => {
    const blob = new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    downloadJson(`c-thm-learning-system-v2-${getLocalDateKey()}.json`, progress)
    setError(null)
    setMessage('Progress exported as JSON.')
  }

  const handleExportCorrupted = () => {
    if (!rawCorruptedData) {
      return
    }

    downloadJson(`c-thm-corrupted-raw-${getLocalDateKey()}.json`, rawCorruptedData)
    setError(null)
    setMessage('Raw corrupted storage exported.')
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

      if (!isAppProgress(parsedValue)) {
        throw new Error('The selected JSON does not match the expected v2 progress shape.')
      }

      const confirmed = window.confirm(
        'Replace current browser-local progress with this backup? Current data will remain unchanged if import fails.',
      )

      if (!confirmed) {
        return
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

  const resetWithConfirmation = () => {
    const phrase = window.prompt('Type RESET to permanently clear local progress in this browser.')

    if (phrase !== 'RESET') {
      return
    }

    onResetAll()
    setError(null)
    setMessage('Progress reset.')
  }

  return (
    <section aria-labelledby="backup-title" className="rounded-lg border border-white/10 bg-slate-900/80 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2 id="backup-title" className="text-xl font-semibold text-white">
            Backup
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Your progress is saved locally in this browser. Export a JSON backup regularly if you want to preserve progress or move to another device.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-1">
              Schema version {SCHEMA_VERSION}
            </span>
            <span className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-1">
              Local progress size {progressSize} bytes
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import backup
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
            onClick={resetWithConfirmation}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Reset all progress
          </button>
        </div>
      </div>

      {rawCorruptedData ? (
        <div className="mt-4 rounded-md border border-amber-300/30 bg-amber-300/10 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3 text-amber-100">
              <FileWarning className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-6">
                A corrupted localStorage value was preserved. Export the raw value before resetting if you want to inspect it later.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCorrupted}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-300/20 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export raw data
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-emerald-200">{message}</p> : null}
      {error ? (
        <p className="mt-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
