import type { AppProgress, Flashcard, FlashcardRating, FlashcardReviewState } from '../types'
import { dateKeyToUtc, getLocalDateKey, isDateKeyTodayOrEarlier } from './date'

export const createDefaultCardState = (
  cardId: string,
  dueDate = getLocalDateKey(),
): FlashcardReviewState => ({
  cardId,
  dueDate,
  interval: 0,
  repetitions: 0,
  easeFactor: 2.5,
  nextReviewAt: dueDate,
  reviewHistory: [],
})

export const getCardState = (progress: AppProgress, cardId: string) =>
  progress.flashcards[cardId] ?? createDefaultCardState(cardId)

export const isCardDue = (progress: AppProgress, card: Flashcard) => {
  const state = getCardState(progress, card.id)
  return !state.lastReviewedAt || isDateKeyTodayOrEarlier(state.nextReviewAt ?? state.dueDate)
}

export const isCardOverdue = (progress: AppProgress, card: Flashcard) => {
  const state = getCardState(progress, card.id)
  const due = state.nextReviewAt ?? state.dueDate

  return dateKeyToUtc(due) < dateKeyToUtc(getLocalDateKey())
}

export const getDueCards = (cards: Flashcard[], progress: AppProgress) =>
  cards.filter((card) => isCardDue(progress, card))

export const getOverdueCards = (cards: Flashcard[], progress: AppProgress) =>
  cards.filter((card) => isCardOverdue(progress, card))

export const getReviewedTodayCount = (progress: AppProgress) => {
  const today = getLocalDateKey()

  return Object.values(progress.flashcards).filter((state) => {
    if (!state.lastReviewedAt) {
      return false
    }

    return state.lastReviewedAt.slice(0, 10) === today
  }).length
}

export const scheduleFlashcard = (
  currentState: FlashcardReviewState,
  rating: FlashcardRating,
  reviewedAt = new Date().toISOString(),
): FlashcardReviewState => {
  const previousInterval = currentState.interval
  const previousEase = currentState.easeFactor || 2.5

  let interval = Math.max(0, currentState.interval)
  let repetitions = currentState.repetitions
  let easeFactor = previousEase

  if (rating === 'again') {
    interval = 1
    repetitions = Math.max(0, repetitions - 1)
    easeFactor = Math.max(1.3, previousEase - 0.2)
  }

  if (rating === 'hard') {
    interval = Math.max(1, Math.ceil(Math.max(1, interval) * 1.2))
    repetitions += 1
    easeFactor = Math.max(1.3, previousEase - 0.15)
  }

  if (rating === 'good') {
    repetitions += 1
    interval =
      repetitions === 1
        ? 1
        : repetitions === 2
          ? 3
          : Math.max(4, Math.ceil(Math.max(1, interval) * easeFactor))
  }

  if (rating === 'easy') {
    repetitions += 1
    easeFactor = Math.min(3.2, previousEase + 0.15)
    interval =
      repetitions === 1
        ? 4
        : Math.max(5, Math.ceil(Math.max(1, interval) * (easeFactor + 0.3)))
  }

  const due = new Date(reviewedAt)
  due.setDate(due.getDate() + interval)
  const dueDate = getLocalDateKey(due)

  return {
    ...currentState,
    dueDate,
    interval,
    repetitions,
    easeFactor,
    lastReviewedAt: reviewedAt,
    nextReviewAt: dueDate,
    lastRating: rating,
    reviewHistory: [
      ...currentState.reviewHistory,
      {
        reviewedAt,
        rating,
        previousInterval,
        newInterval: interval,
      },
    ],
  }
}

export const getFlashcardStats = (cards: Flashcard[], progress: AppProgress) => {
  const dueCards = getDueCards(cards, progress)
  const overdueCards = getOverdueCards(cards, progress)
  const reviewedToday = getReviewedTodayCount(progress)
  const matureCards = cards.filter((card) => getCardState(progress, card.id).interval >= 21)
  const weakCards = cards.filter((card) => {
    const state = getCardState(progress, card.id)
    return state.lastRating === 'again' || state.easeFactor < 2 || (state.reviewHistory.length > 0 && state.interval <= 1)
  })

  return {
    totalCards: cards.length,
    dueCards: dueCards.length,
    overdueCards: overdueCards.length,
    reviewedToday,
    matureCards: matureCards.length,
    weakCards: weakCards.length,
  }
}

export const wasCardReviewed = (progress: AppProgress, cardId: string) =>
  Boolean(progress.flashcards[cardId]?.lastReviewedAt)
