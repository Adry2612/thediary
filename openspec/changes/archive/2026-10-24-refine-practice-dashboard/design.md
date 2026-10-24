# Design

## Context

See `proposal.md` — Why. The dashboard's current hover card is shared by the weekly summary and the annual calendar through `usePracticeDayTooltip`. The weekly cells are large, but the annual grid packs 365 cells of 20 px into seven rows, and the card overlaps that grid. The card is positioned by `getPracticeTooltipPosition`, which chooses the side with most space and clamps its height.

The skill balance currently swaps the donut's centre text on hover. The schedule card renders each row as a flex line with a fixed 2 rem label slot. The dashboard still renders `SuggestedPractice`, and `/practice` still turns `?minutes=` into a suggested split. `MetricCard` is a shared presentational card used by the dashboard metrics and the repertoire summary.

`improve-practice-dashboard` is complete but not archived, so `openspec/specs/practice-dashboard/spec.md` does not exist yet. This change's delta therefore declares the capability as new relative to `openspec/specs` and removes the obsolete skill-balance requirement; that removal only takes effect when the previous change is archived first.

## Goals / Non-Goals

**Goals:**

- Make the annual calendar card behave like the weekly one: stable day while the pointer travels to it, deliberate switching, immediate keyboard feedback.
- Keep the skill balance monthly total visible while a skill is inspected, with a summary card consistent with the other dashboard hover summaries.
- Give the schedule card a layout that cannot overlap labels and bars from 320 px up.
- Remove the quick-access planner end to end, without touching the regular practice plan.
- Recognise a streak of 7+ days with a restrained, accessible animated flame.

**Non-Goals:**

- Redesigning the annual calendar grid, changing its cell size or replacing it with a monthly view.
- Adding a charting or animation dependency.
- Changing streak calculation, persistence, cloud sync or the practice timer.
- Making the skill summary card interactive (no scrolling or links inside it).
- Reworking the existing weekly-summary hover behavior.

## Decisions

### Annual calendar: hover intent plus a grid-level leave boundary

The failure is not the card's position alone: every annual-calendar cell owns `onMouseEnter`, so travelling from a day to the card crosses cells and immediately replaces the open day. The card then repositions under the pointer and may close.

- Add a pending-switch timer to `usePracticeDayTooltip`. `showTooltip` stays immediate for the first open and for keyboard focus; a new `scheduleTooltip` commits a day switch only after `HOVER_INTENT_MS` (180 ms). It cancels the previous pending switch first.
- Cancelling: entering the card cancels both the hide timer and the pending switch, so the card never changes day while the pointer is on it. Hiding (leave timeout, scroll, resize, Escape) cancels the pending switch as well, so a stale day cannot reopen after the card closed.
- Move the hide boundary in the annual calendar from each cell to the grid wrapper (`onMouseLeave`), matching the fact that the annual grid is one dense surface. Moving between cells therefore no longer schedules a hide; leaving the grid to the card uses the existing 150 ms grace and the card-enter cancellation. Keyboard blur still hides immediately.
- Keep the weekly summary on `showTooltip`; its large cells and single row do not need the intent delay.
- Use 180 ms rather than a longer delay so intentional switching still feels responsive; 150 ms is already the grace used to cross the gap. The two timers are independent and both cancelled by `hideTooltip`.

Alternatives considered: placing the card outside the grid (no room at 1280 px, and travelling to it would still cross cells), making the card non-interactive (loses scrolling and reading notes), or pinning the last day until the pointer leaves the grid (breaks intentional switching and keyboard focus). Hover intent addresses the cause with the smallest surface change.

### Skill balance: short, non-interactive floating card

- Keep `activeSkill` state, but stop swapping the centre. The centre always renders `distribution.totalMinutes` and "este mes".
- Store the trigger element in state when an arc or legend row is hovered/focused. Render a portaled `role="tooltip"` card at a fixed position computed from that element's bounds.
- Card content is three lines: skill name, formatted minutes, and `percentage% · N sesiones`. This is the same information the centre used to swap in, moved to a consistent surface.
- The card is `pointer-events-none` and `aria-hidden` is not set on the card; it is referenced with `aria-describedby` by the focused legend button. Because it cannot intercept the pointer, moving across legend rows keeps working and the card can safely overlap the chart.
- Positioning: a new pure helper, `getSkillSummaryPosition`, picks the side (right, left, below, above) with room for a 224 × 104 px card, centers it on the trigger on the chosen axis and clamps it to the viewport with a 12 px margin. It falls back to a clamped position when the viewport is smaller than the card. Fixed positioning is used because the card is portaled and the page can scroll.
- Closing: section `onPointerLeave`, legend `onBlur` when focus leaves, Escape, page scroll and resize. No per-row leave handler, so moving between rows never flickers.
- Keep the donut arcs hover-only; legend rows remain buttons and keep their existing accessible names, with `aria-describedby` pointing at the card while active.

Alternatives considered: a persistent panel below the chart (adds layout height and competes with the legend), keeping the centre swap (rejected by the user), and an interactive card (unnecessary for three lines and would fight the hover surface).

### Schedule: three-column grid with a reserved label slot

- Replace the flex row with a grid: `grid-template-columns: 5.25rem minmax(0, 1fr) 4.5rem` and a `0.75rem` gap. The label column fits "Madrugada" at the smallest text size; the value column is right-aligned and tabular; the bar takes the remaining width.
- Labels use `whitespace-nowrap` and `truncate` as a last-resort guard; the column is sized so real labels do not need truncation. Bar widths keep using `getBarPercentage`.
- The same row component serves weekdays and time bands, so both profit. At 320 px the card's inner width is about 240 px: 84 px label + 12 px gap + 60 px bar + 12 px gap + 72 px value, with the bar flexible if space changes.

Alternative considered: stacking labels above bars on mobile. It removes overlap but doubles the card height and weakens the comparison between rows; the grid is enough at 320 px.

### Remove the quick-access planner

- Delete `SuggestedPractice.tsx`, its import and its render block.
- Remove the five `home` keys used only by it (`directAccess`, `howMuchTime`, `suggestedDescription`, `availableTime`, `startSuggested`) from the dictionary and both locales. The i18n parity test keeps the remaining `home` keys aligned.
- Remove `SUGGESTED_DURATIONS`, `createSuggestedPhases`, the `minutes` search parameter and the ternary in the practice page. `phases` remains the default plan, so `/practice` is unchanged and `/practice?minutes=30` ignores the value.

### Streak flame: threshold helper, presentational highlight

- Add `STREAK_FIRE_MIN_DAYS = 7` and `isStreakOnFire(streak)` to `practice-analytics.ts` next to `getStreakCount`, and test 0/6/7/30.
- Compute the streak once in `DashboardView`, pass it to the metric value and use it for the highlight.
- Extend `MetricCard` with an optional `highlight?: ReactNode` rendered after the description. Only the streak card supplies it; the other five metrics and the repertoire summary are untouched.
- New `StreakFlame` component: a two-path SVG flame in the existing warm accent (`#c6ad77`), a small uppercase message ("La constancia se nota" / "Consistency is showing"), and `aria-hidden` on the SVG. The message is real text, not an alert, so it is read in document order and not announced on load.
- Add a `.streak-flame` animation in `globals.css` (subtle scale/rotate from the base) and include it in the existing `prefers-reduced-motion: reduce` block. No `animate-pulse` reuse because the flame needs a bottom origin and a warmer, slower motion.
- Keep the description "días seguidos con práctica" unchanged; the flame is an addition, not a replacement.

### Archive ordering

The delta removes `The skill balance summarizes each skill` from the pending `practice-dashboard` spec. Archiving this change while the base spec is absent is safe (OpenSpec ignores the removal with a warning), but archiving `improve-practice-dashboard` afterwards would reintroduce the obsolete centre-swap requirement. Apply and archive `improve-practice-dashboard` first, then this change. This is recorded in the proposal and in the tasks.

## Risks / Trade-offs

- **The intent delay can feel sluggish when deliberately moving between days** → 180 ms is below the usual 200–300 ms hover-intent range and applies only while another day is already open; keyboard focus and the first open are immediate.
- **Rapid pointer movement could still commit an intermediate day if the pointer dwells there** → any dwell long enough to read another day is a legitimate switch; entering the card cancels the pending switch before it commits.
- **Moving the hide boundary to the grid wrapper can leave the card open if the wrapper's leave is missed** → the existing window scroll, resize, Escape and card-leave handlers still close it; the wrapper covers the whole scrollable grid.
- **`pointer-events-none` makes the skill card unreadable for anyone who needs to select its text** → it contains only a short summary; the same numbers remain in the legend's accessible name and can be inspected with the keyboard.
- **The skill card is clamped on very small viewports and may cover the chart** → it is non-interactive and ephemeral; the centre total and legend remain visible underneath after leaving.
- **Schedule labels could still truncate in a language with longer band names** → the column is 5.25 rem and labels are short nouns; a future longer label should widen the column rather than wrap, and the 320 px check is part of the tasks.
- **Removing the i18n keys can desynchronise Spanish and English** → both locales are edited in the same task and the existing parity test covers the whole dictionary.
- **Removing the quick-plan generator is externally visible for bookmarked URLs** → the proposal marks it as breaking; the default plan still loads and no data is affected.

## Migration Plan

No data migration. Deploy the UI and i18n changes together; `?minutes=` links degrade to the default plan. Rollback is a normal revert: the removed generator and card have no persisted state. Archive `improve-practice-dashboard` before this change, as noted above.

## Open Questions

None.
