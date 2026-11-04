# Design

## Context

See `proposal.md` for motivation. The current state that shapes the approach:

- `SessionEditor` edits `EditableSessionBlock.actualMinutes` as a decimal number and renders it in `input[type=number]` with `step={0.5}`; `toEditableSession` rounds seconds to two decimal minutes, so `83 s` becomes `1.38` and the browser rejects values that do not match the step.
- `TimerCard` already derives `overtimeSeconds` and `blockFinished`, but keeps `Toast` as a floating bottom notice and shows the total as a tiny line under the large timer.
- `PracticeLaunchPlan` has `templateId` but no explicit flag for whether the target control is allowed; `TimerCard` always renders the target section.
- `buildCatalogFillUpdates` deliberately fills only empty metadata; the existing song lookup is reachable from the card's extra-config `<details>`.
- `LICK_TECHNIQUES` is the single source for lick techniques, but practice technique blocks copy its i18n labels into `phase.name`; theory blocks are free text; tuning labels are stored strings such as `E Standard (EADGBE)` with no shared formatter.
- The app already has per-device preference services (`practice-feedback-preference`) and a Settings section with `SelectField` and toggle buttons.

## Goals / Non-Goals

**Goals:**

- Make the practice edit and timer changes without changing the persisted `SessionRecord` or `PracticePhase` shapes.
- Keep every existing saved practice, routine, lick and song readable; no migration or version bump.
- Centralize technique, theory and tuning names behind pure, testable catalog modules.
- Apply display preferences immediately in the same tab and keep them per device.

**Non-Goals:**

- Syncing display preferences through Supabase or the cloud-sync providers.
- Storing a technique or theory identifier on practice phases; names remain the stored value.
- Importing lyrics, tabs, audio or album tracks from the catalog.
- Detecting arbitrary custom tunings by ear or normalizing enharmonic spellings beyond the catalog aliases.

## Decisions

### 1. Clock inputs share one parser and one formatter

Extract the time logic currently in `src/utils/licks/reference-video.ts` into `src/utils/clock-time.ts`:

- `parseClockInput(value)` accepts `83`, `1:23` and `1:02:03`, rejects negatives, decimals, seconds or minutes of 60+, more than three parts, and values of 24 hours or more.
- `formatClockInput(seconds)` returns `m:ss` below one hour and `h:mm:ss` from one hour.
- `formatOvertimeInput(seconds)` returns `+m:ss` or `+h:mm:ss`.

`reference-video.ts` re-exports or delegates to it, so the lick clip and the practice editor cannot drift. The parser is also the input validator for the practice edit.

Alternatives considered:

- Change `step` to `0.01` and keep decimal minutes: rejected because the user still sees decimals and the value loses precision.
- Separate minutes and seconds fields: rejected because it doubles the controls and is worse on mobile.
- Store the display string in the draft: rejected because it mixes parsing with the model and makes totals harder to derive.

### 2. The editable practice draft stores seconds, not decimal minutes

`EditableSessionBlock` changes from `actualMinutes` to `actualSeconds`, and `EditableSession` from `durationMinutes` to `durationSeconds`. `toEditableSession` copies `phase.elapsedSeconds` directly; `applySessionEdit` writes it back without rounding. The session editor keeps a string draft per time field for typing, parses it on blur and on submit, and shows an inline error when it cannot parse.

The form uses `noValidate` and text inputs with `inputMode="numeric"`, so the browser never blocks the save with a `step` mismatch. A value that is empty is treated as zero for a block and is invalid only for a session without blocks, matching the current rules.

This is a draft-model change only: `SessionRecord` and `SessionPhaseRecord` already store seconds, so no migration is needed.

### 3. The timer notice is inline; the overtime is the large timer

`TimerCard` gains a small inline `TimerNotice` at the top of the card, below the skill pill. It replaces the floating `Toast` for both target reached and block finished. The notice uses `role="status"` and auto-dismisses after the same window as the current toast, while the next-block action and the green overtime remain visible.

- Block finished, option on: the large timer renders `formatOvertimeInput(overtimeSeconds)` in `text-accent-green-fg` and the notice says “Bloque terminado” with the block name.
- Block finished, option off: the large timer stays at zero and the same inline notice appears.
- Target reached: the notice says “Tiempo cumplido” and the large timer keeps its normal value; the timer pauses as it does today.

The session total becomes a dedicated row under the large timer, using `formatClockInput(elapsedSeconds)` and the existing `totalTime` label. In count-up mode the large timer is already the total, so the row is omitted there to avoid duplication. This removes the negative-margin layout used today.

### 4. The target control is gated by a launch flag

`PracticeLaunchPlan` and `ActivePracticeSession` gain `allowsTarget?: boolean`.

- `createQuickPracticePlan` and `createQuickRepertoirePlan` set `true`.
- `createTemplatePlan`, plans built in the routine editor, and `createPracticePlanFromSession` set `false`.
- `PracticeSession` passes `canSetTarget={session.allowsTarget ?? !session.templateId}` to `TimerCard`; the fallback keeps old quick sessions working and hides the control from old routine sessions.
- `readStoredSession` drops `targetMinutes` when the stored session is a routine and has no explicit `allowsTarget`, so a hidden target cannot surprise the user.

`TimerCard` only renders the target section when `canSetTarget` is true. The target still pauses the timer and shows its notice; only the control is hidden.

Alternatives considered:

- Derive the flag from `templateId` alone: rejected because a plan built in the routine editor has no `templateId` yet is a routine.
- Keep the control everywhere and disable it in routines: rejected because a disabled control adds noise and the user asked for it not to appear.

### 5. The catalog preview applies the full candidate only after confirmation

`repertoire-catalog.ts` gains `buildCatalogApplyUpdates(item, candidate, updatedAt)`. It returns:

- `title` and `artist` from the candidate (always present by type).
- `album`, `releaseYear` and `coverUrl` only when the candidate provides a valid value, using `normalizeCatalogMetadata`; a missing optional value keeps the song's current value instead of clearing it.
- `catalogSource`, `catalogId` and `updatedAt`.

A new `CatalogPreviewDialog` lists the current and new values for title, artist, album, release year and artwork, with the changed rows highlighted, and calls `onConfirm(updates)` only when the user confirms. `RepertoireItemCard` stores the pending candidate after the search dialog closes and opens the preview; cancelling leaves the song untouched. The “Buscar datos” button moves out of the extra-config `<details>` into the main edit area next to the title/artist fields.

Alternatives considered:

- Apply immediately and rely on the manual edit form to undo: rejected because overwriting title, artist or artwork is destructive.
- Per-field checkboxes: possible, but the user asked for a preview of the full ficha; a single confirm keeps the flow short. The manual form remains available for partial edits.

### 6. Technique and theory names live in pure catalog modules

Create `src/utils/catalogs/techniques.ts` and `src/utils/catalogs/theory.ts`:

```ts
export interface CatalogName {
  id: string;
  es: string;
  en: string;
}

export const TECHNIQUE_CATALOG: readonly (CatalogName & { glyph: string })[];
export const THEORY_CATALOG: readonly CatalogName[];
```

- `TECHNIQUE_CATALOG` replaces the label mapping in `LICK_TECHNIQUES`; the ids stay the existing `TechniqueId` values and the Spanish/English names move out of the i18n `licks.technique*` keys.
- `THEORY_CATALOG` is a starter list of common topics: notes and intervals, major scale, minor scale, pentatonic scales, modes, triads, seventh chords, chord progressions, harmony and functions, circle of fifths, rhythm and meter, ear training, music reading, CAGED system and arpeggios.
- Both modules export `resolveTechniqueName(value, language)` / `resolveTheoryName(value, language)`: they normalize case and accents, match the id, `es` or `en`, and return the catalog entry or `null`. `formatCatalogName(entry, language)` returns the preferred name.
- A stored name outside the catalog is returned as stored; no custom name is lost.

Practice phases keep `name` as their stored value. New catalog selections store the original English name as the canonical value; legacy Spanish names still resolve. `getPracticeBlockTitle` resolves technique and theory names through the preference, so a block saved as “Púa alterna” displays as “Alternate picking” when the user chooses original names. Analytics canonicalize technique and theory keys through the same resolver before grouping, so both languages count as one technique.

`PracticePhaseEditor` uses a new `TheoryPickerDialog` (the same `SearchPickerDialog` pattern as techniques) for theory blocks. The picker lists catalog topics plus the current custom name and searches both names. The technique picker uses the same both-language search.

Alternatives considered:

- Add `techniqueId`/`theoryId` to `PracticePhase`: cleaner in theory, but changes the persisted shape and needs normalization/migration for every saved routine and session. The closed catalog and the name resolver give the display behavior without a model change.
- Keep names only in i18n: rejected because practice blocks and analytics need a language-independent name and the original name must be available in Spanish.

### 7. Tuning names and notes come from one catalog

Create `src/utils/catalogs/tunings.ts`:

```ts
export interface TuningEntry {
  id: string;
  es: string;
  en: string;
  notes: string;      // "DADGBE"
  stored: string;     // "Drop D (DADGBE)"
}
```

`COMMON_TUNINGS` in `repertoire-item.ts` is derived from the catalog's `stored` values plus the “Otra...” option. `formatTuning(value, { display, locale })` matches the stored value, the notes or an alias; a known tuning returns its localized name or its `notes`, and an unknown value returns the stored text. `formatTuningPreset(id, ...)` maps the tuner preset ids to the same catalog entries for the preset labels.

The repertoire form and card use the formatter only for the option labels; the stored value is unchanged. The song form's tuning note and the tuner labels use the same formatter. The tab score already stores notes, so it matches by notes.

Alternatives considered:

- Store a tuning id and migrate old songs: rejected because the current strings already carry both the name and the notes and a migration adds risk for no user-visible gain.
- Keep separate labels for the form, card and tuner: rejected because the user asked for one setting and the labels would drift.

### 8. Display preferences use a device service and a same-tab event

`src/services/display-preferences.ts` stores:

```ts
interface DisplayPreferences {
  techniqueNameLanguage?: "es" | "original";
  tuningDisplay: "name" | "notes";
}
```

The service normalizes unknown values, reads/writes `localStorage` under `thediary.display-preferences`, and defaults to `{ tuningDisplay: "name" }`; an absent technique language follows the interface language (`es` → Spanish, `en` → original).

`useDisplayPreferences()` reads the service on mount, listens to `storage` and to a custom `thediary:display-preferences` event dispatched on save, and exposes both setters plus the resolved technique language. The Settings section uses it with two `SelectField`s or segmented controls; every component that renders a technique or tuning label calls the same hook. The custom event is what makes a change in Settings update the rest of the page without a reload.

Alternatives considered:

- Put the preferences in `usePracticeStore`: rejected because they are presentation settings, not practice data, and should not sync with the user's practice history.
- A React context provider: cleaner for many consumers, but the hook plus the custom event is smaller and matches the existing preference services. If the number of consumers grows, the hook can be backed by a provider without changing the service.

## Risks / Trade-offs

- **[Name-based catalog matching]** A legacy custom name that exactly matches a catalog name in either language is treated as that catalog entry. → Accepted: the catalog is closed and the user can still type a different custom name; no data is rewritten.
- **[Changing the canonical stored technique name]** New practice blocks store the original English name, so exports and old backups mix languages. → The resolver handles both and analytics canonicalize; the display preference is the user-facing contract.
- **[Removing i18n technique keys]** The `licks.technique*` keys and their dictionary types are removed. → Update every consumer and the i18n tests in the same change; keep the keys in the catalog, not in two places.
- **[Inline notice on small screens]** The notice sits above the large timer and can push the card down. → Use a compact, non-absolute block with a short message and test at 375 px; the card already scrolls.
- **[Hidden target in legacy routines]** A running routine from before this change could have a target. → Drop it when the stored session is a routine, and never set it for new routine launches.
- **[Clock parser rejects hours]** A practice longer than 24 hours is rejected. → This is far beyond a realistic practice; the same limit already applies to the lick clip parser.
- **[Per-device preferences]** Two devices can show different technique/tuning labels. → Documented as a device preference; the underlying stored values are unchanged, so nothing is inconsistent in the data.

## Migration Plan

No data migration and no version bump:

- `SessionRecord` keeps seconds; only the editor draft changes.
- `PracticePhase.name` remains the stored value; the catalog resolver handles old Spanish names.
- Song tunings keep their stored strings; the formatter is read-only.
- The new preferences start from the documented defaults when the key is absent.
- Rollback is safe: removing the preference key restores defaults; old clients ignore it.

## Open Questions

None.
