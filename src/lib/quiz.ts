import type { AppProgress, DayPlan, QuizAttempt, QuizQuestion, QuizSession } from '../types'

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[^a-z0-9#+.\-/]+/g, ' ')
    .trim()

const includesAllWords = (answer: string, expected: string) => {
  const normalizedAnswer = normalize(answer)
  const words = normalize(expected)
    .split(' ')
    .filter((word) => word.length > 3)

  if (words.length === 0) {
    return normalizedAnswer === normalize(expected)
  }

  return words.every((word) => normalizedAnswer.includes(word))
}

export const gradeQuestionAnswer = (question: QuizQuestion, answer: string) => {
  const normalizedAnswer = normalize(answer)
  const normalizedCorrect = normalize(question.correctAnswer)

  if (!normalizedAnswer) {
    return false
  }

  if (question.type === 'multiple-choice') {
    return normalizedAnswer === normalizedCorrect
  }

  if (normalizedAnswer === normalizedCorrect || normalizedAnswer.includes(normalizedCorrect)) {
    return true
  }

  const acceptable = question.acceptableAnswers ?? []

  if (acceptable.length === 0) {
    return includesAllWords(answer, question.correctAnswer)
  }

  const matchingTerms = acceptable.filter((term) => normalizedAnswer.includes(normalize(term)))
  const needed = Math.min(2, acceptable.length)

  return matchingTerms.length >= needed
}

export const createQuizSession = (
  day: DayPlan,
  answers: Record<string, string>,
  startedAt: string,
  completedAt = new Date().toISOString(),
): QuizSession => {
  const attempts: QuizAttempt[] = day.quiz.map((question) => ({
    questionId: question.id,
    answer: answers[question.id] ?? '',
    isCorrect: gradeQuestionAnswer(question, answers[question.id] ?? ''),
    attemptedAt: completedAt,
  }))
  const correct = attempts.filter((attempt) => attempt.isCorrect).length
  const score = day.quiz.length === 0 ? 0 : Math.round((correct / day.quiz.length) * 100)

  return {
    dayNumber: day.dayNumber,
    startedAt,
    completedAt,
    score,
    passed: score >= 80,
    attempts,
  }
}

export const getLatestQuizSession = (progress: AppProgress, dayNumber: number) => {
  const sessions = progress.days[dayNumber]?.quizSessions ?? []
  return sessions.at(-1)
}

export const getBestQuizScore = (progress: AppProgress, dayNumber: number) => {
  const sessions = progress.days[dayNumber]?.quizSessions ?? []
  return sessions.reduce((best, session) => Math.max(best, session.score), 0)
}

export const isQuizPassed = (progress: AppProgress, dayNumber: number) =>
  (progress.days[dayNumber]?.quizSessions ?? []).some((session) => session.passed)

export const getLatestFailedQuestionIds = (progress: AppProgress, day: DayPlan) => {
  const latest = getLatestQuizSession(progress, day.dayNumber)

  if (!latest) {
    return []
  }

  if (latest.score < 80) {
    return latest.attempts
      .filter((attempt) => !attempt.isCorrect)
      .map((attempt) => attempt.questionId)
  }

  return latest.attempts
    .filter((attempt) => !attempt.isCorrect)
    .map((attempt) => attempt.questionId)
}

export const getLastQuizAttemptAt = (progress: AppProgress) => {
  const completedDates = Object.values(progress.days).flatMap((day) =>
    day.quizSessions.map((session) => session.completedAt),
  )

  return completedDates.sort().at(-1) ?? null
}
