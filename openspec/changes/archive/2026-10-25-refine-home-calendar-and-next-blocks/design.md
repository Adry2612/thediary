# Design

## Context

See `proposal.md` — Why. The constraints that shape the approach:

- The floating bar in `PracticeSession` is conditionally rendered from `!isPracticeRoute || !isTimerVisible`; it has no presence state, so it mounts and unmounts in one frame. The timer visibility comes from `useElementVisibility` (`IntersectionObserver`).
- `YearPracticeCalendar` uses `usePracticeDayTooltip`, which measures the day, positions a portal card, delays day switches with hover intent, closes on scroll/resize/Escape, and renders `PracticeDayTooltip`. The touch two-tap rule lives in `resolveDayActivation` and the armed-date ref.
- `PracticeDayTooltip` contains the reusable summary body: date, session count, total time, per-session time/BPM, block lines and notes.
- `PracticePlanTable` is used by `HomeView` → `TodaysRoutinePlan` to preview today's routine. Its detail cell shows `Detalle del bloque:`, `Parte del repertorio:`, `Material:` and joins all detail entries with commas.
- `PracticeSession` shows a single `nextPhasePanel` built from `phases[currentPhaseIndex + 1]`, with the block title, duration and joined details. It is rendered while `!isCompleted`.
- `I18nProvider` sets `document.documentElement.lang`, so CSS hyphenation follows the active language. `tests/i18n.test.mjs` enforces key parity between Spanish and English.
- The project tests pure modules with `node --test` and has no component test harness; UI changes are verified in the browser at 390 px and 1024 px.

## Goals / Non-Goals

**Goals:**

- Make the bar's appearance and disappearance feel intentional without delaying interaction or ignoring reduced motion.
- Keep the annual calendar's day cells fully selectable while the summary remains readable and interactive.
- Make the home plan table calm and robust with long content, without hiding information.
- Show the whole remaining session in the practice screen in a compact, scannable form.

**Non-Goals:**

- Changing the timer engine, block advancement, session saving or the completion dialog.
- Changing the weekly summary's floating card, the month heatmap (unused by the current dashboard), or the dashboard's other cards.
- Adding new dependencies, a rich text editor, manual JS truncation, or a new page.
- Making upcoming blocks clickable to skip ahead; the timeline is informational.

## Decisions

### D1 — A small presence hook drives the bar transition

Add `useAnimatedPresence(open, duration = 180)`:

- State: `isMounted` (keep the bar in the DOM while leaving) and `isVisible` (drive the transition classes).
- On open: mount immediately and set visible on the next animation frame.
- On close: set visible false immediately and unmount after `duration`.
- When `prefers-reduced-motion: reduce` matches, flip visible immediately and unmount without delay.
- Clean up the frame/timer on unmount and when `open` changes.

The bar keeps its fixed position but toggles `opacity` and a small `translate-y`; only compositor-friendly properties animate. While not visible it is `inert` and `pointer-events-none`, so a bar that is leaving cannot be activated. The fixed layout means no reflow and no page jump.

Alternatives rejected:

- **CSS enter/exit keyframes on mount/unmount.** An unmounted element cannot run an exit animation; keeping a duplicated bar around would drift.
- **Animate with `height`/`margin`.** It would reflow the page and fight the fixed positioning.

### D2 — The annual summary becomes an inline panel below the grid

Extract the body of `PracticeDayTooltip` into a presentational `PracticeDaySummary` with a lean day type (date, minutes, count, sessions). `PracticeDayTooltip` keeps its fixed wrapper for the weekly summary; `YearPracticeCalendar` renders the same body inside a stable summary panel below the grid.

- The annual calendar stops using `usePracticeDayTooltip`: no measuring, no portal, no hover-intent timers, no scroll/resize/Escape closing. The pointer or focus updates the panel immediately.
- The panel state lives in `YearPracticeCalendar`. It starts on the latest practised day (`getLatestPracticeDateKey`) or today when there is no history, and keeps the last consulted day when the pointer leaves.
- The panel is a labelled region with a stable id; the active day's `aria-describedby` points to it. Its session list scrolls internally with a max height so it does not push the rest of the dashboard excessively.
- The pointer can move straight from a day to the panel because the panel is outside the grid, so no hover-intent delay is needed.
- The touch path keeps `resolveDayActivation`: the first tap updates the panel, the second tap on the same day navigates. The outside-tap and armed-date rules are kept, but the outside-tap close action now only clears the armed date (the panel stays visible with the last day).
- The weekly summary keeps `usePracticeDayTooltip` and its floating card unchanged.

Why: the previous floating card was the only element covering the grid. Moving it below removes the overlap without giving up the summary or its session list, and reusing the body keeps both calendars consistent.

Alternatives rejected:

- **Keep the floating card and add a close button.** It still covers the cells while open, which is the reported problem.
- **Show the summary only after a click.** It adds a step to a read-only interaction and loses the immediate hover feedback the calendar already has.
- **Place the panel in a sidebar.** It would compress the year grid and change the dashboard's composition more than needed.

### D3 — The home plan drops long labels and hyphenates text

`PracticePlanTable`:

- Renders each detail entry on its own line, without `Detalle del bloque:`.
- Keeps `Parte:` for a linked part and `Material:` for resources, because those labels distinguish different kinds of content.
- Adds `hyphens-auto` and `break-words` to the table and its text cells (and the routine title in `TodaysRoutinePlan`), so long words break at the end of the line with a hyphen instead of overflowing. No text is truncated or replaced; the table stays inside the viewport.
- Keeps the existing empty state when a block has nothing to show.

Why CSS hyphenation: it preserves the whole text, works with the language already declared on `<html>`, and degrades to normal wrapping where `hyphens` is unsupported. Manual truncation would hide content and need per-width logic.

### D4 — The practice preview becomes a timeline of the remaining blocks

New presentational `UpcomingBlocks` component, rendered by `PracticeSession` instead of `nextPhasePanel`:

- Receives `phases`, `currentPhaseIndex` and `repertoireItems`; derives the blocks after the current one.
- Renders an ordered list styled as a vertical timeline: a dot and a compact card per block with the resolved block title, skill label, planned duration and detail entries. The first item carries a "Siguiente" marker; the rest follow in plan order.
- Shows an empty state when no blocks remain, and is not rendered once the practice is completed.
- Wraps long names and details with `break-words` / `hyphens-auto`; the timeline is compact enough for a normal 3–6 block session, so it does not need its own scroll container.

Why a separate component: the panel becomes a list with its own accessibility and layout rules, and extracting it keeps `PracticeSession` focused on timer and navigation.

Alternatives rejected:

- **Show only the next two blocks.** The user asked to see all remaining blocks; hiding the tail would repeat the current limitation.
- **Make each block clickable to skip.** Skipping is a timer action with completion and phase-change consequences; this change is informational and must not alter the flow.

### D5 — Copy lives in the translation dictionaries

New keys describe the upcoming-blocks heading, the next marker and the empty state, plus the short "Parte" label. The old single-next copy (`nextPhase`, `noNextPhase`) is removed once no component uses it. Key parity and the new labels are asserted in `tests/i18n.test.mjs`.

## Risks / Trade-offs

- **[The fixed summary makes the calendar card taller]** → It sits inside the card below the grid, its session list has a capped height with internal scroll, and the rest of the dashboard keeps its normal flow.
- **[The bar's exit animation could leave a clickable ghost]** → It is `inert` and `pointer-events-none` as soon as it starts leaving; the unmount delay is short.
- **[Reduced-motion users wait for an invisible delay]** → The hook checks the media query and removes the delay, not just the transition.
- **[Hyphenation is browser-dependent]** → `break-words` is the fallback; the text is never clipped, so worst case it wraps without a hyphen.
- **[Many remaining blocks make a long section]** → Rows are compact and the section lives in the normal page flow; typical sessions have few blocks, and no information is hidden.
- **[Removing the detail label loses context]** → The column header already says "Detalle del bloque", and `Parte:` / `Material:` remain for the values that need disambiguation.

## Migration Plan

Pure UI and interaction change: no storage migration, no API change, no new dependency. Deploy is a normal build; rollback is reverting the commit. Existing sessions, routines and active timers keep their shape; the bar and calendar only change how their data is presented.

## Open Questions

None.
