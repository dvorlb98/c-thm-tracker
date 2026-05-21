import { Check, Hammer } from 'lucide-react'
import type { AppProgress, CapstoneProgress, DayPlan, UpdateProgress } from '../types'
import { getDailyProgress } from '../lib/progress'

interface ExercisePanelProps {
  day: DayPlan
  progress: AppProgress
  updateProgress: UpdateProgress
}

const capstoneTests = ['Normal input', 'Empty input', 'Invalid arguments', 'Missing file', 'Long or malformed line']
const readmeItems = ['Build command', 'Run command', 'Sample input', 'Expected output', 'Known limits']

const createCapstoneProgress = (): CapstoneProgress => ({
  projectChoice: '',
  designDocument: '',
  fileStructure: '',
  cliArguments: '',
  testChecklist: {},
  readmeChecklist: {},
  retrospective: '',
})

export function ExercisePanel({ day, progress, updateProgress }: ExercisePanelProps) {
  const dayProgress = getDailyProgress(progress, day.dayNumber)
  const capstone = dayProgress.capstone ?? createCapstoneProgress()

  const toggleExercise = (exerciseId: string, checked: boolean) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)
      const completedExercises = checked
        ? [...new Set([...currentDay.completedExercises, exerciseId])]
        : currentDay.completedExercises.filter((id) => id !== exerciseId)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            completedExercises,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const updateReflection = (exerciseId: string, value: string) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            exerciseReflections: {
              ...currentDay.exerciseReflections,
              [exerciseId]: value,
            },
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  const updateCapstone = (patch: Partial<CapstoneProgress>) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, day.dayNumber)
      const nextCapstone = {
        ...createCapstoneProgress(),
        ...currentDay.capstone,
        ...patch,
        lastUpdatedAt: savedAt,
      }

      return {
        ...current,
        days: {
          ...current.days,
          [day.dayNumber]: {
            ...currentDay,
            capstone: nextCapstone,
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  return (
    <section aria-labelledby={`day-${day.dayNumber}-exercises-title`} className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Hammer className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <h4 id={`day-${day.dayNumber}-exercises-title`} className="text-lg font-semibold text-white">
            Exercises
          </h4>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Complete the evidence, then write what broke, how you fixed it, and what you learned.
        </p>
      </div>

      <div className="space-y-4">
        {day.exercises.map((exercise) => {
          const checked = dayProgress.completedExercises.includes(exercise.id)

          return (
            <article key={exercise.id} className="rounded-md border border-white/10 bg-slate-950/50 p-4">
              <label htmlFor={`${exercise.id}-check`} className="grid cursor-pointer grid-cols-[auto_1fr] gap-3">
                <span className="relative mt-1 inline-flex h-5 w-5 items-center justify-center">
                  <input
                    id={`${exercise.id}-check`}
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggleExercise(exercise.id, event.target.checked)}
                    className="peer h-5 w-5 appearance-none rounded border border-slate-500 bg-slate-950 transition checked:border-emerald-300 checked:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <Check className="pointer-events-none absolute h-3.5 w-3.5 text-slate-950 opacity-0 peer-checked:opacity-100" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{exercise.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-300">{exercise.instructions}</span>
                </span>
              </label>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Expected skills</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                    {exercise.expectedSkills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Success criteria</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                    {exercise.successCriteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {exercise.starterCode ? (
                <pre className="mt-4 overflow-x-auto rounded-md border border-white/10 bg-slate-950 p-3 text-xs leading-6 text-slate-200">
                  <code>{exercise.starterCode}</code>
                </pre>
              ) : null}

              {exercise.stretchGoal ? (
                <p className="mt-3 text-sm text-violet-200">
                  <span className="font-semibold">Stretch: </span>
                  {exercise.stretchGoal}
                </p>
              ) : null}

              <div className="mt-4">
                <label htmlFor={`${exercise.id}-reflection`} className="mb-2 block text-sm font-medium text-slate-300">
                  Reflection: what broke, how did I fix it, what did I learn?
                </label>
                <textarea
                  id={`${exercise.id}-reflection`}
                  value={dayProgress.exerciseReflections[exercise.id] ?? ''}
                  onChange={(event) => updateReflection(exercise.id, event.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
                />
              </div>
            </article>
          )
        })}
      </div>

      {day.capstone ? (
        <section aria-labelledby={`day-${day.dayNumber}-capstone-title`} className="rounded-md border border-violet-300/20 bg-violet-300/10 p-4">
          <h4 id={`day-${day.dayNumber}-capstone-title`} className="text-lg font-semibold text-white">
            Capstone support
          </h4>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block font-medium">Project choice</span>
              <input
                value={capstone.projectChoice}
                onChange={(event) => updateCapstone({ projectChoice: event.target.value })}
                placeholder="hex viewer, log analyzer, grep-lite, HTTP parser, or todo CLI"
                className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block font-medium">CLI argument planner</span>
              <input
                value={capstone.cliArguments}
                onChange={(event) => updateCapstone({ cliArguments: event.target.value })}
                placeholder="./tool --input sample.log --mode summary"
                className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block font-medium">Design document</span>
              <textarea
                value={capstone.designDocument}
                onChange={(event) => updateCapstone({ designDocument: event.target.value })}
                rows={5}
                className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block font-medium">File structure planner</span>
              <textarea
                value={capstone.fileStructure}
                onChange={(event) => updateCapstone({ fileStructure: event.target.value })}
                rows={5}
                className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Test case checklist</p>
              <div className="space-y-2">
                {capstoneTests.map((item) => (
                  <label key={item} className="flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(capstone.testChecklist[item])}
                      onChange={(event) =>
                        updateCapstone({
                          testChecklist: {
                            ...capstone.testChecklist,
                            [item]: event.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-500 bg-slate-950 text-emerald-400 focus:ring-emerald-200"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">README checklist</p>
              <div className="space-y-2">
                {readmeItems.map((item) => (
                  <label key={item} className="flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(capstone.readmeChecklist[item])}
                      onChange={(event) =>
                        updateCapstone({
                          readmeChecklist: {
                            ...capstone.readmeChecklist,
                            [item]: event.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-500 bg-slate-950 text-emerald-400 focus:ring-emerald-200"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="mt-4 block text-sm text-slate-300">
            <span className="mb-2 block font-medium">Final retrospective</span>
            <textarea
              value={capstone.retrospective}
              onChange={(event) => updateCapstone({ retrospective: event.target.value })}
              rows={4}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-300/20"
            />
          </label>
        </section>
      ) : null}
    </section>
  )
}
