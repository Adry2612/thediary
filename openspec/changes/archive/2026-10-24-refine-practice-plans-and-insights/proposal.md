# Proposal

## Why

Three unrelated frictions remain around practice tracking. The guitar type is chosen on the timer, in the middle of a running practice, while the plan and its saved template do not remember it. On the dashboard, "Ritmo de práctica" and "Cuándo practicas" are two related but different views — volume over time versus weekly and time-of-day patterns — yet their titles do not make the distinction clear and the two cards have different sizes. The repertoire already stores each song's artist and counts the time practised on linked blocks, but never groups that time by artist, so the user cannot see who they practise most.

## What Changes

- Choose the guitar type while preparing a plan, and keep it in the saved template; starting a template or a plan carries the type into the session, and repeat/launch paths preserve it. The control disappears from the running timer. Editing a saved practice and registering a manual practice keep their existing guitar-type fields as the place to correct it. The plan header shows the chosen type as context.
- Keep the monthly repertoire summary and the dashboard's other cards unchanged, but pair "Ritmo de práctica" and "Cuándo practicas" in the same row so both cards share width and height. Clarify their copy: one is the evolution of practised time by period, the other is the weekly and time-band pattern across the full history.
- Add a "Most practiced artists" ranking to the repertoire, derived from the time of completed phases linked to repertoire songs. It groups by artist name, sorts by practised time, shows the top five with their time and song count, and needs no new storage or manual favourite flag.
- No new dependencies, no database migration, no new persistence schema beyond the optional guitar type already allowed on sessions.

## Capabilities

### New Capabilities

- `practice-dashboard`: refines the dashboard planned in the pending `improve-practice-dashboard` and `refine-practice-dashboard` changes. This delta adds the paired sizing of the two time cards and the copy that distinguishes volume from weekly/time-band patterns.

### Modified Capabilities

- `practice-session-management`: the guitar type becomes a plan/template choice and leaves the running timer, while editing a saved practice keeps it editable.
- `repertoire-library`: adds the artist ranking derived from the practice time already counted for repertoire songs.

## Impact

- `src/types/practice.ts`, `src/utils/practice-launch.ts`, `src/utils/practice-plan.ts`, and the active-session launch paths for the optional plan `guitarType`.
- `src/components/practice/PracticePlanBuilder.tsx`, `PracticeWorkspace.tsx`, `PracticeSession.tsx`, `TimerCard.tsx`, and `src/components/dashboard/SessionEditor.tsx` for the move and the read-only display.
- `src/components/dashboard/DashboardView.tsx` and the dashboard copy in `src/i18n/*` for the paired layout and clarified labels.
- `src/components/repertoire/RepertoireView.tsx`, a new artist-ranking component, `src/utils/repertoire-analytics.ts`, and `src/i18n/*` for the ranking.
- Tests for artist aggregation, plan/template guitar propagation, and i18n parity.
- Archive note: apply and archive this change **after** `improve-practice-dashboard` and `refine-practice-dashboard`, because all three touch the pending `practice-dashboard` capability and this delta assumes their base specification.
