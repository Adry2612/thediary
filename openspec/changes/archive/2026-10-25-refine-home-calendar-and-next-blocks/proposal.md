# Proposal

## Why

Four small but visible rough edges remain in the practice flow. The floating practice bar appears and disappears abruptly instead of feeling like part of the interface. On the dashboard, the annual calendar's hover card floats over the day grid, so it covers neighbouring days and makes them impossible to click. On the home screen, the today's-plan table repeats the long labels "Detalle del bloque" and "Parte del repertorio" in every row, and long titles or details overflow their cells instead of breaking cleanly. In the practice screen, the "Siguiente bloque" panel shows only one block, so the rest of the session is invisible while practising.

## What Changes

- **The floating bar animates in and out.** It fades in with a small upward movement when it appears and reverses when it disappears, without shifting the layout. It stops accepting clicks while leaving, and the animation is skipped when the user prefers reduced motion.
- **The annual calendar's day summary moves below the grid.** Hovering, focusing or tapping a day updates a fixed summary panel under the calendar instead of opening a card over the cells. The days stay selectable at all times, the last consulted day remains readable when the pointer leaves, and the panel can still scroll its session list. The weekly summary keeps its current floating card.
- **The home plan table loses the long labels.** Each block's details are listed on their own line, the repertoire part keeps a short "Parte:" prefix, and "Material:" stays. Long titles, details and labels wrap by breaking words with a hyphen when they do not fit, instead of overflowing the cell.
- **The practice screen previews every block that remains.** The single "Siguiente bloque" card becomes a compact timeline with all the blocks still ahead: name, skill, planned duration and detail entries. The immediate next block is marked as such, the list updates when the timer advances, and an empty state appears on the last block.

This change builds on `refine-practice-banner-and-calendar`: the bar and the touch two-tap calendar come from that change. Archiving it first keeps the main specs coherent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-session-management`: adds the bar's appear/disappear animation, the home plan preview's label and hyphenation rules, and the timeline of the blocks that remain while a practice is running.
- `practice-dashboard`: replaces the annual calendar's floating day summary with a fixed summary below the grid, so the summary never covers or blocks the days.

## Impact

- **UI**: `PracticeSession.tsx` (bar presence and upcoming blocks), a new presence hook, `YearPracticeCalendar.tsx` (inline summary), a shared day-summary body extracted from `PracticeDayTooltip.tsx`, `PracticePlanTable.tsx` (labels and wrapping), and a new upcoming-blocks component.
- **Copy**: `src/i18n/es.ts` and `src/i18n/en.ts` gain the upcoming-blocks labels and the short "Parte" label; unused next-block copy is removed.
- **Tests**: pure tests are unaffected except for the translation parity checks; the visual and interaction changes are verified manually at 390 px and 1024 px.
- **No change** to the timer engine, the saved session format, the store schema, the API, dependencies or configuration.
