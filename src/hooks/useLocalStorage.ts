import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

interface LocalStorageResult<T> {
  value: T
  error: string | null
}

interface LocalStorageMeta {
  loadError: string | null
  clearLoadError: () => void
}

type Validator<T> = (value: unknown) => value is T

const preserveCorruptedValue = (key: string, rawValue: string) => {
  const backupKey = `${key}-corrupted-${new Date().toISOString()}`
  localStorage.setItem(backupKey, rawValue)
  localStorage.removeItem(key)
}

const readInitialValue = <T,>(
  key: string,
  initialValue: T,
  validate?: Validator<T>,
): LocalStorageResult<T> => {
  if (typeof window === 'undefined') {
    return { value: initialValue, error: null }
  }

  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return { value: initialValue, error: null }
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (validate && !validate(parsedValue)) {
      preserveCorruptedValue(key, rawValue)
      return {
        value: initialValue,
        error:
          'Stored progress had an unexpected shape and was moved to a corrupted backup key.',
      }
    }

    return { value: parsedValue as T, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    try {
      const rawValue = window.localStorage.getItem(key)

      if (rawValue) {
        preserveCorruptedValue(key, rawValue)
      }
    } catch {
      // Ignore backup failures. The app should still be usable with a fresh state.
    }

    return {
      value: initialValue,
      error: `Stored progress could not be read: ${message}`,
    }
  }
}

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
  validate?: Validator<T>,
): [T, Dispatch<SetStateAction<T>>, LocalStorageMeta] => {
  const [initialRead] = useState(() => readInitialValue(key, initialValue, validate))
  const [storedValue, setStoredValueState] = useState<T>(initialRead.value)
  const [loadError, setLoadError] = useState<string | null>(initialRead.error)

  const setStoredValue: Dispatch<SetStateAction<T>> = useCallback(
    (valueOrUpdater) => {
      setStoredValueState((currentValue) => {
        const nextValue =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (value: T) => T)(currentValue)
            : valueOrUpdater

        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue))
          setLoadError(null)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          setLoadError(`Progress could not be saved: ${message}`)
        }

        return nextValue
      })
    },
    [key],
  )

  return [
    storedValue,
    setStoredValue,
    {
      loadError,
      clearLoadError: () => setLoadError(null),
    },
  ]
}
