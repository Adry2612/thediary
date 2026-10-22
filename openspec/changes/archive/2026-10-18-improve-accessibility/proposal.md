# Proposal

## Why

An accessibility audit of the app (Lighthouse on the main screens, desktop) left three failures:

- The start and the dashboard score **96 and 93** because 57 places paint their secondary text with `text-zinc-500` (`#71717b`) and `text-zinc-600`, which reach only 3.67:1 and 2.42:1 against the surfaces they sit on, under the 4.5:1 that AA asks of small text. The app already has a muted tone (`#8a8884`) that passes.
- The app's own select fails "label in name": its accessible name is the name of the field while the text it shows is the selected value, so the visible text is not part of the name (5 nodes).
- The metronome puts a label on a bare `<span>`, which cannot carry one, so the label is invalid (4 nodes).

Re-running the same audit once those three were fixed showed that the screens still do not reach 100, because the audit also reports three findings the first pass had not counted:

- The day cells of the year calendar of the dashboard are 16×16 px targets, under the 24×24 the target-size rule asks (291 nodes, the heaviest failure still standing, and the only one that costs score on a screen).
- The metronome screen goes from its level-1 title straight to the level-3 title of the card, skipping a level.
- The controls that name themselves programmatically do not include the text they show, so the visible text is not part of the name: the goal controls of the start announce "…: 60" while showing "60 min", and the day cells of the week announce "… 0 sesiones" while showing "0 ses.".

## What Changes

- Paint the secondary text of the start, the dashboard and the materials loader with the app's muted tone, which passes AA on every surface those screens use.
- Make the accessible name of the app's select include the value it is showing.
- Give the beat indicator of the metronome a role that accepts its label.
- Give each day of the year calendar a target of 24×24 px that keeps the 16 px square the calendar paints today.
- Title the metronome card with the heading level that follows the title of its screen.
- Compose the accessible name of the controls that name themselves programmatically —the goal controls and the day cells of the week— so that it contains the text they show.

## Impact

- Affected specs: `app-accessibility` (new).
- Affected code: `src/components/ui/SelectField.tsx`, `src/components/ui/AdjustableNumber.tsx`, `src/components/practice/MetronomeCard.tsx`, `src/components/dashboard/WeeklyPracticeSummary.tsx` and `src/components/dashboard/YearPracticeCalendar.tsx`, plus the class names of `src/components/home/RecentRepertoire.tsx`, `src/components/dashboard/*` and `src/components/practice/PracticeMaterials.tsx`.
- `src/components/dashboard/PracticeHeatmap.tsx` repeats the 16 px day cell of the year calendar but nothing imports it; it is left untouched.
- Out of scope: the design tokens themselves (they stay as they are), the placeholder tone of the inputs and the disabled options of the select —the audit does not measure placeholders, and disabled controls are exempt from the contrast rule—, and the rest of the audit's findings, which are about performance (the Supabase client on every route, the unmemoized practice stats) and are left for their own change.
