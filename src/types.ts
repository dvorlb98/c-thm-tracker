export interface Task {
  id: string
  text: string
}

export interface DayPlan {
  dayNumber: number
  weekNumber: number
  weekTitle: string
  cTopic: string
  thmTopic: string
  output: string
  tasks: Task[]
}

export interface TaskProgress {
  completed: boolean
  completedAt: string | null
  dayNumber: number
  taskId: string
}

export interface DailyNotes {
  notes: string
  todayLearned: string
  problems: string
  tomorrowStart: string
  updatedAt: string | null
}

export interface ProgressState {
  version: 1
  tasks: Record<string, TaskProgress>
  notes: Record<string, DailyNotes>
  startDate: string | null
  lastSavedAt: string | null
  lastCompletedTaskAt: string | null
}

export interface ProgressStats {
  totalTasks: number
  completedTasks: number
  totalPercent: number
  completedDays: number
}
