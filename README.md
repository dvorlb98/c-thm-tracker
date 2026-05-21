# C + TryHackMe Learning System

Local-first Vite + React + TypeScript + Tailwind app for a 30-day C and TryHackMe study plan.

The app includes:

- Today view with a dynamic Hour 1 review queue.
- 30-day plan with daily tabs.
- Active recall, interleaving, exercises, quizzes, notes, shutdown, resources, and flashcards.
- Spaced-repetition flashcard review.
- Quiz results and failed-question review.
- Competency dashboard.
- Deep Work Mode.
- Browser-local JSON export/import backup.

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

The build output is static and deployable to Cloudflare Pages.

## Local Progress

There is no backend, database, auth, API key, or cloud sync. Progress is saved in the current browser with `localStorage`.

Current storage key:

```text
c-thm-learning-system-v2
```

The app stores:

- start date
- completed tasks and exercises
- active recall and interleaving answers
- exercise reflections
- quiz sessions and failed questions
- flashcard review state and scheduling history
- notes, summaries, shutdown fields, and shutdown checkbox
- competency ratings
- user-added resources
- deep work sessions
- capstone planning fields
- schema version and last saved timestamp

## Migration

If old progress exists under:

```text
c-thm-progress-v1
```

the app migrates task checks, notes, and start date into the v2 schema and leaves the old key untouched.

If localStorage is corrupted, the app starts safely, preserves the raw value under a corrupted backup key, and shows a recovery message. The Backup view can export raw corrupted data if available.

## Backup

Use the Backup view to:

- export a JSON backup
- import a validated v2 JSON backup after confirmation
- view schema version and local progress size
- reset all progress only after typing `RESET`

Progress is browser-local. Export a JSON backup regularly if you want to preserve progress or move to another device.
