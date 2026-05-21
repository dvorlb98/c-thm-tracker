import type {
  DailyNotes,
  DayPlan,
  ProgressState,
  ProgressStats,
  TaskProgress,
} from '../types'

export const STORAGE_KEY = 'c-thm-progress-v1'

export const createEmptyProgress = (): ProgressState => ({
  version: 1,
  tasks: {},
  notes: {},
  startDate: null,
  lastSavedAt: null,
  lastCompletedTaskAt: null,
})

export const createEmptyNotes = (): DailyNotes => ({
  notes: '',
  todayLearned: '',
  problems: '',
  tomorrowStart: '',
  updatedAt: null,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNullableString = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null

const isTaskProgress = (value: unknown, key: string): value is TaskProgress => {
  if (!isRecord(value)) {
    return false
  }

  const dayNumber = value.dayNumber

  return (
    typeof value.completed === 'boolean' &&
    isNullableString(value.completedAt) &&
    typeof dayNumber === 'number' &&
    Number.isInteger(dayNumber) &&
    dayNumber >= 1 &&
    dayNumber <= 30 &&
    typeof value.taskId === 'string' &&
    value.taskId === key
  )
}

const isDailyNotes = (value: unknown): value is DailyNotes => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.notes === 'string' &&
    typeof value.todayLearned === 'string' &&
    typeof value.problems === 'string' &&
    typeof value.tomorrowStart === 'string' &&
    isNullableString(value.updatedAt)
  )
}

export const isProgressState = (value: unknown): value is ProgressState => {
  if (!isRecord(value) || value.version !== 1) {
    return false
  }

  if (
    !isRecord(value.tasks) ||
    !isRecord(value.notes) ||
    !isNullableString(value.startDate) ||
    !isNullableString(value.lastSavedAt) ||
    !isNullableString(value.lastCompletedTaskAt)
  ) {
    return false
  }

  const validTasks = Object.entries(value.tasks).every(([key, task]) =>
    isTaskProgress(task, key),
  )

  const validNotes = Object.entries(value.notes).every(([key, notes]) => {
    const dayNumber = Number(key)
    return Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 30 && isDailyNotes(notes)
  })

  return validTasks && validNotes
}

export const getTaskProgress = (
  progress: ProgressState,
  dayNumber: number,
  taskId: string,
): TaskProgress => {
  return (
    progress.tasks[taskId] ?? {
      completed: false,
      completedAt: null,
      dayNumber,
      taskId,
    }
  )
}

export const getDayNotes = (
  progress: ProgressState,
  dayNumber: number,
): DailyNotes => progress.notes[String(dayNumber)] ?? createEmptyNotes()

export const getDayProgress = (day: DayPlan, progress: ProgressState) => {
  const completedTasks = day.tasks.filter(
    (task) => getTaskProgress(progress, day.dayNumber, task.id).completed,
  ).length

  return {
    completedTasks,
    totalTasks: day.tasks.length,
    percent:
      day.tasks.length === 0 ? 0 : Math.round((completedTasks / day.tasks.length) * 100),
  }
}

export const isDayComplete = (day: DayPlan, progress: ProgressState) => {
  const dayProgress = getDayProgress(day, progress)
  return dayProgress.totalTasks > 0 && dayProgress.completedTasks === dayProgress.totalTasks
}

export const getProgressStats = (
  days: DayPlan[],
  progress: ProgressState,
): ProgressStats => {
  const totalTasks = days.reduce((sum, day) => sum + day.tasks.length, 0)
  const validTaskIds = new Set(days.flatMap((day) => day.tasks.map((task) => task.id)))
  const completedTasks = Object.values(progress.tasks).filter(
    (task) => task.completed && validTaskIds.has(task.taskId),
  ).length
  const completedDays = days.filter((day) => isDayComplete(day, progress)).length

  return {
    totalTasks,
    completedTasks,
    totalPercent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    completedDays,
  }
}

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

const dateKeyToUtc = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export const getCurrentDayNumber = (startDate: string | null) => {
  if (!startDate) {
    return null
  }

  const today = getLocalDateKey()
  const diffMs = dateKeyToUtc(today) - dateKeyToUtc(startDate)
  return Math.floor(diffMs / 86_400_000) + 1
}

export const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const dayMatchesQuery = (day: DayPlan, query: string) => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  const searchableText = [
    day.cTopic,
    day.thmTopic,
    day.output,
    day.weekTitle,
    ...day.tasks.map((task) => task.text),
  ]
    .join(' ')
    .toLowerCase()

  return searchableText.includes(normalizedQuery)
}
