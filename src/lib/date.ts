export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const dateKeyToUtc = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export const getCalendarDayDifference = (fromDateKey: string, toDateKey = getLocalDateKey()) =>
  Math.floor((dateKeyToUtc(toDateKey) - dateKeyToUtc(fromDateKey)) / 86_400_000)

export const getCurrentDayNumber = (startDate?: string) => {
  if (!startDate) {
    return null
  }

  return getCalendarDayDifference(startDate) + 1
}

export const addDaysToDateKey = (dateKey: string, days: number) => {
  const next = new Date(dateKeyToUtc(dateKey))
  next.setUTCDate(next.getUTCDate() + days)

  const year = next.getUTCFullYear()
  const month = `${next.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${next.getUTCDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const isDateKeyTodayOrEarlier = (dateKey?: string) => {
  if (!dateKey) {
    return true
  }

  return dateKeyToUtc(dateKey) <= dateKeyToUtc(getLocalDateKey())
}

export const formatDateTime = (value?: string | null) => {
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

export const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Never'
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(date)
}
