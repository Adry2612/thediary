# Proposal

## Why

The dashboard's day summary is unusable on a real page: it is a non-interactive tooltip pinned to viewport coordinates, so it closes as soon as the pointer leaves the day square and stays frozen on screen while the page scrolls. The rest of the dashboard also stops short of what a guitarist needs: long sessions are reported in raw minutes, the skill balance shows only a percentage, guitar type is stored per song but never analyzed, and there is no view of what the user actually plays (songs, techniques, theory topics), when they practise, or whether their tempo is improving.

## What Changes

- Fix the day summary as an interactive hover card: it opens on the day, stays open while the pointer moves onto the card, closes when the pointer leaves both, and never remains frozen on screen after the page scrolls. Internal scrolling of the card must not close it. Keyboard focus and Escape keep working.
- Report long practice durations as hours and minutes in the time chart, instead of raw minutes.
- Add a hover summary to every section of the skill balance (donut arc and legend row): minutes, percentage and number of sessions for that skill in the month.
- Record the guitar type used in a practice session (electric or acoustic), allow choosing it at any launch point and editing it later, and add a semicircular electric/acoustic balance chart for the month. Time that cannot be classified is reported separately instead of being guessed.
- Add a "most practiced" card for the full history: top song, top technique and top theory topic, with their times and session counts. Technique and theory are grouped by block name.
- Add a practice schedule card: distribution of practice time by weekday and by time of day, over the full history.
- Add a tempo progress card that compares a rolling window (last 7 or last 30 days) with the immediately preceding window of the same length. To avoid comparing different material, it computes the change per practised content (song/part, technique, theory topic, lick), weights those changes by practice time, and reports the aggregate BPM and percentage change together with the number of contents compared and the main movers.
- Capture per-block average BPM when a practice is saved, so the tempo card compares like with like. Sessions saved before this change keep working; the card uses session average only where a session has a single block.
- Fix the skill analytics so `lick` time is included in the skill balance and in the most-practiced area, instead of being silently dropped.
- Recommend, but leave out of this change: goal-adherence trend (days and minutes against weekly goals), practice-type mix over time, repertoire progress versus practice time, longest streak and personal records, session length versus tempo, and a technique × tempo matrix.

Out of scope:

- Editing the day summary content beyond making it interactive; the user will decide its content in a later change.
- New charting dependencies: all charts stay hand-written SVG/CSS.
- Rewriting historical sessions or inventing guitar types, BPMs or topics that were never recorded.
- Per-block guitar type; the choice is per session in this change.
- A global dashboard period selector shared by every card; each card keeps the period that its data supports (month, rolling window, or full history) and says which one it shows.

## Capabilities

### New Capabilities

- `practice-dashboard`: the dashboard's reading and interaction contract — interactive day summary, duration formatting, skill-balance summaries, electric/acoustic balance, most-practiced content, practice schedule, tempo progress, and the empty/unknown-data states of those charts.

### Modified Capabilities

- `practice-session-management`: a practice session records the guitar type used, stores per-block average BPM, and both values are editable and preserved through manual entry, editing and legacy loads.

## Impact

- `src/types/practice.ts` (`SessionRecord.guitarType`, `SessionPhaseRecord.averageBpm`, `SkillDistribution` session counts).
- `src/utils/practice-session-record.ts` and `src/utils/metronome-bpm.ts` (split session BPM samples per block when saving), `src/utils/practice-session-editing.ts` and `src/utils/manual-practice.ts` (guitar type and BPM through edit/manual flows), `src/stores/normalizePracticeStorageState.ts` (validate legacy data).
- `src/utils/practice-analytics.ts` (shared skill catalogue, skill session counts, guitar balance, content rankings, schedule, tempo trend) and `src/utils/practice-tooltip.ts` (interactive hover geometry), with node tests under `tests/*.test.mjs`.
- `src/hooks/usePracticeDayTooltip.ts` (hover persistence, scroll/Escape dismissal) and `src/components/dashboard/PracticeDayTooltip.tsx` (interactive card), plus the calendar and weekly summary triggers.
- New dashboard components under `src/components/dashboard/` for guitar balance, most-practiced content, practice schedule and tempo progress; updates to `PracticeTimeChart`, `SkillBalance` and `DashboardView`.
- Practice launch and editing surfaces: `PracticeSession`, `TimerCard`/launch header, `PracticeCompletionDialog`, `SessionEditor`, `ManualPracticeEntry`, plus a small guitar-type preference hook.
- `src/i18n/es.ts`, `src/i18n/en.ts` and `src/i18n/dictionary.ts` for the new labels, with key parity preserved.
- No database migration: the new fields travel inside the existing per-user practice JSON state.
