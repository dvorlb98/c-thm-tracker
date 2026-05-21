import type {
  AppProgress,
  DailyProgress,
  FlashcardReviewEvent,
  FlashcardReviewState,
  LegacyDailyNotes,
  LegacyProgressState,
  LegacyTaskProgress,
  MasteryRating,
  StorageReadResult,
} from '../types'
import {
  LEGACY_STORAGE_KEY,
  SCHEMA_VERSION,
  STORAGE_KEY,
  createEmptyDailyProgress,
  createEmptyProgress,
} from './progress'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isString = (value: unknown): value is string => typeof value === 'string'
const isOptionalString = (value: unknown): value is string | undefined =>
  typeof value === 'undefined' || typeof value === 'string'

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isRating = (value: unknown): value is MasteryRating =>
  value === 'not-yet' || value === 'basic' || value === 'good' || value === 'strong'

const isFlashcardReviewEvent = (value: unknown): value is FlashcardReviewEvent => {
  if (!isRecord(value)) {
    return false
  }

  return (
    isString(value.reviewedAt) &&
    (value.rating === 'again' || value.rating === 'hard' || value.rating === 'good' || value.rating === 'easy') &&
    typeof value.previousInterval === 'number' &&
    typeof value.newInterval === 'number'
  )
}

const isFlashcardReviewState = (value: unknown): value is FlashcardReviewState => {
  if (!isRecord(value)) {
    return false
  }

  return (
    isString(value.cardId) &&
    isString(value.dueDate) &&
    typeof value.interval === 'number' &&
    typeof value.repetitions === 'number' &&
    typeof value.easeFactor === 'number' &&
    isOptionalString(value.lastReviewedAt) &&
    isOptionalString(value.nextReviewAt) &&
    (typeof value.lastRating === 'undefined' ||
      value.lastRating === 'again' ||
      value.lastRating === 'hard' ||
      value.lastRating === 'good' ||
      value.lastRating === 'easy') &&
    Array.isArray(value.reviewHistory) &&
    value.reviewHistory.every(isFlashcardReviewEvent)
  )
}

const isDailyProgress = (value: unknown): value is DailyProgress => {
  if (!isRecord(value)) {
    return false
  }

  return (
    isStringArray(value.completedTasks) &&
    isStringArray(value.completedExercises) &&
    isRecord(value.activeRecallAnswers) &&
    isRecord(value.interleavingAnswers) &&
    isRecord(value.exerciseReflections) &&
    Array.isArray(value.quizSessions) &&
    isStringArray(value.failedQuizQuestions) &&
    typeof value.selfSummary === 'string' &&
    isRecord(value.shutdownNotes) &&
    typeof value.shutdownComplete === 'boolean' &&
    isRecord(value.competencySelfRatings) &&
    Array.isArray(value.userResourceLinks) &&
    isString(value.lastUpdatedAt)
  )
}

export const isAppProgress = (value: unknown): value is AppProgress => {
  if (!isRecord(value) || value.schemaVersion !== SCHEMA_VERSION) {
    return false
  }

  if (
    (typeof value.startDate !== 'undefined' && typeof value.startDate !== 'string') ||
    !isRecord(value.days) ||
    !isRecord(value.flashcards) ||
    !isRecord(value.competencyRatings) ||
    !Array.isArray(value.deepWorkSessions) ||
    !isString(value.lastSavedAt)
  ) {
    return false
  }

  const daysValid = Object.entries(value.days).every(([dayNumber, dayProgress]) => {
    const parsedDay = Number(dayNumber)
    return Number.isInteger(parsedDay) && parsedDay >= 1 && parsedDay <= 30 && isDailyProgress(dayProgress)
  })
  const flashcardsValid = Object.entries(value.flashcards).every(
    ([cardId, state]) => isFlashcardReviewState(state) && state.cardId === cardId,
  )
  const ratingsValid = Object.values(value.competencyRatings).every(isRating)

  return daysValid && flashcardsValid && ratingsValid
}

const isLegacyTaskProgress = (value: unknown): value is LegacyTaskProgress => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.completed === 'boolean' &&
    (typeof value.completedAt === 'string' || value.completedAt === null) &&
    typeof value.dayNumber === 'number' &&
    typeof value.taskId === 'string'
  )
}

const isLegacyDailyNotes = (value: unknown): value is LegacyDailyNotes => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.notes === 'string' &&
    typeof value.todayLearned === 'string' &&
    typeof value.problems === 'string' &&
    typeof value.tomorrowStart === 'string' &&
    (typeof value.updatedAt === 'string' || value.updatedAt === null)
  )
}

const isLegacyProgressState = (value: unknown): value is LegacyProgressState => {
  if (!isRecord(value) || value.version !== 1) {
    return false
  }

  return (
    isRecord(value.tasks) &&
    Object.values(value.tasks).every(isLegacyTaskProgress) &&
    isRecord(value.notes) &&
    Object.values(value.notes).every(isLegacyDailyNotes) &&
    (typeof value.startDate === 'string' || value.startDate === null) &&
    (typeof value.lastSavedAt === 'string' || value.lastSavedAt === null) &&
    (typeof value.lastCompletedTaskAt === 'string' || value.lastCompletedTaskAt === null)
  )
}

const preserveRawValue = (key: string, rawValue: string) => {
  const backupKey = `${key}-corrupted-${new Date().toISOString()}`
  window.localStorage.setItem(backupKey, rawValue)
  return backupKey
}

const migrateLegacyProgress = (legacy: LegacyProgressState): AppProgress => {
  const now = new Date().toISOString()
  const migrated = createEmptyProgress(legacy.lastSavedAt ?? now)

  migrated.startDate = legacy.startDate ?? undefined

  Object.values(legacy.tasks).forEach((task) => {
    if (!task.completed) {
      return
    }

    const dayProgress = migrated.days[task.dayNumber] ?? createEmptyDailyProgress(task.completedAt ?? now)
    migrated.days[task.dayNumber] = {
      ...dayProgress,
      completedTasks: [...new Set([...dayProgress.completedTasks, task.taskId])],
      lastUpdatedAt: task.completedAt ?? now,
    }
  })

  Object.entries(legacy.notes).forEach(([dayKey, notes]) => {
    const dayNumber = Number(dayKey)

    if (!Number.isInteger(dayNumber)) {
      return
    }

    const dayProgress = migrated.days[dayNumber] ?? createEmptyDailyProgress(notes.updatedAt ?? now)
    migrated.days[dayNumber] = {
      ...dayProgress,
      selfSummary: notes.notes,
      shutdownNotes: {
        ...dayProgress.shutdownNotes,
        'Legacy day notes': notes.notes,
        'Today I learned': notes.todayLearned,
        'Problems I hit': notes.problems,
        'Tomorrow I start with': notes.tomorrowStart,
      },
      lastUpdatedAt: notes.updatedAt ?? now,
    }
  })

  return {
    ...migrated,
    lastSavedAt: now,
  }
}

export const readProgressFromStorage = (): StorageReadResult => {
  const empty = createEmptyProgress()

  if (typeof window === 'undefined') {
    return {
      progress: empty,
      message: null,
      rawCorruptedData: null,
      migratedFromLegacy: false,
    }
  }

  const rawV2 = window.localStorage.getItem(STORAGE_KEY)

  if (rawV2) {
    try {
      const parsed: unknown = JSON.parse(rawV2)

      if (isAppProgress(parsed)) {
        return {
          progress: parsed,
          message: null,
          rawCorruptedData: null,
          migratedFromLegacy: false,
        }
      }

      const backupKey = preserveRawValue(STORAGE_KEY, rawV2)
      window.localStorage.removeItem(STORAGE_KEY)

      return {
        progress: empty,
        message: `Stored v2 progress had an unexpected shape. It was preserved under ${backupKey} and the app started with clean progress.`,
        rawCorruptedData: rawV2,
        migratedFromLegacy: false,
      }
    } catch (error) {
      const backupKey = preserveRawValue(STORAGE_KEY, rawV2)
      window.localStorage.removeItem(STORAGE_KEY)
      const message = error instanceof Error ? error.message : 'Unknown JSON error'

      return {
        progress: empty,
        message: `Stored v2 progress could not be parsed (${message}). It was preserved under ${backupKey}.`,
        rawCorruptedData: rawV2,
        migratedFromLegacy: false,
      }
    }
  }

  const rawLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)

  if (!rawLegacy) {
    return {
      progress: empty,
      message: null,
      rawCorruptedData: null,
      migratedFromLegacy: false,
    }
  }

  try {
    const parsedLegacy: unknown = JSON.parse(rawLegacy)

    if (!isLegacyProgressState(parsedLegacy)) {
      const backupKey = preserveRawValue(LEGACY_STORAGE_KEY, rawLegacy)
      return {
        progress: empty,
        message: `Old v1 progress exists but could not be migrated. It was preserved under ${backupKey}; the original key was not deleted.`,
        rawCorruptedData: rawLegacy,
        migratedFromLegacy: false,
      }
    }

    const migrated = migrateLegacyProgress(parsedLegacy)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))

    return {
      progress: migrated,
      message: 'Migrated existing c-thm-progress-v1 task checks, notes, and start date into the v2 local learning-system schema. The old key was left untouched.',
      rawCorruptedData: null,
      migratedFromLegacy: true,
    }
  } catch (error) {
    const backupKey = preserveRawValue(LEGACY_STORAGE_KEY, rawLegacy)
    const message = error instanceof Error ? error.message : 'Unknown JSON error'

    return {
      progress: empty,
      message: `Old v1 progress could not be parsed (${message}). It was preserved under ${backupKey}; the original key was not deleted.`,
      rawCorruptedData: rawLegacy,
      migratedFromLegacy: false,
    }
  }
}

export const saveProgressToStorage = (progress: AppProgress) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export const getProgressStorageSize = () => {
  if (typeof window === 'undefined') {
    return 0
  }

  return new Blob([window.localStorage.getItem(STORAGE_KEY) ?? '']).size
}
