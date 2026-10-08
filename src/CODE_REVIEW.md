# FocasFlow Code Review

**Review scope:** Read-only review of the TypeScript, TSX, and CSS files under `src/`.

**Behavior changes made:** None. This report is the only new file.

**Validation:** `npx tsc --noEmit` was run from the project root and currently fails with one compiler error:

```text
src/views/TasksView.tsx(481,32): error TS2322: Type 'string' is not assignable to type 'Category'.
```

## High-priority findings

### 1. The project does not pass TypeScript validation

- **File:** `views/TasksView.tsx:477-485`
- **Problem:** Category editing assigns `newCatName.trim()` (an arbitrary string) to `Task.category`, but `Task.category` is typed as the closed union `Category` in `types/index.ts:4`.
- **Impact:** `tsc` fails, so the configured build (`tsc && vite build`) cannot complete. This is also a signal that custom categories are not represented consistently in the domain type.
- **Safe direction:** Define one validated/custom-category representation and use it consistently at the boundary, or widen the type deliberately after validating the input. Do not suppress the error with a broad cast without deciding how custom categories should be handled everywhere.

### 2. Calendar dates are derived with UTC conversions throughout the app

- **Files:** `store/useAppStore.ts:190-193, 866-869, 902-905, 1187-1189, 1236-1239`; `utils/metrics.ts:20, 103-116, 178-221`; `engine/aiClient.ts:118-120`; `engine/scheduler.ts:87, 166`; `components/WeekDateStrip.tsx:8-51`; `views/TasksView.tsx:167, 212-221, 310-326`; `views/AnalyticsView.tsx:113-117, 275-277, 393`; `views/HabitsView.tsx:11-19`; `components/TaskModal.tsx:17, 38, 57, 70`
- **Problem:** Local calendar dates are repeatedly produced with `new Date().toISOString().split('T')[0]`, and date-only strings are parsed with `new Date('YYYY-MM-DD')`. Those operations use UTC semantics while UI scheduling uses local time.
- **Impact:** Around midnight, tasks can be assigned to the previous/next calendar day. `new Date(date).getDay()` can also classify a date in the wrong weekday depending on the user’s timezone. This can affect today’s tasks, weekly analytics, habit frequency, streaks, “tomorrow”, and scheduler capacity.
- **Safe direction:** Centralize local-calendar parsing/formatting in a small date utility and use it for all `YYYY-MM-DD` values. Keep ISO timestamps for audit fields, but do not use their UTC date portion as the user’s local day.

### 3. Changing the selected date does not rebuild `scheduleBlocks`

- **File:** `store/useAppStore.ts:725-726, 1173-1178`
- **Problem:** `setSelectedDate` only updates `selectedDate`. `scheduleBlocks` is rebuilt by `replanDay`, but changing dates does not call it.
- **Impact:** Schedule-oriented UI can continue showing blocks generated for the previous date until another unrelated action triggers replanning. The task list and capacity may represent the new date while the schedule blocks are stale.
- **Safe direction:** Recompute or derive blocks from the selected date when the date changes. If persistence is retained, avoid persisting a derived value that can become stale.

### 4. The scheduler’s frequency filter treats every non-daily habit as active every day

- **File:** `engine/scheduler.ts:89-95`
- **Problem:** The filter returns `true` for the `daily`, valid weekday/weekend cases, and then unconditionally returns `true` for all remaining frequencies. That includes `weekly` and any invalid value.
- **Impact:** Weekly habits are planned on every day, inflating capacity, causing false overload warnings, and placing habits on dates where they should not appear.
- **Safe direction:** Handle `weekly` explicitly using the habit’s chosen cadence/data model, and return `false` for unsupported values.

### 5. Overnight sleep windows cannot be scheduled by `buildDaySchedule`

- **File:** `engine/scheduler.ts:169-170, 232, 239`
- **Problem:** Capacity correctly treats a sleep time earlier than wake time as crossing midnight, but the builder starts at `wakeM` and only places tasks while `cursorM + duration <= sleepM`. For an overnight window, `sleepM < wakeM`, so the loop never runs.
- **Impact:** Users with a schedule such as 22:00–06:00 receive no automatically scheduled tasks even though capacity reports available minutes.
- **Safe direction:** Represent the planning window on an unwrapped timeline (for example, move the end past 1440 when it crosses midnight), then normalize only when displaying times.

### 6. AI “tomorrow” updates can remove a task’s date instead of moving it to tomorrow

- **File:** `store/useAppStore.ts:1263-1272`
- **Problem:** In the `UPDATE_TASK` branch, `op.target_date === 'tomorrow'` assigns `scheduledDate: undefined`. The add and move branches calculate an actual tomorrow date, but this branch does not.
- **Impact:** A refinement such as changing a task while asking for tomorrow can turn it into an unscheduled task rather than placing it on tomorrow.
- **Safe direction:** Resolve `today`/`tomorrow` consistently once and reuse the same date resolver in all operation branches.

### 7. AI operation payloads are trusted without runtime validation

- **Files:** `engine/aiClient.ts:235-256, 362-383`; `store/useAppStore.ts:1180-1313`
- **Problem:** Parsed model JSON is accepted if it is an object and `operations` is an array. Individual operation types, dates, times, durations, categories, and numeric ranges are not validated before mutating state.
- **Impact:** Malformed or hallucinated model output can create invalid tasks, negative/zero durations, invalid dates, unsupported categories/frequencies, or unintended bulk deletion. The local model and cloud/backend responses are all untrusted input from the app’s perspective.
- **Safe direction:** Validate and normalize every operation against a runtime schema before applying it; reject unknown operation types and enforce bounds. Keep the apply step defensive even if the prompt contains a schema.

### 8. AI title matching can mutate the wrong task

- **File:** `store/useAppStore.ts:1222-1239, 1263-1287`; `engine/aiClient.ts:673-683`
- **Problem:** Several operations resolve a task using case-insensitive substring matching. If multiple tasks share a word, the first matching task is selected. Delete logic also supports broad title containment.
- **Impact:** A command intended for one task may complete, skip, move, update, or delete a different task. This is especially risky for destructive operations.
- **Safe direction:** Prefer stable task IDs from the conversation context. If an ID is unavailable and more than one task matches, return an ambiguity result and require user confirmation rather than choosing the first match.

### 9. OpenRouter credentials are persisted as plain local storage data

- **Files:** `views/SettingsView.tsx:145-160`; `store/useAppStore.ts:542-555, 562-570`
- **Problem:** The API key is stored inside the serialized `settings` object under `localStorage` and also copied into the Tauri store.
- **Impact:** Any script running in the webview origin, browser profile access, local backup, or accidental settings export can expose the cloud credential. The UI text describes this as a “secure environment,” which is not true for ordinary browser local storage.
- **Safe direction:** Use the platform’s protected credential storage where available, minimize retention, and clearly communicate the security model. Avoid logging or serializing secrets into general settings records.

## Medium-priority findings

### 10. Initial Tauri synchronization races the initial replan

- **File:** `App.tsx:31-35`; `store/useAppStore.ts:522-540, 1173-1178`
- **Problem:** `syncFromTauriStore(...)` is started without awaiting its asynchronous reads, while `replanDay()` immediately runs against the initial in-memory state. When the Tauri values arrive, the store is updated but no replan is triggered.
- **Impact:** The first rendered schedule/capacity can be computed from seed data instead of persisted data and remain stale until another action causes replanning.
- **Safe direction:** Make initialization an explicit sequence: restore persisted state, then derive schedule/capacity from the restored state. Keep the derived-state update atomic where possible.

### 11. Persistence writes are fire-and-forget and can complete out of order

- **File:** `store/useAppStore.ts:551-556`
- **Problem:** Each save starts `tauriStore.set(...).then(() => tauriStore.save())` without awaiting or serializing writes. Rapid actions can issue multiple saves concurrently.
- **Impact:** A slower earlier write can overwrite a newer state, and failures are only logged. The localStorage write succeeds even if the durable Tauri save fails, creating divergent stores.
- **Safe direction:** Queue writes per store or use a single debounced persistence pipeline with revision ordering and visible recovery/error handling.

### 12. Derived scheduling rewrites tasks and persists them on every replan

- **File:** `store/useAppStore.ts:1173-1178`; `engine/scheduler.ts:173, 258-266`
- **Problem:** `replanDay` writes `scheduledDate`, `scheduledStart`, and `scheduledEnd` into task records, then persists the entire task list. The schedule is also kept separately in `scheduleBlocks`.
- **Impact:** Derived scheduling can overwrite user-entered timing, generate unnecessary storage writes, and create two sources of truth. Replanning after settings changes can make task history appear modified even when the user did not edit the task.
- **Safe direction:** Decide whether schedule fields are user-owned or derived. If derived, calculate them without persisting; if user-owned, only update them under explicit scheduling rules and track the source.

### 13. `moveTaskLater` does not update `updatedAt` and does not clearly move the date

- **File:** `store/useAppStore.ts:889-899`
- **Problem:** The action changes priority and `movedCount`, but leaves `updatedAt` unchanged and retains the existing `scheduledDate`.
- **Impact:** Analytics/history based on modification time can be wrong, and “move later” may only reorder priority rather than move the task later in the calendar.
- **Safe direction:** Define the action’s contract explicitly and update all fields required by that contract, including the audit timestamp.

### 14. Task/habit deletion and skipping leave timer entries behind

- **Files:** `store/useAppStore.ts:791-802, 847-863, 969-976`
- **Problem:** Deleting a task or skipping it does not remove its `taskElapsedSeconds` entry unless a separate active-timer path happens to handle it.
- **Impact:** Persistent timer maps accumulate orphaned IDs and can retain stale timing if an item is recreated or restored with the same ID. This also makes metrics harder to reason about.
- **Safe direction:** Remove timer state when deleting/skipping, or maintain a documented retention policy and garbage-collect entries not present in the task list.

### 15. Habit IDs and several entity IDs are not collision-safe

- **Files:** `store/useAppStore.ts:945-950, 1000-1008, 1028-1035, 1288-1299, 1384-1398`
- **Problem:** Habit, routine, goal, AI-created habit, and onboarding task IDs use `Date.now()` alone. Multiple creations in the same millisecond can collide.
- **Impact:** A collision can cause list rendering key reuse, updates/deletes against the wrong entity, or overwritten logical records.
- **Safe direction:** Use a single collision-resistant ID generator and keep it centralized.

### 16. WebLLM model loading has no concurrency guard and model replacement cleanup

- **File:** `engine/webLlmService.ts:82-83, 157-183`
- **Problem:** Concurrent calls can each create and reload a separate `MLCEngine`. Loading a different model replaces the global reference without explicitly unloading the previous engine. Deleting a loaded model only nulls references.
- **Impact:** Multiple large model downloads/inferences can race, consume excessive memory/GPU resources, or leave the previous model resident. UI actions can start duplicate loads.
- **Safe direction:** Share an in-flight load promise, serialize model switches, and use the library’s documented unload/dispose lifecycle before releasing a loaded engine.

### 17. Whisper recording uses a deprecated ScriptProcessor and keeps all PCM in memory

- **File:** `engine/whisperService.ts:175-193, 202-223`
- **Problem:** `createScriptProcessor` is deprecated and the implementation copies every audio callback into an unbounded array until transcription starts.
- **Impact:** Long recordings allocate large amounts of memory and may glitch on the main thread. Browser support and audio performance are less reliable than an AudioWorklet-based capture path.
- **Safe direction:** Bound recording duration/size, expose cancellation, and migrate capture processing to an AudioWorklet or another supported streaming path.

### 18. Audio and timeout resources are not consistently cleaned up on unmount

- **Files:** `components/LofiBackgroundPlayer.tsx:28-105`; `components/MoodInsightModal.tsx:146-163`; `views/PreferencesView.tsx:111`; `views/ProfileView.tsx:123`; `views/AiAssistantView.tsx:279, 378, 405, 410, 415, 493`
- **Problem:** Several `setTimeout` calls are created without a cleanup ref. The Lofi component has no unmount cleanup effect for its fallback `AudioContext`.
- **Impact:** Delayed state updates can target unmounted components, and audio contexts can remain alive after the player is removed. Repeated open/close flows can create stale timers and confusing UI feedback.
- **Safe direction:** Store timer IDs in refs and clear them in effect cleanup; close fallback audio in an unmount cleanup effect.

### 19. Lofi fallback is only triggered by iframe `onError`, not failed autoplay/playback

- **File:** `components/LofiBackgroundPlayer.tsx:39-49, 107-129`
- **Problem:** YouTube can load successfully while playback is blocked by browser autoplay policy or an iframe command arrives before the player is ready. Those cases do not fire iframe `onError`, so the Web Audio fallback is never started.
- **Impact:** The UI can report playing while producing no sound.
- **Safe direction:** Track player readiness and command/playback errors, then explicitly fall back when play cannot begin. Also include `lofiVolume` in the playback effect dependency if the effect is expected to use the current value.

### 20. Global click sound handling adds work and side effects to every document click

- **File:** `utils/soundEffects.ts:135-184`; `App.tsx:31-53`
- **Problem:** A capture-phase document listener inspects every click and creates six audio elements at module initialization. It is also independent of the `enableButtonClickSound` preference; the preference is not checked in this listener.
- **Impact:** Click sounds may play when the user has disabled them, and every click incurs DOM traversal plus audio-pool work. Browser autoplay restrictions are silently swallowed, making failures hard to diagnose.
- **Safe direction:** Gate the listener through the preference, use delegated semantic events only where needed, and expose a small diagnostic path for rejected playback promises.

## Lower-priority maintainability and optimization findings

### 21. The store and large views are overly broad change boundaries

- **Files:** `store/useAppStore.ts`, `views/TasksView.tsx`, `views/AiAssistantView.tsx`, `views/AnalyticsView.tsx`, `components/ProductivitySummary.tsx`, `components/OnboardingModal.tsx`
- **Problem:** Large components subscribe to broad Zustand state slices and contain substantial parsing, filtering, formatting, and rendering logic in one module.
- **Impact:** Small state changes can rerender large trees, and behavior changes are harder to isolate and test. This is a performance and regression-risk concern rather than an immediate behavior bug.
- **Safe direction:** Use selector-based subscriptions with shallow equality, extract pure domain functions, and add focused tests around scheduler, metrics, and AI operation application before refactoring.

### 22. Runtime `any` usage hides invalid state transitions

- **Files:** `store/useAppStore.ts:94, 515, 522, 526`; `engine/aiClient.ts:33, 484, 924, 1019`; `engine/webLlmService.ts:225`; multiple views/components
- **Problem:** Broad `any` types are used at persistence, model output, browser API, and UI boundaries.
- **Impact:** The TypeScript compiler cannot protect the most failure-prone parts of the app, including exactly the AI and custom-category paths where malformed values can reach state.
- **Safe direction:** Replace boundary `any` with `unknown` plus runtime narrowing, typed operation unions, and typed browser API adapters.

### 23. Model-cache bookkeeping can report a model as available when the cache is gone

- **File:** `engine/webLlmService.ts:89-107`; `views/SettingsView.tsx:62-80`
- **Problem:** `checkModelCached` trusts `localStorage` fallback flags after cache inspection fails or returns false. Deleting cache entries removes the flag, but external cache eviction leaves a stale positive flag.
- **Impact:** Settings may show a model as downloaded while the next inference must download or fails.
- **Safe direction:** Treat the actual model cache as authoritative when it can be queried, and clear stale metadata when a load fails.

### 24. The global context-menu suppression is an accessibility/usability regression

- **File:** `App.tsx:37-47`
- **Problem:** The app prevents the context menu everywhere except inputs and textareas.
- **Impact:** Users lose standard browser context actions on links, images, buttons, and assistive workflows. This is particularly problematic in a web build where the browser remains the user’s primary environment.
- **Safe direction:** Scope suppression to a deliberate desktop-only surface or remove it; preserve normal browser behavior elsewhere.

## Files reviewed

`App.tsx`, `main.tsx`, `index.css`, all files under `components/`, `engine/`, `store/`, `types/`, `utils/`, and `views/`, plus the project `package.json` and TypeScript configuration needed for validation. The static asset `assets/mountain_hero_bg.jpg` was not semantically inspected because it is binary and contains no executable code.

## Recommended order of follow-up

1. Restore a passing TypeScript build at `views/TasksView.tsx:481`.
2. Fix local-date handling and selected-date schedule invalidation.
3. Correct habit frequency and overnight scheduling behavior.
4. Add runtime validation and safer task identity resolution before applying AI operations.
5. Review credential storage and Tauri persistence ordering.
6. Add targeted tests for scheduler, date utilities, metrics, persistence restoration, and AI operation application before larger performance refactors.
