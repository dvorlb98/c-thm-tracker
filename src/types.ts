export type CompetencyCategory =
  | 'c-fundamentals'
  | 'control-flow'
  | 'functions'
  | 'arrays-strings'
  | 'pointers-memory'
  | 'structs-data-modeling'
  | 'files-errors'
  | 'low-level'
  | 'tooling'
  | 'web-thm'
  | 'security'
  | 'learning-process'
  | 'systems-design'

export type MasteryRating = 'not-yet' | 'basic' | 'good' | 'strong'

export interface Competency {
  id: string
  title: string
  description: string
  category: CompetencyCategory
  masteryCriteria: string[]
  evidence: string[]
  relatedDays: number[]
}

export type FlashcardDifficulty = 'easy' | 'medium' | 'hard'

export type FlashcardSourceType =
  | 'concept'
  | 'syntax'
  | 'command'
  | 'debugging'
  | 'security'
  | 'web'
  | 'tooling'
  | 'systems'

export interface Flashcard {
  id: string
  dayNumber: number
  front: string
  back: string
  tags: string[]
  difficulty: FlashcardDifficulty
  sourceType: FlashcardSourceType
  relatedCompetencyIds: string[]
}

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

export interface FlashcardReviewEvent {
  reviewedAt: string
  rating: FlashcardRating
  previousInterval: number
  newInterval: number
}

export interface FlashcardReviewState {
  cardId: string
  dueDate: string
  interval: number
  repetitions: number
  easeFactor: number
  lastReviewedAt?: string
  nextReviewAt?: string
  lastRating?: FlashcardRating
  reviewHistory: FlashcardReviewEvent[]
}

export type QuizQuestionType =
  | 'multiple-choice'
  | 'short-answer'
  | 'code-prediction'
  | 'debugging'
  | 'concept-explanation'
  | 'command-meaning'
  | 'what-goes-wrong'

export interface QuizQuestion {
  id: string
  dayNumber: number
  type: QuizQuestionType
  prompt: string
  choices?: string[]
  correctAnswer: string
  acceptableAnswers?: string[]
  explanation: string
  relatedCompetencyIds: string[]
  difficulty: FlashcardDifficulty
}

export interface QuizAttempt {
  questionId: string
  answer: string
  isCorrect: boolean
  attemptedAt: string
}

export interface QuizSession {
  dayNumber: number
  startedAt: string
  completedAt: string
  score: number
  passed: boolean
  attempts: QuizAttempt[]
}

export interface Exercise {
  id: string
  dayNumber: number
  title: string
  instructions: string
  expectedSkills: string[]
  starterCode?: string
  successCriteria: string[]
  stretchGoal?: string
  relatedCompetencyIds: string[]
}

export type ResourceLinkType = 'official' | 'docs' | 'writeup' | 'reference' | 'user-added'

export interface ResourceLink {
  id: string
  title: string
  url: string
  type: ResourceLinkType
  notes?: string
}

export interface ResourceBrief {
  officialTryHackMeLink: string
  publicReferenceLink: string
  personalNotesPrompt: string
  relatedConcepts: string[]
  commandsTools: string[]
  understandAfter: string[]
  reviewConcepts: string[]
  quizConcepts: string[]
  cConnection: string
}

export interface DayPlan {
  dayNumber: number
  weekNumber: number
  title: string
  cTopic: string
  thmTopic: string
  objective: string
  expectedOutput: string
  competencies: string[]
  conceptBrief: string
  activeRecallPrompts: string[]
  interleavingPrompt: string
  tasks: string[]
  exercises: Exercise[]
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  summaryPrompt: string
  shutdownPrompts: string[]
  resources: ResourceLink[]
  resourceBrief: ResourceBrief
  contentStatus: 'complete' | 'needs-expansion'
  capstone?: boolean
}

export interface PromptAnswer {
  promptId: string
  answer: string
  answeredAt: string
  dayNumber: number
  lastUpdatedAt: string
}

export interface CapstoneProgress {
  projectChoice: string
  designDocument: string
  fileStructure: string
  cliArguments: string
  testChecklist: Record<string, boolean>
  readmeChecklist: Record<string, boolean>
  retrospective: string
  lastUpdatedAt?: string
}

export interface DailyProgress {
  completedTasks: string[]
  completedExercises: string[]
  activeRecallAnswers: Record<string, string>
  activeRecallAnswerMeta: Record<string, PromptAnswer>
  interleavingAnswers: Record<string, string>
  interleavingAnswerMeta: Record<string, PromptAnswer>
  exerciseReflections: Record<string, string>
  quizSessions: QuizSession[]
  failedQuizQuestions: string[]
  selfSummary: string
  shutdownNotes: Record<string, string>
  shutdownChecks: Record<string, boolean>
  shutdownComplete: boolean
  competencySelfRatings: Record<string, MasteryRating>
  userResourceLinks: ResourceLink[]
  capstone?: CapstoneProgress
  completedAt?: string
  lastUpdatedAt: string
}

export interface DeepWorkSession {
  id: string
  dayNumber: number
  blockLabel: string
  task?: string
  intention: string
  startedAt: string
  endedAt?: string
  completed?: boolean
  reflection?: string
  distractions?: string
  nextAction?: string
}

export interface AppProgress {
  schemaVersion: number
  startDate?: string
  days: Record<number, DailyProgress>
  flashcards: Record<string, FlashcardReviewState>
  competencyRatings: Record<string, MasteryRating>
  deepWorkSessions: DeepWorkSession[]
  lastSavedAt: string
}

export type ReviewQueueItemType =
  | 'due-flashcard'
  | 'overdue-flashcard'
  | 'failed-quiz-question'
  | 'weak-competency'
  | 'active-recall-review'
  | 'interleaving-review'
  | 'incomplete-exercise'
  | 'confusion-note'

export interface ReviewQueueItem {
  id: string
  type: ReviewQueueItemType
  title: string
  description: string
  dayNumber?: number
  relatedId?: string
  priority: 'low' | 'medium' | 'high'
}

export interface ProgressStats {
  totalDays: number
  completedDays: number
  averageWeightedProgress: number
  totalCards: number
  dueCards: number
  overdueCards: number
  reviewedToday: number
  totalQuizSessions: number
  passedQuizzes: number
  weakCompetencies: number
}

export interface DayProgressScore {
  tasks: number
  exercises: number
  quiz: number
  flashcards: number
  activeRecall: number
  summaryShutdown: number
  total: number
  complete: boolean
}

export interface StorageReadResult {
  progress: AppProgress
  message: string | null
  rawCorruptedData: string | null
  migratedFromLegacy: boolean
}

export type UpdateProgress = (updater: (current: AppProgress, savedAt: string) => AppProgress) => void

export interface LegacyTaskProgress {
  completed: boolean
  completedAt: string | null
  dayNumber: number
  taskId: string
}

export interface LegacyDailyNotes {
  notes: string
  todayLearned: string
  problems: string
  tomorrowStart: string
  updatedAt: string | null
}

export interface LegacyProgressState {
  version: 1
  tasks: Record<string, LegacyTaskProgress>
  notes: Record<string, LegacyDailyNotes>
  startDate: string | null
  lastSavedAt: string | null
  lastCompletedTaskAt: string | null
}
