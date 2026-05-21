import { useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import type { AppProgress, DayPlan, ResourceLinkType, UpdateProgress } from '../types'
import { getDailyProgress } from '../lib/progress'

interface ResourcesPanelProps {
  day?: DayPlan
  days?: DayPlan[]
  progress: AppProgress
  updateProgress: UpdateProgress
}

const resourceTypes: ResourceLinkType[] = ['official', 'docs', 'writeup', 'reference', 'user-added']

export function ResourcesPanel({ day, days = day ? [day] : [], progress, updateProgress }: ResourcesPanelProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<ResourceLinkType>('user-added')
  const [notes, setNotes] = useState('')
  const targetDay = day ?? days[0]

  const addUserResource = () => {
    if (!targetDay || !title.trim() || !url.trim()) {
      return
    }

    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, targetDay.dayNumber)
      const resource = {
        id: `day-${targetDay.dayNumber}-user-resource-${Date.now()}`,
        title: title.trim(),
        url: url.trim(),
        type,
        notes: notes.trim(),
      }

      return {
        ...current,
        days: {
          ...current.days,
          [targetDay.dayNumber]: {
            ...currentDay,
            userResourceLinks: [...currentDay.userResourceLinks, resource],
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
    setTitle('')
    setUrl('')
    setNotes('')
    setType('user-added')
  }

  const removeUserResource = (dayNumber: number, resourceId: string) => {
    updateProgress((current, savedAt) => {
      const currentDay = getDailyProgress(current, dayNumber)

      return {
        ...current,
        days: {
          ...current.days,
          [dayNumber]: {
            ...currentDay,
            userResourceLinks: currentDay.userResourceLinks.filter((resource) => resource.id !== resourceId),
            lastUpdatedAt: savedAt,
          },
        },
      }
    })
  }

  return (
    <section aria-labelledby={day ? `day-${day.dayNumber}-resources-title` : 'resources-title'} className="space-y-5">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-cyan-300" aria-hidden="true" />
        <h4 id={day ? `day-${day.dayNumber}-resources-title` : 'resources-title'} className="text-lg font-semibold text-white">
          Resources
        </h4>
      </div>

      {days.map((resourceDay) => {
        const dayProgress = getDailyProgress(progress, resourceDay.dayNumber)

        return (
          <article key={resourceDay.dayNumber} className="rounded-md border border-white/10 bg-slate-950/50 p-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold text-cyan-200">Day {resourceDay.dayNumber}</p>
                <h5 className="mt-1 font-semibold text-white">{resourceDay.title}</h5>
              </div>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-400">
                {resourceDay.thmTopic}
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Built-in links</p>
                <div className="mt-2 space-y-2">
                  {resourceDay.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10"
                    >
                      <span className="font-semibold text-white">{resource.title}</span>
                      <span className="ml-2 text-xs text-slate-500">{resource.type}</span>
                      {resource.notes ? <span className="mt-1 block text-xs leading-5 text-slate-400">{resource.notes}</span> : null}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">TryHackMe learning extraction</p>
                <dl className="mt-2 space-y-3 text-sm leading-6 text-slate-300">
                  <div>
                    <dt className="font-semibold text-slate-100">Related concepts</dt>
                    <dd>{resourceDay.resourceBrief.relatedConcepts.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-100">Commands/tools used</dt>
                    <dd>{resourceDay.resourceBrief.commandsTools.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-100">Understand after the room</dt>
                    <dd>{resourceDay.resourceBrief.understandAfter.join(', ')}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-100">Review / quiz</dt>
                    <dd>
                      Review {resourceDay.resourceBrief.reviewConcepts.join(', ')}. Quiz {resourceDay.resourceBrief.quizConcepts.join(', ')}.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-100">Connection to C</dt>
                    <dd>{resourceDay.resourceBrief.cConnection}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {dayProgress.userResourceLinks.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">User-added links</p>
                <div className="mt-2 space-y-2">
                  {dayProgress.userResourceLinks.map((resource) => (
                    <div key={resource.id} className="flex flex-col justify-between gap-2 rounded-md border border-white/10 bg-slate-900/70 p-3 sm:flex-row sm:items-start">
                      <a href={resource.url} target="_blank" rel="noreferrer" className="text-sm text-cyan-200 hover:text-cyan-100">
                        {resource.title}
                        <span className="ml-2 text-xs text-slate-500">{resource.type}</span>
                        {resource.notes ? <span className="mt-1 block text-xs leading-5 text-slate-400">{resource.notes}</span> : null}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeUserResource(resourceDay.dayNumber, resource.id)}
                        className="inline-flex min-h-9 items-center gap-2 rounded-md border border-rose-300/30 bg-rose-400/10 px-2 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-400/20 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )
      })}

      {targetDay ? (
        <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4">
          <h5 className="font-semibold text-white">Add resource to Day {targetDay.dayNumber}</h5>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm text-slate-300">
              <span className="mb-1 block">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
              />
            </label>
            <label className="text-sm text-slate-300">
              <span className="mb-1 block">URL</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="min-h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
              />
            </label>
            <label className="text-sm text-slate-300">
              <span className="mb-1 block">Type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as ResourceLinkType)}
                className="min-h-10 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
              >
                {resourceTypes.map((resourceType) => (
                  <option key={resourceType} value={resourceType}>
                    {resourceType}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block text-sm text-slate-300">
            <span className="mb-1 block">My personal notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-white/10 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
            />
          </label>
          <button
            type="button"
            onClick={addUserResource}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add resource
          </button>
        </div>
      ) : null}
    </section>
  )
}
