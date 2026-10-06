# Design System --- Daily Life OS

## 1. Design Direction

The application should feel **calm, focused, minimal, spacious, and
premium**.

It is a personal daily operating system, not a traditional productivity
dashboard. The visual design should reduce cognitive load and make the
user's next action immediately obvious.

### Principles

-   Calm over energetic
-   Spacious over dense
-   Clear hierarchy over decoration
-   Soft color over saturated color
-   Content over chrome
-   Action over analytics
-   No unnecessary borders
-   No excessive shadows
-   No visual clutter

The interface should feel comfortable to look at for several hours every
day.

------------------------------------------------------------------------

## 2. Core Color System

Use CSS variables/tokens for all colors. Do not scatter raw hex values
throughout components.

``` css
:root {
  --color-primary: #328F9B;
  --color-card: #FFFFFF;
  --color-background: #DEEFF6;
  --color-foreground: #05313A;

  /* Independent variable so the border can be changed globally. */
  --color-border: rgba(5, 49, 58, 0.10);

  --color-muted: rgba(5, 49, 58, 0.60);
  --color-subtle: rgba(5, 49, 58, 0.40);

  --color-primary-hover: #287C87;
  --color-primary-active: #216C76;
  --color-primary-soft: rgba(50, 143, 155, 0.12);

  --color-focus: rgba(50, 143, 155, 0.30);
}
```

  -------------------------------------------------------------------------
  Token                   Value                     Usage
  ----------------------- ------------------------- -----------------------
  Primary                 `#328F9B`                 Primary actions, active
                                                    states, key accents

  Card                    `#FFFFFF`                 Cards and primary
                                                    surfaces

  Background              `#DEEFF6`                 Application background

  Foreground              `#05313A`                 Main text, headings,
                                                    icons

  Border                  `rgba(5, 49, 58, 0.10)`   Inputs, dividers,
                                                    secondary controls
  -------------------------------------------------------------------------

### Surface rules

The application background is `#DEEFF6`.

All cards use `#FFFFFF`.

**Cards must have no visible borders.**

Cards should be separated from the background primarily through their
white surface, spacing, and hierarchy. A very subtle shadow may be used
only where useful, but do not turn cards into floating panels.

------------------------------------------------------------------------

## 3. Border System

Cards do not use borders.

Other UI elements may use:

``` css
--color-border: rgba(5, 49, 58, 0.10);
```

This represents approximately 10% of the foreground color.

Use borders sparingly for:

-   Inputs
-   Selects
-   Dropdowns
-   Dividers
-   Secondary controls

Do not use borders as decoration or around every task row.

Keep the border token independent so it can be changed globally.

------------------------------------------------------------------------

## 4. Primary Color

Primary:

``` text
#328F9B
```

Use it intentionally for:

-   Primary buttons
-   Active navigation
-   Current task indicator
-   Progress
-   Selected states
-   Focused controls
-   Important interactive elements
-   Small accents

Do not make the whole interface teal. The primary color should
communicate **interaction and focus**.

------------------------------------------------------------------------

## 5. Typography

Use two complementary typefaces.

### Display / Serif

Use a refined serif for:

-   Greeting
-   Large date
-   Large numbers
-   Major display headings
-   Hero content

Possible choices:

``` text
DM Serif Display
Cormorant Garamond
Lora
Playfair Display
```

Choose one.

### UI / Sans-serif

Use a clean modern sans-serif for:

-   Navigation
-   Task names
-   Buttons
-   Labels
-   Metadata
-   Forms

Possible choices:

``` text
Inter
Manrope
DM Sans
Geist
```

Choose one and use it consistently.

### Hierarchy

-   Display: 32--48px
-   Page heading: 24--32px
-   Section heading: 16--20px
-   Task title: 14--15px
-   Metadata: 12--13px
-   Supporting text: 12--14px

Avoid excessive font-weight changes.

------------------------------------------------------------------------

## 6. Spacing

Use a consistent 4px/8px-based system:

``` text
4
8
12
16
20
24
32
40
48
64
```

Use larger spacing between major sections.

The interface should breathe.

------------------------------------------------------------------------

## 7. Radius

Use soft but restrained corners:

``` css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

Recommended:

  Element   Radius
  --------- ----------
  Inputs    10--12px
  Buttons   10--12px
  Tags      6--8px
  Cards     16--20px
  Hero      18--20px

Avoid making everything pill-shaped.

------------------------------------------------------------------------

## 8. Shadows

Keep shadows extremely subtle.

``` css
--shadow-soft: 0 4px 20px rgba(5, 49, 58, 0.04);
```

Use shadows mainly for:

-   Dropdowns
-   Popovers
-   Menus
-   Modals
-   Floating controls

Cards should primarily rely on white surface + spacing.

------------------------------------------------------------------------

# 9. Tags / Categories

Tags should have semantic colors.

Each tag has:

1.  A base color.
2.  A background that is approximately 20% of that color.
3.  Base-color text.
4.  No heavy border.

Conceptually:

``` css
.tag {
  color: var(--tag-color);
  background: color-mix(in srgb, var(--tag-color) 20%, white);
}
```

If `color-mix()` is not appropriate for a particular implementation,
define explicit background variables.

**20% means a very light tint, not a saturated fill.**

### Health

``` css
--tag-health: #35A853;
--tag-health-bg: color-mix(in srgb, #35A853 20%, white);
```

Use for exercise, walking, sleep, and wellness.

### Work

``` css
--tag-work: #328F9B;
--tag-work-bg: color-mix(in srgb, #328F9B 20%, white);
```

Use for client work, meetings, freelance, and professional tasks.

### Personal

``` css
--tag-personal: #8B5CF6;
--tag-personal-bg: color-mix(in srgb, #8B5CF6 20%, white);
```

Use for errands, family, free time, and personal projects.

### Learning

``` css
--tag-learning: #D88A2D;
--tag-learning-bg: color-mix(in srgb, #D88A2D 20%, white);
```

Use for DSA, courses, reading, research, and learning projects.

### Important

``` css
--tag-important: #D94B5B;
--tag-important-bg: color-mix(in srgb, #D94B5B 20%, white);
```

Use sparingly for priority.

### Neutral

``` css
--tag-neutral: #6B7F84;
--tag-neutral-bg: color-mix(in srgb, #6B7F84 20%, white);
```

Use when no semantic category applies.

### Tag appearance

-   11--12px font
-   500 weight
-   3px 8px padding
-   6--8px radius
-   No strong border

Tags should never be louder than the task name.

------------------------------------------------------------------------

# 10. Buttons

### Primary

``` text
background: #328F9B
color: #FFFFFF
```

### Secondary

``` text
background: #FFFFFF
border: 1px solid var(--color-border)
color: #05313A
```

### Ghost

Transparent with no visible border until interaction.

Use for secondary/icon actions.

### States

Buttons need clear hover, active, and focus states.

Focus:

``` css
box-shadow: 0 0 0 3px var(--color-focus);
```

------------------------------------------------------------------------

# 11. Navigation

Keep the sidebar visually quiet.

Suggested navigation:

``` text
Today

Tasks
Habits
Routines
Goals
Schedule

History

Settings
```

The active item should use the primary color and a very light primary
background.

Do not create large colored navigation blocks.

------------------------------------------------------------------------

# 12. Dashboard

Use the attached reference image as the primary visual direction.

Recommended composition:

``` text
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sidebar   ┌───────────────────┐ ┌───────────────┐ │
│            │ Greeting / Date   │ │ Daily Summary │ │
│            │ Mountain visual   │ │ Focus time    │ │
│            └───────────────────┘ │ Task counts   │ │
│                                  └───────────────┘ │
│                                                     │
│            ┌─────────────────────────┐ ┌──────────┐ │
│            │ Today's Tasks           │ │ Quick    │ │
│            │                         │ │ Actions  │ │
│            └─────────────────────────┘ └──────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Do not reproduce the reference pixel-for-pixel. Improve the hierarchy
around the scheduler.

The most important information is:

> **What should I do right now?**

------------------------------------------------------------------------

# 13. Hero Card

Use the calm mountain/landscape direction from the reference.

Example:

``` text
Good Morning, Jay

"A focused day brings calmer results."

31
st
October, 2026

Mon   Tue   Wed   Thu   Fri   Sat   Sun
                    ●
```

Make the greeting/date dynamic.

The landscape should be subdued and peaceful.

Avoid strong contrast, bright colors, or excessive decorative effects.

------------------------------------------------------------------------

# 14. Current Task / What's Next

This is the strongest hierarchy on the dashboard.

Example:

``` text
WHAT'S NEXT

Finish client API

2:30 PM — 4:00 PM

1h 12m remaining

[ Complete ] [ Skip ]
```

Use the primary color to indicate the active state.

Do not use large warning colors unless they have actual semantic
meaning.

------------------------------------------------------------------------

# 15. Task List

Task rows should be compact and easy to scan.

``` text
[✓]  Morning workout    Health       7:00–8:00   ⋯
[ ]  Read emails        Work         8:00–9:00   ⋯
[✓]  Lunch break        Personal     1:00–1:30   ⋯
[ ]  Study DSA          Learning     2:00–3:00   ⋯
```

Use whitespace instead of borders to separate rows.

Completed tasks should have lower emphasis without becoming invisible.

------------------------------------------------------------------------

# 16. Cards

All cards:

``` css
background: #FFFFFF;
border: none;
```

Recommended:

``` css
border-radius: 18px;
padding: 20px;
```

Only use cards when they create meaningful grouping.

Do not put every metric into its own card.

------------------------------------------------------------------------

# 17. Metrics

Keep metrics understated.

Example:

``` text
13
Tasks remaining
```

Use the serif display font for large numbers.

Supporting labels should be small and muted.

Do not let analytics dominate the dashboard.

------------------------------------------------------------------------

# 18. Progress

Use the primary color.

Track:

``` css
background: rgba(50, 143, 155, 0.12);
```

Fill:

``` text
#328F9B
```

Example:

``` text
Focus time

████████░░  4h 30m
```

------------------------------------------------------------------------

# 19. Icons

Use one consistent icon family.

Icons should be:

-   Simple
-   Thin/medium weight
-   Small
-   Consistent

Do not use icons purely as decoration.

------------------------------------------------------------------------

# 20. AI Command Bar

The AI input should feel native to the product rather than like a
generic chatbot.

Example:

``` text
┌─────────────────────────────────────────────────────┐
│ ✦  Tell me what's changed...                     ↵ │
└─────────────────────────────────────────────────────┘
```

Use the primary color for the AI indicator.

The AI is a conversational control layer for the schedule.

------------------------------------------------------------------------

# 21. AI Response

Keep responses concise.

Example:

``` text
I've added your 3-hour client task.

Your afternoon is now overloaded by 45 minutes.

Suggested:
Move Portfolio → Tomorrow

[ Apply suggestion ]
[ Keep current plan ]
```

Never show raw JSON or technical AI output to the user.

------------------------------------------------------------------------

# 22. Animation

Animations should be subtle.

Use them for:

-   Task completion
-   Schedule changes
-   Opening panels
-   Progress updates
-   AI responses
-   Navigation transitions

Avoid constant motion, bouncing, or exaggerated transitions.

Suggested duration:

``` text
120–180ms
```

Larger transitions:

``` text
200–300ms
```

Respect `prefers-reduced-motion`.

------------------------------------------------------------------------

# 23. Accessibility

Maintain:

-   Sufficient contrast
-   Visible keyboard focus
-   Keyboard navigation
-   Semantic buttons
-   Accessible labels
-   Tooltips for unfamiliar icon-only controls
-   Comfortable click targets

Do not sacrifice accessibility for minimalism.

------------------------------------------------------------------------

# 24. Overall Visual Rule

When deciding between two designs, choose the one that makes the
application feel:

> **Quieter, clearer, and easier to understand.**

Within a few seconds of opening the app, the user should understand:

1.  What day is it?
2.  How much do I have left?
3.  What am I doing now?
4.  What comes next?

Everything else is secondary.
