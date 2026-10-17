# Proposal

## Why

An accessibility audit of the app (Lighthouse on the main screens, desktop) left three failures:

- The start and the dashboard score **96 and 93** because 57 places paint their secondary text with `text-zinc-500` (`#71717b`) and `text-zinc-600`, which reach only 3.67:1 and 2.42:1 against the surfaces they sit on, under the 4.5:1 that AA asks of small text. The app already has a muted tone (`#8a8884`) that passes.
- The app's own select fails "label in name": its accessible name is the name of the field while the text it shows is the selected value, so the visible text is not part of the name (5 nodes).
- The metronome puts a label on a bare `<span>`, which cannot carry one, so the label is invalid (4 nodes).

## What Changes

- Paint the secondary text of the start, the dashboard and the materials loader with the app's muted tone, which passes AA on every surface those screens use.
- Make the accessible name of the app's select include the value it is showing.
- Give the beat indicator of the metronome a role that accepts its label.

## Impact

- Affected specs: `app-accessibility` (new).
- Affected code: `src/components/ui/SelectField.tsx` and `src/components/practice/MetronomeCard.tsx`, plus the class names of `src/components/home/RecentRepertoire.tsx`, `src/components/dashboard/*` and `src/components/practice/PracticeMaterials.tsx`.
- Out of scope: the design tokens themselves (they stay as they are), the placeholder tone of the inputs and the disabled options of the select —the audit does not measure placeholders, and disabled controls are exempt from the contrast rule—, and the rest of the audit's findings, which are about performance (the Supabase client on every route, the unmemoized practice stats) and are left for their own change.
