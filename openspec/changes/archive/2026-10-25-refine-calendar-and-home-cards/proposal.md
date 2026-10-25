# Proposal

## Why

The previous change replaced the annual calendar's floating day card with a fixed panel below the grid, but that is not the behaviour the user wanted: they preferred the original card next to the day. The card must come back without covering the other days' pointer targets. That same change also introduced three visible loose ends: the timer card no longer fills its column, so it is shorter than the metronome card; block details still show a redundant "Parte:" prefix when the block is a repertoire song; and the home screen's repertoire summary is a plain list that ignores the artwork, album and progress the library already stores.

## What Changes

- **The annual calendar's day card floats again and stops blocking days.** Hovering, focusing or tapping a day opens the card next to that day, as before, but the card lets pointer events pass through it. Any day underneath it can still be hovered, focused and clicked; the card updates to the day under the pointer. It shows a compact summary (date, session count, total time and up to three sessions, with a "+N" line when more remain) and closes when the pointer leaves the calendar, the page scrolls, the viewport is resized, Escape is pressed or the user taps outside. The weekly summary keeps its current interactive card unchanged.
- **The timer and metronome cards match again.** The timer card fills its grid column, so on wide viewports both cards have the same height; on narrow viewports they stack at full width. No content or control changes.
- **Block details drop the "Parte:" prefix.** When a block is linked to a repertoire song and a part, the home plan and the saved-practice detail show the part name on its own line, like the other detail entries. The "Material:" and "Lick:" labels stay.
- **The home repertoire section becomes a card grid.** Up to four recently updated songs appear as cards with their artwork (or the existing neutral placeholder), title, artist and album/year when known, and a learned-parts progress bar. Each card opens the song's detail; the loading and empty states stay, and long text wraps inside the card.

This change builds on `refine-home-calendar-and-next-blocks`, which introduced the annual summary panel and the short "Parte:" prefix. Archive order is therefore: `refine-practice-banner-and-calendar` first, then `refine-home-calendar-and-next-blocks`, then this change. This change supersedes the panel-below-the-grid decision and the "Parte:" prefix; it does not change the floating practice bar, the remaining-blocks timeline or the weekly summary card.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-dashboard`: replaces the annual calendar's fixed summary panel with a floating card that lets pointer events through, so no day loses its hover or click target.
- `practice-session-management`: removes the "Parte:" prefix from the home plan and saved-practice block details, and restores equal heights for the timer and metronome cards.
- `repertoire-library`: adds the home screen's recent-song cards with artwork, album/year and learned-parts progress.

## Impact

- **UI**: `YearPracticeCalendar.tsx` and `PracticeDayTooltip.tsx` (floating preview), `PracticeDaySummary.tsx` (compact variant), `usePracticeDayTooltip.ts` (preview mode), `PracticeSession.tsx` and `TimerCard.tsx` (equal-height column), `PracticePlanTable.tsx` and `PracticeSessionPhases.tsx` (part label), and `RecentRepertoire.tsx` plus `CoverArt.tsx` (home cards).
- **Copy**: `src/i18n/es.ts` and `src/i18n/en.ts` lose the unused `partShort` key and gain the home cards' "no parts yet" copy; `tests/i18n.test.mjs` is updated for parity.
- **Tests**: pure tests are unaffected except the translation checks; the interaction and layout changes are verified in the browser at 390 px, 1024 px and a wide viewport, with pointer, keyboard and touch.
- **No change** to the timer engine, the session format, the store schema, the API, dependencies, storage keys or configuration.
