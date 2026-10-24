# Design

## Context

See `proposal.md`. The current practice flow keeps the guitar type on the timer (`TimerCard`), seeds new sessions from the last-used preference (`useGuitarPreference`) and already lets the user change it in `SessionEditor` and `ManualPracticeEntry`. Plans (`PracticeLaunchPlan`) and saved routines (`PracticeTemplate`) have no guitar type, so the choice is made too late and is not remembered with the routine.

The dashboard renders `PracticeTimeChart` ("Ritmo de práctica") beside `SkillBalance`, and `PracticeSchedule` ("Cuándo practicas") full width below the tempo card. The two cards therefore differ in width, and their headings do not explain that one is volume over a period and the other is a weekly/time-band pattern over the full history.

The repertoire stores `artist` as an optional string on songs and already calculates practice time from completed phases linked by `repertoireItemId`. Licks have their own library; artists are not entities and do not need to become one for a ranking.

## Goals / Non-Goals

**Goals:**

- Make the guitar type part of the plan and its saved routine, carry it into the session, and remove the control from the running timer.
- Keep editing a saved practice and registering a manual practice as the correction points.
- Pair the two time cards so they share width and height, and make their copy distinguish volume from pattern.
- Show a derived ranking of the most practised artists in the repertoire.
- No new dependencies, no database migration, no manual favourite state.

**Non-Goals:**

- Turning artists into first-class entities, adding an artist page or a navigation entry.
- Changing how practice time is calculated, the dashboard's chart data, or the schedule's weekday/time-band scales.
- Moving the guitar type out of `SessionEditor` or `ManualPracticeEntry`.
- Changing the quick-practice flow or adding a timer control elsewhere.

## Decisions

### Guitar type belongs to the plan and its template

- Add `guitarType?: GuitarType` to `PracticeTemplate` and to `PracticeLaunchPlan`. `PracticeLaunchSession` inherits it. The field is optional, so existing templates, imports and cloud snapshots remain valid.
- `PracticePlanBuilder` gains a `guitarType` state and an "Eléctrica / Acústica / Sin especificar" select next to the session name. A new plan starts from the last-used preference; selecting an existing template uses the template's type and falls back to the last-used preference for older templates. A `touched` ref prevents the preference effect from overwriting a choice the user already made.
- Saving a template stores `guitarType` when one is selected and omits it for "Sin especificar". Starting a plan calls `rememberGuitarType` and passes the type through `onStart`, so the active session is created with it.
- `createTemplatePlan` and `createPracticePlanFromSession` copy the stored type into the launch plan. `PracticeWorkspace` keeps the type in `draftPlan` and passes it to `setActiveSession`. Repeating a saved practice therefore keeps its type, and auto-starting a routine from a URL keeps the template's type.
- Quick practice creates no plan type; the existing session fallback to the last-used guitar still applies. "Sin especificar" in a plan leaves the type unset and keeps that same fallback, so the user can record no type by clearing it in "Editar práctica". This preserves today's behaviour instead of introducing a second meaning for an empty value.
- `PracticeSession` stops passing `guitarType`/`onChangeGuitarType` to `TimerCard` and removes `changeGuitarType`. It keeps the last-used seeding effect for sessions without a plan type.
- `TimerCard` removes the selector and its props; the `GuitarType` import and the now-unused part of the timer markup go with it. The `ToggleGroup`/`ToggleChip` imports stay because the timer uses them for sound options.
- `PracticeWorkspace` shows the active session's type in the header as read-only context, next to the duration. The type is translated with the existing `practice.guitarElectric`/`guitarAcoustic` keys.
- `SessionEditor` and `ManualPracticeEntry` keep their existing fields. `applySessionEdit` already replaces the guitar type while preserving the rest of the session, so no editing logic changes.

Alternatives considered: keeping the timer control (rejected by the user); adding the type only to templates and not to the builder (the user could not choose it for a one-off plan); adding a new persisted `guitarType: null` distinction to block the last-used fallback (more state and migration for a case the editor already covers).

### Dashboard: pair the two time cards and explain the difference

- `DashboardView` changes the first analytics row to `grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2` with `PracticeTimeChart` and `PracticeSchedule`. Both cards stretch to the row height, so at wide viewports they share width and height; at narrow viewports they stack full-width.
- `SkillBalance` and `GuitarBalance` move to the next row as an equal two-column pair, preserving the skill card's current half-width. `TempoProgress` becomes a full-width row and `TopPracticeContent` stays full width.
- `PracticeSchedule` gets `flex h-full flex-col` so its surface fills the stretched row; its content stays top-aligned rather than being artificially distributed. The bar scales stay independent for weekdays and time bands, as the user confirmed the issue was card size, not bar scale.
- Copy changes:
  - `recordedTimeTitle` becomes "Evolución del tiempo" / "Time evolution" for the rhythm card's eyebrow.
  - The period descriptions already say "Tiempo por día/semana/mes"; they stay and keep following the selector.
  - The schedule card keeps its "Todo el historial" / "Full history" eyebrow and gains a subtitle, "Patrón semanal y por franja horaria" / "Weekly and time-of-day pattern", under the title. This mirrors the rhythm card's eyebrow/title/subtitle structure and states what the card adds.
- No chart, empty-state or schedule-aggregation logic changes.

Alternatives considered: merging both cards (rejected by the user); making both full width and stacked (equal width but doubles the vertical space and leaves the rhythm chart sparse); keeping the current rows and only changing copy (does not fix the size mismatch).

### Artist ranking: derived, read-only and local to the repertoire

- Add `getArtistPracticeStats(history, repertoireItems)` to `repertoire-analytics.ts`. It walks each session's phases with `elapsedSeconds > 0` and a `repertoireItemId`, resolves the item, and keeps only `kind === "song"` items with a non-empty `artist`.
- Group by `artist.trim().toLocaleLowerCase()`, sum seconds, and keep a set of practised song ids per group. The displayed name is the first non-empty spelling encountered for that key. Accents are not folded; only case and surrounding whitespace are normalised.
- Return groups sorted by seconds descending, then by displayed name with `localeCompare("es", { sensitivity: "base" })`. Exclude groups whose item no longer exists, phases without an item link, lick items and songs without an artist.
- Add `ArtistRanking.tsx` in the repertoire. It renders a card consistent with the forgotten widget: eyebrow, title, and up to five rows with the artist name, a proportional bar, the practised time and the number of practised songs. It hides itself when the list is empty.
- `RepertoireView` places the ranking next to `ForgottenRepertoireWidget` in an `xl:grid-cols-2` row when both exist, and full width when only one does. The ranking uses `formatPracticeDuration` for time and `repertoire.song`/`repertoire.songs` for the song count.
- No store, migration or manual favourite field. New completed sessions automatically change the ranking on the next render.

Alternatives considered: a dashboard card (rejected by the user in favour of the repertoire); a standalone artist library like licks (would require modelling artists, navigation and persistence); manual favourites (rejected by the user).

## Risks / Trade-offs

- **Stretching the schedule card to the rhythm card's height can leave empty space at the bottom** → both cards share a size as requested; the schedule content keeps its natural top alignment and the surface fills the row.
- **Moving the skill and guitar cards changes the reading order** → they remain adjacent and keep their headings; the pair is now "what" after the "when" pair.
- **A new plan defaults to the last-used guitar, which may be wrong for a specific song** → the value is visible and editable in the builder before starting, and the session can be corrected in "Editar práctica".
- **An older template has no type** → it starts normally; the builder and the session fall back to the last-used preference, matching current behaviour.
- **Artist names are free text** → case/whitespace variants merge, but spelling variants ("The Beatles" vs "Beatles") remain separate. A future artist entity could normalise them; this change deliberately avoids that model.
- **A deleted song keeps history but loses its artist** → its time cannot be attributed and drops out of the ranking; the same limitation already applies to the repertoire's per-item stats.
- **The dashboard delta depends on the pending dashboard changes** → archive `improve-practice-dashboard` and `refine-practice-dashboard` first, as noted in the proposal.

## Migration Plan

No data migration. The new fields are optional and flow through the existing local storage and cloud-sync merge by id. Existing templates and sessions without a guitar type keep working. Deploy the plan, timer, dashboard and repertoire changes together; rollback is a normal revert with no persisted schema change.

## Open Questions

None.
