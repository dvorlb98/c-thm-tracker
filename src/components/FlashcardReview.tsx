import { useMemo, useState } from 'react'
import { Eye, Layers, RotateCcw } from 'lucide-react'
import type { AppProgress, Flashcard, FlashcardRating, UpdateProgress } from '../types'
import { getCardState, getDueCards, getOverdueCards, scheduleFlashcard } from '../lib/flashcards'
import { formatDate } from '../lib/date'

interface FlashcardReviewProps {
  cards: Flashcard[]
  progress: AppProgress
  updateProgress: UpdateProgress
  title?: string
}

const ratingLabels: { rating: FlashcardRating; label: string; className: string }[] = [
  { rating: 'again', label: 'Again', className: 'border-rose-300/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20' },
  { rating: 'hard', label: 'Hard', className: 'border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20' },
  { rating: 'good', label: 'Good', className: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20' },
  { rating: 'easy', label: 'Easy', className: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20' },
]

export function FlashcardReview({ cards, progress, updateProgress, title = 'Review cards' }: FlashcardReviewProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewAll, setReviewAll] = useState(false)
  const [cursor, setCursor] = useState(0)
  const dueCards = useMemo(() => getDueCards(cards, progress), [cards, progress])
  const overdueCards = useMemo(() => getOverdueCards(cards, progress), [cards, progress])
  const reviewCards = reviewAll ? cards : dueCards
  const card = reviewCards[cursor] ?? reviewCards[0]

  const rateCard = (rating: FlashcardRating) => {
    if (!card) {
      return
    }

    updateProgress((current) => {
      const currentState = getCardState(current, card.id)
      const nextState = scheduleFlashcard(currentState, rating)

      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          [card.id]: nextState,
        },
      }
    })
    setShowAnswer(false)
    setCursor((current) => Math.min(current, Math.max(0, reviewCards.length - 2)))
  }

  return (
    <section aria-labelledby="flashcard-review-title" className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
            <Layers className="h-4 w-4" aria-hidden="true" />
            Flashcards
          </div>
          <h4 id="flashcard-review-title" className="text-lg font-semibold text-white">
            {title}
          </h4>
          <p className="mt-1 text-sm text-slate-400">
            {dueCards.length} due, {overdueCards.length} overdue, {cards.length} total.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setReviewAll((current) => !current)
            setCursor(0)
            setShowAnswer(false)
          }}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {reviewAll ? 'Due only' : 'Review all'}
        </button>
      </div>

      {card ? (
        <article className="rounded-lg border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
              Day {card.dayNumber}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
              {card.sourceType}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
              {card.difficulty}
            </span>
          </div>
          <h5 className="text-xl font-semibold leading-8 text-white">{card.front}</h5>
          {showAnswer ? (
            <div className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-semibold text-emerald-100">Answer</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-100">{card.back}</p>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {!showAnswer ? (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Show answer
              </button>
            ) : (
              ratingLabels.map((item) => (
                <button
                  key={item.rating}
                  type="button"
                  onClick={() => rateCard(item.rating)}
                  className={`inline-flex min-h-10 items-center rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-200 ${item.className}`}
                >
                  {item.label}
                </button>
              ))
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Card {Math.min(cursor + 1, reviewCards.length)} of {reviewCards.length}. Next due:{' '}
            {formatDate(getCardState(progress, card.id).nextReviewAt ?? getCardState(progress, card.id).dueDate)}
          </p>
        </article>
      ) : (
        <div className="rounded-lg border border-white/10 bg-slate-950/60 p-6 text-center text-slate-300">
          No due cards in this set. Use Review all if you want extra retrieval practice.
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {cards.slice(0, 12).map((listedCard) => {
          const state = getCardState(progress, listedCard.id)
          return (
            <div key={listedCard.id} className="rounded-md border border-white/10 bg-slate-950/40 p-3 text-sm">
              <p className="line-clamp-2 font-medium text-slate-200">{listedCard.front}</p>
              <p className="mt-1 text-xs text-slate-500">
                Due {formatDate(state.nextReviewAt ?? state.dueDate)} | interval {state.interval}d
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
