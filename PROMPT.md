# Prompt: Build the Daily Life OS Desktop App

## Role

You are an expert product engineer and UI/UX engineer. Build a polished
desktop productivity application based on the attached reference design.

The application is **not just a habit tracker**. It is a personal daily
operating system that helps the user decide what they should be doing
throughout the day.

The core product question is:

> **"What should I be doing right now?"**

The application should combine tasks, habits, routines, goals,
commitments, scheduling, and AI assistance into one calm, easy-to-use
desktop experience.

------------------------------------------------------------------------

# 1. Product Vision

Build a desktop application that turns the user's intentions into a
realistic daily plan.

The user should be able to tell the application things naturally, for
example:

-   "I need to finish the client API today."
-   "I have a meeting at 4 PM."
-   "Add 45 minutes of DSA every weekday."
-   "I don't want to exercise today."
-   "I need another 2 hours for my portfolio."
-   "I'm running late today."
-   "What should I do right now?"
-   "Move this task to tomorrow."

The application uses the OpenRouter API to understand natural-language
requests, converts them into structured actions, updates the user's
data, and asks the deterministic scheduler to recalculate the day.

### Important principle

**AI should interpret intent. The scheduler should make scheduling
decisions.**

Do not allow the LLM to directly generate an arbitrary final timetable
and blindly save it.

The AI should produce structured operations such as:

``` text
ADD_TASK
UPDATE_TASK
DELETE_TASK
MOVE_TASK
SKIP_TASK
CHANGE_PRIORITY
CHANGE_DURATION
CREATE_HABIT
CREATE_ROUTINE
ADD_COMMITMENT
CHANGE_AVAILABILITY
REPLAN_DAY
```

The application validates these operations and then lets the scheduler
generate the actual schedule.

------------------------------------------------------------------------

# 2. Reference Design

Use the attached image as the primary visual reference.

The reference has:

-   A very light blue/white background.
-   A calm, minimal, soft visual language.
-   Rounded cards.
-   Large whitespace.
-   A dark teal mountain/landscape hero card.
-   Serif typography for prominent numbers/headings.
-   Small muted sans-serif supporting text.
-   Subtle category colors.
-   A dashboard layout with strong visual hierarchy.
-   A left vertical navigation/sidebar.
-   A main hero/date area.
-   A productivity summary area.
-   A Today Tasks section.
-   Quick Actions.
-   Very restrained use of color.

Do **not** copy the reference pixel-for-pixel. Use it as the design
direction and improve the UX where appropriate.

The application should feel:

-   Calm
-   Focused
-   Premium
-   Minimal
-   Spacious
-   Easy to scan
-   Not overwhelming
-   More like a personal workspace than a corporate dashboard

Avoid:

-   Excessive gradients
-   Excessive shadows
-   Bright saturated colors everywhere
-   Dense dashboards
-   Too many cards
-   Gamification-heavy UI
-   Clutter
-   Unnecessary borders
-   Excessive icons
-   Overly rounded "toy-like" components

------------------------------------------------------------------------

# 3. Technology Stack — Tauri Desktop App

Build this as a **native-feeling Windows desktop application using Tauri v2**.
The frontend is responsible for the UI and user interactions. Tauri/Rust is
responsible for native desktop capabilities, secure API access, and local
persistence.

## Frontend

-   **React**
-   **TypeScript**
-   **Vite**
-   **Tailwind CSS**
-   **Zustand** for client/application state
-   **React Router or the simplest appropriate routing solution** if multiple
    application views require routing

Do not use Next.js. This is a Tauri desktop application, so a Vite-based
React frontend is preferred.

## Desktop runtime

-   **Tauri v2**
-   **Rust** for Tauri commands and native functionality

Use Tauri commands as the controlled bridge between the React frontend and
native functionality. Do not expose unnecessary native capabilities to the
frontend.

## Local database

Use **SQLite** as the primary local database.

Prefer a Tauri-compatible SQLite solution that keeps database access in the
Rust/native layer. The frontend should communicate with persistence through
well-defined Tauri commands rather than directly managing the SQLite file.

The database should be stored in the application's Tauri app-data directory.

## Rust/native layer

The Rust layer should own operations such as:

-   Opening and initializing SQLite
-   Running migrations
-   CRUD operations where native access is appropriate
-   Secure OpenRouter requests
-   Reading/writing application configuration
-   Desktop notifications when implemented
-   Other OS-specific functionality

Use appropriate Rust crates such as `serde`/`serde_json` for structured data
and `reqwest` for HTTP requests when needed. Keep the Rust dependency set
small.

## AI

-   **OpenRouter API**
-   Structured JSON responses / structured operations
-   Configurable model

OpenRouter requests should preferably be made from the Rust/Tauri layer so
the OpenRouter API key is not bundled into the React frontend.

Use a local configuration mechanism for the user's API key. Never hard-code
the key into source code or commit it to the repository.

## Persistence architecture

Use:

```text
React UI
   ↓
Zustand / application state
   ↓
Tauri commands
   ↓
Rust domain/data layer
   ↓
SQLite
```

For AI:

```text
React AI input
   ↓
Tauri command
   ↓
Rust OpenRouter client
   ↓
OpenRouter
   ↓
Validated structured operations
   ↓
Scheduler
```

## Offline-first behavior

The application must work without an internet connection for:

-   Tasks
-   Habits
-   Routines
-   Goals
-   Schedule
-   Completion
-   Rescheduling
-   History

Only features that genuinely require network access should fail when offline,
primarily OpenRouter AI functionality.

## Avoid unnecessary infrastructure

Do not introduce:

-   Next.js
-   Express
-   Separate backend servers
-   Firebase
-   Supabase
-   Postgres
-   Redis
-   Authentication
-   Cloud synchronization
-   Microservices

for the initial version.

The first version should be a self-contained Tauri desktop application with a
local SQLite database. Cloud sync can be considered later if the product
proves useful.

------------------------------------------------------------------------

# 4. Tauri Architecture

Keep the application split into three clear layers:

```text
┌─────────────────────────────────────────┐
│              React / UI                 │
│                                         │
│ Dashboard · Tasks · Habits · Schedule   │
└───────────────────┬─────────────────────┘
                    │
              Tauri Commands
                    │
┌───────────────────▼─────────────────────┐
│              Rust / Tauri               │
│                                         │
│ Data access · AI client · Notifications │
│ Native APIs · Validation                │
└───────────────────┬─────────────────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
       SQLite            OpenRouter

```

The application/domain layer should remain independent from React UI code
where practical.

Use a clean separation between:

```text
UI
↓
Application State
↓
Domain Logic
↓
Scheduler
↓
Persistence
```

The AI layer should sit beside the domain/application layer:

``` text
User
 ↓
AI Assistant
 ↓
Structured Intent / Operations
 ↓
Validation
 ↓
Domain State
 ↓
Scheduler
 ↓
Today's Plan
```

The scheduler must NOT depend on OpenRouter.

The application should continue working if the OpenRouter API is
unavailable.

------------------------------------------------------------------------

# 5. Core Concepts

Do not treat everything as a simple task.

There are four major types of things.

## Tasks

One-off work.

Examples:

-   Fix login bug
-   Apply for a job
-   Finish client API
-   Buy groceries

Task properties should include at minimum:

``` text
id
title
description
duration
priority
status
deadline
scheduledDate
scheduledStart
scheduledEnd
category
projectId
energyLevel
flexibility
createdAt
updatedAt
```

------------------------------------------------------------------------

## Habits

Recurring activities.

Examples:

-   Exercise
-   DSA
-   Reading
-   Drink water
-   Walk

A habit should support:

``` text
frequency
preferred time
duration
target
active/inactive
```

Examples:

``` text
DSA
45 minutes
Monday-Friday
preferred: morning

Exercise
60 minutes
5 times/week
preferred: evening
```

------------------------------------------------------------------------

## Routines

A routine is a group of related actions.

Example:

### Morning Routine

``` text
Wake up
Drink water
Brush
Shower
Breakfast
Review today's plan
```

### Night Routine

``` text
Stop work
Review day
Prepare tomorrow
Brush
Wind down
Sleep
```

The scheduler can treat the routine as a block while still allowing
individual completion.

------------------------------------------------------------------------

## Commitments

Things that must happen at a specific time.

Examples:

-   Meeting
-   Appointment
-   Client call
-   Event

These have higher scheduling constraints than normal tasks.

------------------------------------------------------------------------

# 6. Priority Model

Use a simple priority system:

### Critical

Must happen today.

### Important

Should happen today.

### Flexible

Can move to another time/day.

### Optional

Only do it if there is available capacity.

The scheduler should prefer moving flexible/optional work before
critical commitments.

------------------------------------------------------------------------

# 7. Scheduler

The scheduler is the most important part of the application.

It should calculate a realistic day from:

1.  Fixed commitments
2.  Working hours
3.  Sleep schedule
4.  User availability
5.  Deadlines
6.  Critical tasks
7.  Important tasks
8.  Habits
9.  Routines
10. Flexible tasks
11. Optional tasks
12. Preferred working times
13. Existing scheduled items
14. Estimated duration
15. User's preferred break patterns

The scheduler should NOT assume that everything can fit.

If the day is overloaded, explicitly tell the user.

Example:

> Your day is overloaded by 1h 20m.

Then provide suggestions:

``` text
Move Portfolio work → Tomorrow
Shorten Exercise → 30 min
Skip optional Reading
```

The user should be able to accept or reject suggestions.

------------------------------------------------------------------------

# 8. Rescheduling

Rescheduling must be a first-class feature.

If the user doesn't complete:

``` text
2:00 PM — DSA
```

they should be able to select:

-   Move later today
-   Move to tomorrow
-   Move this week
-   Skip today

The scheduler should automatically recalculate the rest of the day.

Example:

``` text
Original:

14:00 DSA
15:00 Portfolio
16:00 Client work
17:00 Exercise

DSA skipped at 14:30

New:

14:30 Portfolio
15:30 Client work
16:30 DSA
17:30 Exercise
```

Do not simply append missed tasks to the end of the day.

------------------------------------------------------------------------

# 9. Main Dashboard

The dashboard is the most important screen.

Use the reference image as the visual foundation.

The layout should contain:

## Left Sidebar

Minimal navigation:

-   Today
-   Tasks
-   Habits
-   Routines
-   Goals
-   Schedule
-   History
-   Settings

The sidebar should remain visually quiet.

Do not make it dominate the screen.

------------------------------------------------------------------------

## Hero / Day Header

Large calm visual area.

Use the mountain/landscape visual direction from the reference.

Display:

``` text
Good Morning, Jay

"A focused day brings calmer results."

5
Monday
October 2026
```

The exact copy should be dynamic based on time/day.

Examples:

Morning:

> Good Morning, Jay

Afternoon:

> Good Afternoon, Jay

Evening:

> Good Evening, Jay

The date should always reflect the actual current date.

------------------------------------------------------------------------

# 10. Productivity Summary

Beside the hero section, show a concise summary.

Example:

``` text
13
Tasks Remaining

Focus time
4h 30m

6
Important Tasks

7
Regular Tasks

4
Completed
```

Keep this visually simple.

Do not turn the dashboard into an analytics page.

The purpose is to answer:

> "How much is left?"

------------------------------------------------------------------------

# 11. Today's Tasks

Create a prominent Today Tasks section.

Each task row should show:

``` text
[checkbox] Task title     category     time     status     more
```

Example:

``` text
✓ Morning workout     Health       7:00–8:00
○ Read through emails Work         8:00–9:00
✓ Lunch break         Personal     9:00–10:00
○ Clean project code  Learning     10:00–11:00
```

Use subtle category colors.

Do not use strong colored backgrounds for every row.

------------------------------------------------------------------------

# 12. Current Task / What's Next

The dashboard should clearly communicate the most important information:

> **What should I do right now?**

This should have stronger hierarchy than secondary statistics.

Example:

``` text
WHAT'S NEXT

Finish client API

2:30 PM – 4:00 PM

████████░░ 72%

1h 12m remaining

[ Start ] [ Complete ] [ Skip ]
```

If a task is currently active, make it visually obvious.

If there is nothing scheduled:

``` text
You're free right now.

You have 2 flexible tasks available.

[ Choose something ]
```

------------------------------------------------------------------------

# 13. Quick Actions

Keep quick actions simple.

Examples:

``` text
+ Add Task
+ Add Habit
+ Add Event
Ask AI
```

The most important action should be **Add Task**.

Do not create a grid of 10+ actions.

------------------------------------------------------------------------

# 14. AI Command Bar

Add a persistent, highly accessible AI input.

Placeholder:

> "Tell me what's changed..."

Examples:

``` text
I need to work on the client project for another 3 hours today.

I have a meeting at 4 PM.

Skip exercise today.

Move DSA to tomorrow.

What should I do right now?

Make today lighter.

I finished my client work early.
```

The user should not need to know special commands.

Natural language is the primary interface.

------------------------------------------------------------------------

# 15. OpenRouter Integration

Use OpenRouter as the AI gateway.

Do not hard-code a single model throughout the application.

Make the model configurable.

Store:

``` text
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

in an appropriate local configuration mechanism.

Never expose API keys in the frontend bundle if the chosen architecture
allows a secure local backend/Tauri command layer.

The AI request should include only the context required to interpret the
user's instruction.

------------------------------------------------------------------------

# 16. AI Structured Output

The AI should return structured JSON.

Conceptually:

``` json
{
  "message": "I've added the client feature and reshuffled your afternoon.",
  "operations": [
    {
      "type": "ADD_TASK",
      "title": "Client feature",
      "durationMinutes": 180,
      "priority": "critical",
      "deadline": "today"
    }
  ]
}
```

The application then:

1.  Parses the response.
2.  Validates it.
3.  Applies valid operations.
4.  Runs the scheduler.
5.  Shows the resulting schedule.
6.  Explains meaningful changes to the user.

Never blindly execute arbitrary text returned by the model.

------------------------------------------------------------------------

# 17. AI Context

When asking the AI to interpret a request, provide relevant structured
context such as:

``` text
Current date/time
Current day
Current schedule
Remaining tasks
Habits
Routines
Fixed commitments
User availability
Working hours
Sleep hours
Goals
Recently completed tasks
Recently skipped tasks
```

Do not send unnecessary historical data.

------------------------------------------------------------------------

# 18. Example AI Interaction

User:

> "I just got another client task. It will take around 3 hours and needs
> to be finished today."

AI should identify:

``` text
Task:
New client task

Duration:
180 minutes

Priority:
Critical

Deadline:
Today
```

Then the scheduler determines where it belongs.

If there isn't enough time:

``` text
Your day is currently 1h 15m overloaded.

I recommend:
• Move Portfolio to tomorrow
• Keep Client Work
• Keep Exercise
• Skip optional Reading
```

Then let the user decide.

------------------------------------------------------------------------

# 19. Goals

Goals should be higher-level than tasks.

Example:

``` text
Goal
Become stronger at DSA

Projects
DSA Learning

Tasks
Study arrays
Study binary search
Solve 10 problems
```

The application should eventually be able to break goals into recurring
work, but keep the first implementation simple.

------------------------------------------------------------------------

# 20. History

The user should be able to see previous days.

Show:

``` text
October 5

Planned: 8h 30m
Completed: 7h 45m
Moved: 45m
Skipped: 30m
```

Keep history calm and useful.

Avoid gamification.

The goal is to help the user understand their behavior and improve
future scheduling.

------------------------------------------------------------------------

# 21. Notifications

Later in development, support desktop notifications.

Examples:

> Your next task starts in 10 minutes.

> You have a client task scheduled now.

> You're running 25 minutes behind. Replan your day?

The user should be able to disable notifications.

------------------------------------------------------------------------

# 22. Design System

Follow the reference's visual language.

### Background

Very light blue/white.

Approximate starting palette:

``` text
Background: #EAF7FB
Surface: #FFFFFF
Primary dark teal: #16566A
Text: #17323B
Muted text: #72848A
Border: rgba(20, 70, 85, 0.08)
```

Use the actual design judgment rather than treating these as immutable
values.

### Category colors

Use subtle pastel colors:

``` text
Health
Work
Personal
Learning
```

Colors should be muted and low saturation.

### Typography

Use a refined serif font for:

-   Large numbers
-   Date
-   Main greeting
-   Major display headings

Use a clean sans-serif font for:

-   Task names
-   Navigation
-   Labels
-   Metadata
-   Buttons

Typography should create the calm premium feeling seen in the reference.

------------------------------------------------------------------------

# 23. Layout Principles

The application should prioritize visual hierarchy.

The eye should naturally follow:

``` text
Greeting / date
        ↓
What should I do now?
        ↓
Today's schedule
        ↓
Remaining tasks
        ↓
Secondary information
```

Do not make every card equally prominent.

The current action is more important than analytics.

------------------------------------------------------------------------

# 24. Interactions

Every important action should require minimal effort.

Examples:

-   Press Enter to add a task.
-   Quick checkbox completion.
-   Drag tasks to adjust schedule if useful.
-   Right-click or three-dot menu for secondary actions.
-   Keyboard shortcut for AI command bar.
-   Keyboard shortcut to add a task.
-   Quick "complete / skip / reschedule" actions.

Avoid requiring multiple dialogs for simple operations.

------------------------------------------------------------------------

# 25. Empty States

Do not leave empty screens blank.

Example:

No tasks:

> Your day is clear.

> Add something you want to accomplish.

No schedule:

> Nothing scheduled yet.

> I'll help you build your day.

No habits:

> Start with one habit.

> Small routines are easier to maintain.

------------------------------------------------------------------------

# 26. First-Run Experience

On first launch, don't show an empty dashboard.

Ask the user for basic information:

``` text
Wake-up time
Sleep time
Working hours
Preferred break duration
Current goals
Existing habits
```

Then generate a first daily plan.

The first-run experience should make the app feel useful immediately.

------------------------------------------------------------------------

# 27. Do Not Overbuild

This is an MVP.

Do NOT initially implement:

-   Social features
-   Friends
-   Leaderboards
-   Gamification
-   Teams
-   Cloud collaboration
-   Complex calendars
-   Subscription system
-   Authentication
-   Mobile application
-   Excessive analytics
-   Complex project management
-   AI autonomous agents

Focus on the core loop:

``` text
Capture
↓
Understand
↓
Schedule
↓
Execute
↓
Complete / Skip
↓
Recalculate
↓
Review
```

------------------------------------------------------------------------

# 28. Development Order

Build in this exact order.

## Phase 1 --- Foundation

-   Tauri + React + TypeScript
-   App shell
-   SQLite
-   State management
-   Design system

## Phase 2 --- Tasks

-   Create
-   Edit
-   Delete
-   Complete
-   Priority
-   Duration
-   Deadline
-   Categories

## Phase 3 --- Habits

-   Create recurring habits
-   Frequency
-   Duration
-   Preferred time
-   Completion

## Phase 4 --- Schedule

-   Daily timeline
-   Fixed commitments
-   Task scheduling
-   Basic scheduler
-   Current task

## Phase 5 --- Rescheduling

-   Skip
-   Move
-   Recalculate
-   Overload detection

## Phase 6 --- Dashboard

Implement the reference design and improve its UX around the scheduler.

## Phase 7 --- AI

-   OpenRouter
-   Natural language command bar
-   Structured operations
-   Validation
-   Replanning

## Phase 8 --- History

-   Daily summaries
-   Completion statistics
-   Missed/moved tasks
-   Habit consistency

## Phase 9 --- Notifications

-   Upcoming task
-   Current task
-   Running behind
-   Replanning suggestion

------------------------------------------------------------------------

# 29. Code Quality

Use:

-   TypeScript strict mode.
-   Small reusable components.
-   Domain logic separate from UI.
-   No business logic hidden inside visual components.
-   Clear types for tasks, habits, routines, schedules, and AI
    operations.
-   Centralized scheduler logic.
-   Validation at application boundaries.
-   Error handling for OpenRouter failures.
-   Loading states.
-   Empty states.
-   Offline-safe behavior.

Avoid premature abstraction.

Prefer understandable code over clever code.

------------------------------------------------------------------------

# 30. Definition of Done for MVP

The MVP is successful when a user can:

1.  Open the desktop application.
2.  See today's plan.
3.  Add a task naturally.
4.  Set duration and priority.
5.  Create recurring habits.
6.  See habits integrated into the schedule.
7.  See fixed commitments.
8.  Know what they should be doing right now.
9.  Complete a task.
10. Skip a task.
11. Move a task.
12. Have the rest of the day automatically recalculated.
13. Tell the AI about a new task/change using natural language.
14. Have OpenRouter interpret the request.
15. Have the scheduler safely apply the change.
16. See overload warnings when the day cannot fit everything.
17. Review how the day went.

------------------------------------------------------------------------

# 31. Most Important Product Rule

Do not build a beautiful dashboard that happens to contain tasks.

Build a **daily decision-making system** that happens to have a
beautiful dashboard.

The dashboard is the interface.

The scheduler is the product.

The AI is the conversational control layer.

The user's goal is simply:

> **Open the app → know what to do → do it → tell the app when reality
> changes → let it adapt.**

That should guide every product and engineering decision.
