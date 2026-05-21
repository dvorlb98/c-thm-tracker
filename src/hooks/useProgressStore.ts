import { useCallback, useState } from 'react'
import type { AppProgress } from '../types'
import { createEmptyProgress } from '../lib/progress'
import { isAppProgress, readProgressFromStorage, saveProgressToStorage } from '../lib/storage'

type ProgressUpdater = (current: AppProgress, savedAt: string) => AppProgress

export const useProgressStore = () => {
  const [initialRead] = useState(() => readProgressFromStorage())
  const [progress, setProgressState] = useState<AppProgress>(initialRead.progress)
  const [storageMessage, setStorageMessage] = useState<string | null>(initialRead.message)
  const [rawCorruptedData, setRawCorruptedData] = useState<string | null>(
    initialRead.rawCorruptedData,
  )

  const persist = useCallback((nextProgress: AppProgress) => {
    try {
      saveProgressToStorage(nextProgress)
      setStorageMessage(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown storage error'
      setStorageMessage(`Progress could not be saved: ${message}`)
    }
  }, [])

  const updateProgress = useCallback(
    (updater: ProgressUpdater) => {
      setProgressState((current) => {
        const savedAt = new Date().toISOString()
        const nextProgress = {
          ...updater(current, savedAt),
          lastSavedAt: savedAt,
        }
        persist(nextProgress)
        return nextProgress
      })
    },
    [persist],
  )

  const replaceProgress = useCallback(
    (nextProgress: AppProgress) => {
      if (!isAppProgress(nextProgress)) {
        throw new Error('The selected JSON does not match the expected v2 progress shape.')
      }

      const savedAt = new Date().toISOString()
      const next = {
        ...nextProgress,
        lastSavedAt: savedAt,
      }

      setProgressState(next)
      persist(next)
    },
    [persist],
  )

  const resetProgress = useCallback(() => {
    const next = createEmptyProgress()
    setProgressState(next)
    persist(next)
  }, [persist])

  return {
    progress,
    updateProgress,
    replaceProgress,
    resetProgress,
    storageMessage,
    rawCorruptedData,
    clearStorageMessage: () => setStorageMessage(null),
    clearRawCorruptedData: () => setRawCorruptedData(null),
    migratedFromLegacy: initialRead.migratedFromLegacy,
  }
}
