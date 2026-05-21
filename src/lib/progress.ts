import { allFlashcards, allQuizQuestions, curriculum } from '../data/curriculum'
import { competencies, competencyMap } from '../data/competencies'
import type {
  AppProgress,
  DayPlan,
  DayProgressScore,
  DailyProgress,
  MasteryRating,
  ProgressStats,
  ReviewQueueItem,
} from '../types'
import { addDaysToDateKey, getCurrentDayNumber, getLocalDateKey } from './date'
import {
  getDueCards,
  getFlashcardStats,
  getOverdueCards,
  isCardDue,
  wasCardReviewed,
} from './flashcards'
import {
  getBestQuizScore,
  getLatestFailedQuestionIds,
  getLatestQuizSession,
  isQuizPassed,
} from './quiz'

export const SCHEMA_VERSION = 2
export const STORAGE_KEY = 'c-thm-learning-system-v2'
export const LEGACY_STORAGE_KEY = 'c-thm-progress-v1'

export const getTaskId = (dayNumber: number, taskIndex: number) =>
  `day-${dayNumber}-task-${taskIndex}`

export const getActiveRecallPromptId = (dayNumber: number, promptIndex: number) =>
  `day-${dayNumber}-recall-${promptIndex}`

export const getInterleavingPromptId = (dayNumber: number) =>
  `day-${dayNumber}-interleaving`

export const createEmptyDailyProgress = (lastUpdatedAt = new Date().toISOString()): DailyProgress => ({
  completedTasks: [],
  completedExercises: [],
  activeRecallAnswers: {},
  activeRecallAnswerMeta: {},
  interleavingAnswers: {},
  interleavingAnswerMeta: {},
  exerciseReflections: {},
  quizSessions: [],
  failedQuizQuestions: [],
  selfSummary: '',
  shutdownNotes: {},
  shutdownChecks: {},
  shutdownComplete: false,
  competencySelfRatings: {},
  userResourceLinks: [],
  lastUpdatedAt,
})

export const createEmptyProgress = (lastSavedAt = new Date().toISOString()): AppProgress => ({
  schemaVersion: SCHEMA_VERSION,
  days: {},
  flashcards: {},
  competencyRatings: Object.fromEntries(competencies.map((competency) => [competency.id, 'not-yet' as MasteryRating])),
  deepWorkSessions: [],
  lastSavedAt,
})

export const getDailyProgress = (progress: AppProgress, dayNumber: number) =>
  progress.days[dayNumber] ?? createEmptyDailyProgress(progress.lastSavedAt)

export const calculateDayProgress = (day: DayPlan, progress: AppProgress): DayProgressScore => {
  const dayProgress = getDailyProgress(progress, day.dayNumber)
  const taskIds = day.tasks.map((_, index) => getTaskId(day.dayNumber, index))
  const completedTasks = taskIds.filter((taskId) => dayProgress.completedTasks.includes(taskId)).length
  const exerciseIds = day.exercises.map((exercise) => exercise.id)
  const completedExercises = exerciseIds.filter((exerciseId) =>
    dayProgress.completedExercises.includes(exerciseId),
  ).length
  const answeredRecall = day.activeRecallPrompts.filter((_, index) => {
    const promptId = getActiveRecallPromptId(day.dayNumber, index)
    return Boolean(dayProgress.activeRecallAnswers[promptId]?.trim())
  }).length
  const flashcardsNotDue = day.flashcards.filter((card) => wasCardReviewed(progress, card.id) && !isCardDue(progress, card)).length
  const summaryDone = Boolean(dayProgress.selfSummary.trim()) && dayProgress.shutdownComplete

  const tasks = day.tasks.length === 0 ? 20 : (completedTasks / day.tasks.length) * 20
  const exercises =
    day.exercises.length === 0 ? 20 : (completedExercises / day.exercises.length) * 20
  const quiz = isQuizPassed(progress, day.dayNumber) ? 20 : 0
  const flashcards =
    day.flashcards.length === 0 ? 15 : (flashcardsNotDue / day.flashcards.length) * 15
  const activeRecall =
    day.activeRecallPrompts.length === 0
      ? 10
      : (answeredRecall / day.activeRecallPrompts.length) * 10
  const summaryShutdown = summaryDone ? 15 : 0
  const total = Math.round(tasks + exercises + quiz + flashcards + activeRecall + summaryShutdown)

  return {
    tasks: Math.round(tasks),
    exercises: Math.round(exercises),
    quiz,
    flashcards: Math.round(flashcards),
    activeRecall: Math.round(activeRecall),
    summaryShutdown,
    total,
    complete:
      completedTasks >= Math.ceil(day.tasks.length * 0.8) &&
      completedExercises >= Math.max(1, Math.ceil(day.exercises.length * 0.5)) &&
      isQuizPassed(progress, day.dayNumber) &&
      flashcardsNotDue === day.flashcards.length &&
      answeredRecall === day.activeRecallPrompts.length &&
      summaryDone,
  }
}

export const getProgressStats = (progress: AppProgress): ProgressStats => {
  const dayScores = curriculum.map((day) => calculateDayProgress(day, progress))
  const flashcardStats = getFlashcardStats(allFlashcards, progress)
  const passedQuizzes = curriculum.filter((day) => isQuizPassed(progress, day.dayNumber)).length
  const totalQuizSessions = Object.values(progress.days).reduce(
    (sum, dayProgress) => sum + dayProgress.quizSessions.length,
    0,
  )
  const weakCompetencies = getWeakCompetencies(progress).length

  return {
    totalDays: curriculum.length,
    completedDays: dayScores.filter((score) => score.complete).length,
    averageWeightedProgress:
      dayScores.length === 0
        ? 0
        : Math.round(dayScores.reduce((sum, score) => sum + score.total, 0) / dayScores.length),
    totalCards: flashcardStats.totalCards,
    dueCards: flashcardStats.dueCards,
    overdueCards: flashcardStats.overdueCards,
    reviewedToday: flashcardStats.reviewedToday,
    totalQuizSessions,
    passedQuizzes,
    weakCompetencies,
  }
}

export const getWeakCompetencies = (progress: AppProgress) =>
  competencies.filter((competency) => {
    const rating = progress.competencyRatings[competency.id] ?? 'not-yet'
    return rating === 'not-yet' || rating === 'basic'
  })

export const getLatestQuizStatus = (progress: AppProgress, dayNumber: number) => {
  const latest = getLatestQuizSession(progress, dayNumber)
  const bestScore = getBestQuizScore(progress, dayNumber)

  return {
    latestScore: latest?.score ?? null,
    bestScore,
    passed: isQuizPassed(progress, dayNumber),
    latestCompletedAt: latest?.completedAt ?? null,
  }
}

export const getLastReviewedCardAt = (progress: AppProgress) => {
  const dates = Object.values(progress.flashcards)
    .map((state) => state.lastReviewedAt)
    .filter((value): value is string => Boolean(value))
    .sort()

  return dates.at(-1) ?? null
}

export const getIncompleteExercises = (progress: AppProgress, throughDay?: number) =>
  curriculum.flatMap((day) => {
    if (throughDay && day.dayNumber > throughDay) {
      return []
    }

    const dayProgress = getDailyProgress(progress, day.dayNumber)
    return day.exercises
      .filter((exercise) => !dayProgress.completedExercises.includes(exercise.id))
      .map((exercise) => ({ day, exercise }))
  })

export const buildReviewQueue = (
  progress: AppProgress,
  currentDayNumber = getCurrentDayNumber(progress.startDate) ?? 1,
): ReviewQueueItem[] => {
  const queue: ReviewQueueItem[] = []
  const dueCards = getDueCards(allFlashcards, progress)
  const overdueCards = getOverdueCards(allFlashcards, progress)

  if (overdueCards.length > 0) {
    queue.push({
      id: 'overdue-flashcards',
      type: 'overdue-flashcard',
      title: `${overdueCards.length} overdue flashcards`,
      description: 'Review these first because their nextReviewAt date is before today.',
      priority: 'high',
    })
  }

  if (dueCards.length > 0) {
    queue.push({
      id: 'due-flashcards',
      type: 'due-flashcard',
      title: `${dueCards.length} due flashcards`,
      description: 'Includes never-reviewed cards and cards due today.',
      priority: overdueCards.length > 0 ? 'medium' : 'high',
    })
  }

  curriculum.forEach((day) => {
    const latestFailedIds = getLatestFailedQuestionIds(progress, day)
    latestFailedIds.forEach((questionId) => {
      const question = allQuizQuestions.find((candidate) => candidate.id === questionId)
      if (!question) {
        return
      }

      queue.push({
        id: `failed-${questionId}`,
        type: 'failed-quiz-question',
        title: `Failed quiz question from Day ${day.dayNumber}`,
        description: question.prompt.replace(/\n```[\s\S]*?```/g, ' [code] ').slice(0, 180),
        dayNumber: day.dayNumber,
        relatedId: questionId,
        priority: 'high',
      })
    })
  })

  getWeakCompetencies(progress).forEach((competency) => {
    queue.push({
      id: `weak-${competency.id}`,
      type: 'weak-competency',
      title: `Weak competency: ${competency.title}`,
      description: competency.masteryCriteria[0] ?? competency.description,
      dayNumber: competency.relatedDays[0],
      relatedId: competency.id,
      priority: 'medium',
    })
  })

  const yesterday = currentDayNumber > 1 ? currentDayNumber - 1 : null

  if (yesterday) {
    const yesterdayDay = curriculum.find((day) => day.dayNumber === yesterday)
    const yesterdayProgress = getDailyProgress(progress, yesterday)

    if (yesterdayDay) {
      yesterdayDay.activeRecallPrompts.forEach((prompt, index) => {
        const promptId = getActiveRecallPromptId(yesterday, index)
        const answer = yesterdayProgress.activeRecallAnswers[promptId]

        if (answer?.trim()) {
          queue.push({
            id: `recall-review-${promptId}`,
            type: 'active-recall-review',
            title: `Review yesterday's active recall: ${prompt.slice(0, 60)}`,
            description: answer.slice(0, 180),
            dayNumber: yesterday,
            relatedId: promptId,
            priority: 'low',
          })
        }
      })

      const interleavingId = getInterleavingPromptId(yesterday)
      const interleavingAnswer = yesterdayProgress.interleavingAnswers[interleavingId]

      queue.push({
        id: `interleaving-review-${interleavingId}`,
        type: 'interleaving-review',
        title: `Interleaving challenge from Day ${yesterday}`,
        description:
          interleavingAnswer?.trim() ||
          yesterdayDay.interleavingPrompt,
        dayNumber: yesterday,
        relatedId: interleavingId,
        priority: interleavingAnswer?.trim() ? 'low' : 'medium',
      })
    }

    const confusion =
      yesterdayProgress.shutdownNotes['What confused me'] ||
      yesterdayProgress.shutdownNotes['Problems I hit'] ||
      yesterdayProgress.shutdownNotes.problems

    if (confusion?.trim()) {
      queue.push({
        id: `confusion-${yesterday}`,
        type: 'confusion-note',
        title: `Yesterday's confusion note`,
        description: confusion.slice(0, 220),
        dayNumber: yesterday,
        priority: 'medium',
      })
    }
  }

  getIncompleteExercises(progress, Math.max(1, currentDayNumber - 1))
    .slice(0, 8)
    .forEach(({ day, exercise }) => {
      queue.push({
        id: `incomplete-${exercise.id}`,
        type: 'incomplete-exercise',
        title: `Incomplete exercise: ${exercise.title}`,
        description: `Day ${day.dayNumber}: ${exercise.successCriteria[0]}`,
        dayNumber: day.dayNumber,
        relatedId: exercise.id,
        priority: 'medium',
      })
    })

  return queue.slice(0, 40)
}

export const dayMatchesQuery = (day: DayPlan, query: string) => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  const dayCompetencies = day.competencies
    .map((id) => competencyMap.get(id))
    .filter(Boolean)
    .map((competency) => `${competency?.title} ${competency?.description}`)

  const searchableText = [
    day.title,
    day.cTopic,
    day.thmTopic,
    day.objective,
    day.expectedOutput,
    day.conceptBrief,
    day.interleavingPrompt,
    ...day.tasks,
    ...day.activeRecallPrompts,
    ...dayCompetencies,
    ...day.flashcards.flatMap((card) => [card.front, card.back, ...card.tags]),
    ...day.quiz.map((question) => `${question.prompt} ${question.explanation}`),
    ...day.resources.map((resource) => `${resource.title} ${resource.url} ${resource.notes ?? ''}`),
  ]
    .join(' ')
    .toLowerCase()

  return searchableText.includes(normalizedQuery)
}

export const getShiftedStartDate = (startDate?: string) =>
  startDate ? addDaysToDateKey(startDate, 1) : getLocalDateKey()
