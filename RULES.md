# Rules — Daily Life OS

This document defines the non-negotiable product, engineering, UX, AI, and scheduling rules for the Daily Life OS.

The purpose of these rules is to keep the application simple, predictable, calm, and genuinely useful.

---

# 1. Product Rules

## 1.1 The app is a daily operating system

Do not treat this as a conventional habit tracker or todo list.

The core question is:

> **What should I be doing right now?**

Every major feature should support that goal.

## 1.2 The schedule is the center of the product

Tasks, habits, routines, goals, and commitments exist to help construct a useful day.

Do not build features that make the app look more complete but do not improve planning or execution.

## 1.3 Reduce decisions

The user should not have to constantly decide:

- What should I do next?
- Which task should I move?
- Where does this task fit?
- What should I sacrifice when the day is overloaded?

The application should make sensible suggestions.

## 1.4 Reality always wins

The user's actual behavior is more important than the original plan.

If the user:

- skips a task,
- finishes early,
- starts late,
- adds urgent work,
- removes a commitment,

the schedule should adapt.

Never make the user feel like they "failed" because the original schedule changed.

---

# 2. Scheduling Rules

## 2.1 Never assume everything fits

The scheduler must calculate available capacity.

If the user has 8 hours available and 11 hours of work, do not silently create an impossible 11-hour schedule.

Instead show:

> Your day is overloaded by 3 hours.

Then provide practical suggestions.

## 2.2 Fixed commitments have highest scheduling priority

Examples:

- Meetings
- Appointments
- Calls
- Events

These should not be moved automatically unless the user explicitly allows it.

## 2.3 Critical tasks come next

Critical tasks:

- Have a deadline today
- Are explicitly marked critical
- Are required for another commitment

Protect these before flexible work.

## 2.4 Important tasks come before flexible tasks

Priority order:

```text
Fixed commitments
↓
Critical
↓
Important
↓
Flexible
↓
Optional
```

This is the default, not an excuse to ignore user preferences.

## 2.5 Respect time constraints

A task with:

```text
Preferred time: morning
```

should not casually be moved to evening.

A task with:

```text
Must happen: 4 PM
```

should not be treated like a flexible task.

## 2.6 Respect estimated duration

Do not schedule a 90-minute task into a 30-minute slot.

If there is insufficient capacity, split the task only if splitting is allowed.

Otherwise move it.

## 2.7 Preserve context

Avoid excessive context switching.

Prefer:

```text
Client work
Client work
Client work
```

over:

```text
Client work
DSA
Client work
Personal task
Client work
```

when both schedules are otherwise equivalent.

## 2.8 Include realistic breaks

The scheduler should not fill every available minute.

Leave reasonable transition and break time.

A schedule that looks perfectly efficient but is exhausting is a bad schedule.

## 2.9 Do not automatically sacrifice sleep

Sleep is a hard constraint unless the user explicitly changes it.

Never solve an overloaded day by silently scheduling work during sleep.

---

# 3. Rescheduling Rules

## 3.1 User changes override automation

If the user manually moves a task, do not immediately move it back because the scheduler thinks another position is better.

Manual decisions should be respected.

## 3.2 Skipping is not failure

When the user skips a task, offer:

```text
Move later today
Move tomorrow
Move this week
Skip
```

Do not automatically push every skipped task into tomorrow.

## 3.3 Do not create task debt

Avoid endlessly moving unfinished tasks forward.

If a task has been moved repeatedly, surface it:

> This task has been moved 4 times. Do you still want to keep it?

Offer:

- Keep
- Reschedule
- Delete
- Break into smaller tasks

## 3.4 Recalculate after meaningful changes

Recalculate the day after:

- Adding a critical task
- Removing a major task
- Changing a commitment
- Skipping a large task
- Changing availability
- Changing working hours
- User explicitly asks to replan

Do not constantly recalculate for insignificant UI changes.

---

# 4. AI Rules

## 4.1 AI interprets; the scheduler decides

This is the most important technical rule.

The AI must NOT directly invent and save a complete schedule.

Correct flow:

```text
User message
↓
OpenRouter
↓
Structured operations
↓
Validation
↓
Application state
↓
Scheduler
↓
New schedule
```

## 4.2 AI must use structured operations

Possible operations include:

```text
ADD_TASK
UPDATE_TASK
DELETE_TASK
MOVE_TASK
SKIP_TASK
COMPLETE_TASK
CHANGE_PRIORITY
CHANGE_DURATION
CREATE_HABIT
UPDATE_HABIT
DELETE_HABIT
CREATE_ROUTINE
UPDATE_ROUTINE
DELETE_ROUTINE
ADD_COMMITMENT
UPDATE_COMMITMENT
DELETE_COMMITMENT
CHANGE_AVAILABILITY
REPLAN_DAY
```

Do not execute arbitrary natural-language instructions directly against the database.

## 4.3 Validate every AI operation

Before applying an AI-generated operation:

1. Validate operation type.
2. Validate required fields.
3. Validate IDs.
4. Validate duration.
5. Validate dates.
6. Validate priority.
7. Validate time ranges.
8. Check scheduling constraints.

Invalid operations must be rejected safely.

## 4.4 AI cannot bypass constraints

If AI says:

> Schedule this task at 3 AM.

but the user's sleep window is 12 AM–8 AM, the scheduler must reject the placement.

The AI is not above the application's rules.

## 4.5 Ask when intent is genuinely ambiguous

If the user says:

> "Move that thing later."

and there are multiple plausible tasks, do not guess.

Ask:

> Which task do you mean?

Do not make destructive changes based on weak assumptions.

## 4.6 Do not ask unnecessary questions

If the application has enough information to make a reasonable decision, make the decision.

The AI should reduce friction, not create a conversation for every action.

## 4.7 Keep AI responses concise

Prefer:

> Added the client task and moved your portfolio work to tomorrow.

over a long explanation of every internal decision.

---

# 5. AI Privacy Rules

## 5.1 Send only relevant context

Do not send the entire database to OpenRouter.

Send only the context needed for the current request.

## 5.2 Never send secrets

Never include:

- API keys
- Passwords
- Authentication tokens
- TOTP secrets
- Private credentials

in AI context.

## 5.3 Do not expose API keys in UI code

The OpenRouter key must not be hard-coded into React components or committed to source control.

Use secure local configuration appropriate to the desktop architecture.

## 5.4 AI failure must not break the app

If OpenRouter is unavailable:

- Tasks still work.
- Habits still work.
- Scheduling still works.
- History still works.

Show a clear AI error and allow the user to continue manually.

---

# 6. Data Rules

## 6.1 Local-first

Normal application functionality should work without an internet connection.

The first version should use local persistence.

## 6.2 Never silently lose data

Destructive actions should either:

- require confirmation, or
- be reversible.

## 6.3 Use stable IDs

Tasks, habits, routines, commitments, and schedule blocks must have stable unique identifiers.

Do not use array indexes as persistent IDs.

## 6.4 Preserve history

Do not overwrite historical completion data when a task changes.

The application should be able to distinguish:

```text
Planned
Completed
Skipped
Moved
Cancelled
```

## 6.5 Store timestamps consistently

Store timestamps in a consistent format and handle local timezone presentation separately.

Do not rely on ambiguous date strings.

---

# 7. Task Rules

## 7.1 Every task should have a clear outcome

Prefer:

> Finish authentication API

over:

> Work on backend

The application should encourage actionable task names.

## 7.2 Duration matters

Every schedulable task should have an estimated duration.

If the user does not provide one, use a sensible default and make it editable.

## 7.3 Avoid giant tasks

If a task is several hours long and can reasonably be split, suggest breaking it down.

Example:

```text
Build dashboard

↓
Design dashboard
↓
Build API
↓
Build UI
↓
Test dashboard
```

Do not automatically split everything.

---

# 8. Habit Rules

## 8.1 Habits are recurring intentions

A habit is not simply a repeated task.

Store:

- Frequency
- Target
- Duration
- Preferred time
- Active state

## 8.2 Do not punish missed habits

Avoid aggressive streak-loss messaging.

The product should encourage consistency without creating guilt.

## 8.3 Avoid over-scheduling habits

If a habit repeatedly conflicts with important work, surface the conflict and suggest a better time.

---

# 9. UX Rules

## 9.1 The next action must be obvious

When the user opens Today, the first question answered should be:

> What should I do now?

## 9.2 One primary action per area

Do not present 10 equally prominent buttons.

Examples:

Today:

> Complete current task

Tasks:

> Add Task

AI:

> Tell me what's changed

## 9.3 Avoid unnecessary modals

Prefer inline interactions for:

- Completion
- Priority changes
- Small edits
- Rescheduling

Use dialogs for actions that genuinely require focused input.

## 9.4 Do not hide important information behind hover

Hover can enhance desktop interactions but must never be the only way to discover an important action or status.

## 9.5 Keep navigation stable

Do not constantly move navigation items or change the application structure.

The user should build spatial memory.

## 9.6 Use progressive disclosure

Show important information first.

Advanced controls should appear when needed.

---

# 10. Visual Rules

These rules complement `design.md`.

## 10.1 Cards

Cards:

```text
background: #FFFFFF
border: none
```

Never add a default border around cards.

## 10.2 Background

Application background:

```text
#DEEFF6
```

## 10.3 Foreground

Primary text:

```text
#05313A
```

## 10.4 Primary

Primary interaction color:

```text
#328F9B
```

## 10.5 Borders

Use the independent token:

```text
rgba(5, 49, 58, 0.10)
```

Only where a border genuinely improves usability.

## 10.6 Tags

Tag backgrounds should be approximately 20% of their semantic color.

Tags should remain subtle.

---

# 11. Accessibility Rules

Always support:

- Keyboard navigation
- Visible focus
- Semantic buttons
- Accessible labels
- Tooltips for unfamiliar icon-only controls
- Sufficient contrast
- Reduced motion

Never rely solely on:

- Color
- Hover
- Animation
- Icons

to communicate important information.

---

# 12. Performance Rules

## 12.1 Keep the dashboard fast

The Today screen should render quickly even with a large history.

Do not load unnecessary historical data when opening Today.

## 12.2 Avoid unnecessary re-renders

Keep scheduler calculations separate from presentation.

Do not recalculate the entire schedule for every keystroke.

## 12.3 AI calls should be intentional

Never call OpenRouter continuously.

Only call it when:

- The user submits a request.
- A user explicitly asks for AI assistance.
- A future feature explicitly requires an AI analysis.

Do not make AI calls on every page load.

---

# 13. Error Handling

Errors should be understandable to a normal user.

Bad:

> Prisma P2002 constraint violation.

Good:

> This task already exists. Try editing the existing task instead.

For AI:

Bad:

> HTTP 429.

Good:

> AI is temporarily unavailable. You can continue managing your day manually.

Technical details can be available in developer logs.

---

# 14. Confirmation Rules

Ask for confirmation before:

- Permanently deleting important data
- Deleting a goal with related tasks
- Clearing history
- Resetting application data

Do not ask for confirmation for routine actions such as:

- Completing a task
- Skipping a task
- Moving a task
- Adding a normal task

The application should feel fast.

---

# 15. No Gamification by Default

Do not introduce:

- XP
- Coins
- Levels
- Leaderboards
- Streak pressure
- Punishment
- Fake achievements

The product is about managing real life effectively, not playing a productivity game.

---

# 16. No Dark Patterns

Never:

- Make destructive actions easier than safe actions.
- Hide important settings.
- Create artificial urgency.
- Shame the user for missed tasks.
- Manipulate the user into using AI.
- Prevent manual control.

The user should always remain in control.

---

# 17. Scheduler Explainability

When the scheduler makes a meaningful change, the application should be able to explain it.

Example:

> Moved Portfolio to tomorrow because today's client work and meeting filled the remaining capacity.

Do not expose complex internal scoring.

Explain decisions in simple language.

---

# 18. Manual Override

The user always has final control.

They can manually:

- Move a task
- Change duration
- Change priority
- Skip
- Complete
- Reschedule
- Delete

The scheduler should adapt around user decisions.

---

# 19. Development Rules

## 19.1 Build incrementally

Do not build the entire product before testing it.

Build:

```text
Tasks
↓
Schedule
↓
Habits
↓
Rescheduling
↓
Dashboard
↓
AI
```

and validate each stage.

## 19.2 Do not over-engineer

Avoid introducing infrastructure that is not needed by the current MVP.

Do not add:

- Microservices
- Complex event buses
- Cloud infrastructure
- Authentication
- Multi-user architecture

unless the product actually requires them.

## 19.3 Keep domain logic independent

The scheduler should be testable without rendering React components.

AI parsing should be testable independently.

Database operations should be isolated from UI components.

## 19.4 Prefer boring, readable code

The application will eventually contain important scheduling logic.

Readable code is more valuable than clever abstractions.

---

# 20. Testing Rules

Test the scheduler against real scenarios.

At minimum:

### Normal day

Tasks fit normally.

### Overloaded day

Tasks exceed available time.

### Late start

User starts the day 2 hours late.

### Missed task

A 1-hour task is skipped.

### Urgent task

A 3-hour critical task is added midday.

### Fixed commitment

A meeting is added in the middle of existing work.

### Completed early

A task scheduled for 2 hours finishes in 1 hour.

### Repeatedly moved task

A task is rescheduled several times.

### No available time

There is genuinely no capacity.

The scheduler must behave predictably in all cases.

---

# 21. Definition of a Good Schedule

A good schedule is NOT:

> The maximum amount of work packed into the day.

A good schedule is:

> **A realistic sequence of actions that respects the user's priorities, constraints, energy, commitments, and available time.**

Prefer a slightly under-filled day over an impossible one.

---

# 22. Final Product Rule

When making any product, UX, AI, or engineering decision, ask:

> **Does this help the user know what to do next and actually do it?**

If yes, consider it.

If no, it probably does not belong in the core product.

The application should always feel like:

```text
Open app
   ↓
See what matters
   ↓
Do the next thing
   ↓
Reality changes
   ↓
Tell the app
   ↓
Schedule adapts
   ↓
Continue
```

That is the product.
