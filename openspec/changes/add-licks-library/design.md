# Design

## Context

See `proposal.md` for motivation and `specs/licks-library/spec.md` and `specs/licks-analytics/spec.md` for the behavior contract.

The app persists all practice data as one JSON `state` row per user (`practice_data` in Supabase), mirrored in `localStorage` through a zustand store. Every read path normalizes that blob: hydration (`normalizePracticeStorageState`), cloud load (`normalizePracticeData`), cross-device merge, and snapshot writes. There is no separate table per entity, and the repertoire already stores items with `kind: "lick"` plus a structured `RepertoireTab` (`notes`, `measures`, `subdivision`, per-note performance techniques).

Charts in the project are hand-built with SVG and CSS (`PracticeTimeChart`, `SkillBalance`), with `aria-label`s and text values. There is no chart dependency and no React test setup; logic is tested with `node --test` against `.ts` modules.

## Goals / Non-Goals

**Goals:**

- Add licks as a first-class collection in the existing persisted state without a database migration.
- Migrate legacy repertoire licks deterministically and idempotently on every load path.
- Keep the analytics pure and testable, separate from the React views.
- Match existing UI, accessibility and i18n conventions, including hand-written charts.

**Non-Goals:**

- Adding a new table, a new storage backend, or a new chart dependency.
- Reworking the song tab editor or its per-note technique model.
- Resolving migrated licks' item-level practice time, or linking licks to practice phases.
- Cleaning the legacy `"lick"` member out of `RepertoireItemKind` in this change.

## Decisions

### 1. Licks are a new array inside the existing practice state

`PersistedPracticeState` gains `licks: GuitarLick[]`. It is added to the zustand store, `partialize`, `merge`, `getPersistedPracticeState`, `replacePracticeState`, `toPersistedSnapshot`, `normalizePracticeData`, `mergePracticeData`, `createEmptyPracticeData`, `hasPracticeData` and `hasPracticeStateChanged`.

Why not a separate Supabase table: the app syncs one state document, and a second store would need its own load/save/merge/realtime plumbing, plus an offline fallback. Keeping licks in the blob reuses merge-by-id and the existing deferred cloud save.

Why not keep licks in `repertoireItems` with better filtering: the proposal's premise is separation, and a separate array gives licks their own schema (`bpmHistory`, target, plain-text tab) without carrying repertoire-only fields such as parts, chords, tuning or resources.

### 2. Lick shape adapts the provided model to what the app can truthfully store

```ts
interface GuitarLick {
  id: string;
  title: string;
  tabContent: string;
  key?: MusicalKey;              // optional: quick ideas and migrated licks
  techniques: TechniqueId[];     // empty is valid
  associatedSongId?: string;     // repertoire item id, songs only
  targetBpm?: number;
  currentBpm?: number;           // mirrors the last history entry
  bpmHistory: BpmLogEntry[];
  createdAt: string;
  lastPracticedAt?: string;      // absent = never practised
  practiceCount: number;
}
```

- `key` is optional rather than required: the migration decision explicitly forbids guessing, and zero-friction capture should not force a classification. The spec shows keyless licks as unclassified and excludes them from named keys in analytics.
- `lastPracticedAt` is optional so "never practised" is representable; the supplied required string would force a fake date.
- `currentBpm` is read from the last history entry whenever history exists; it is stored only as a convenience mirror and is dropped when it has no backing entry. The history is the source of truth for the chart.
- `TechniqueId`, `MusicalKey` and `BpmLogEntry` follow the proposal's model. Notes are trimmed and empty notes omitted.
- Validation range is 40–240 BPM, matching the metronome (`MIN_BPM`/`MAX_BPM`) so a lick goal and the metronome cannot disagree.

### 3. Normalization is the only gate for stored licks

A pure `normalizeLick`/`normalizeLicks` pair follows the existing difficulty normalizer: invalid fields are discarded individually, the lick survives. Rules: require a non-empty string `id`; default title to an empty string; coerce tab to a string; keep only catalogue techniques, deduplicated; keep only catalogue keys; keep a positive integer practice count defaulting to 0; keep only valid ISO dates; keep only BPM entries inside 40–240 with string ids, sorted oldest-first; derive `currentBpm` from the last entry; keep `associatedSongId` only as a string (existence is resolved at render time, so deleting the song never deletes the lick).

Why not a versioned migration with a schema version: the existing storage has no version beyond zustand's, and per-field normalization already tolerates older blobs. Adding a version would need a coordinated change to both local and cloud paths for no behavioral gain.

### 4. Repertoire licks migrate inside normalization, with a pure converter

`migrateRepertoireLicks(state)` runs in `normalizePracticeStorageState` and `normalizePracticeData` (the latter before merge). For each repertoire item with `kind === "lick"` it produces a lick and removes the item:

- `id`, `title` preserved; `createdAt` from the item's `updatedAt` when it is a valid date, otherwise migration time.
- `tabContent` from the item's `tab` via a new `repertoireTabToText` converter; empty when the item has no tab.
- `key`, `techniques`, `targetBpm`, `bpmHistory` left empty/absent; `practiceCount` 0; `lastPracticedAt` absent.
- Items of kind `"song"` are untouched.

Why in normalization rather than a one-off hook: hydration, cloud load, guest import and realtime updates each produce a state blob, and a hook would have to run after each of them and race with the deferred save. Normalization is already the single choke point used by all of them. It is idempotent because the source item disappears; if the migration is interrupted, the next load migrates whatever is left, and an already-migrated item cannot be migrated twice. A conversion failure for one item leaves that item in the repertoire and does not abort the rest of the state.

The converter renders the structured tab as standard six-line text: one line per string from low to high, a tuning gutter, fret numbers in fixed-width columns separated by `-`, `x` for dead notes, a measure separator between measures, and technique glyphs appended to the note they belong to (`tabTechniqueGlyphs`/`getTabTechnique`). It is deliberately a readable snapshot, not a round-trippable format.

Consequence: historical session phases that pointed at a migrated lick keep their stored phase name, but the item is no longer in the repertoire, so its per-item practice time stops resolving. This is accepted; carrying it over would require a parallel history model not present in the app.

### 5. The catalogue is a single typed source with localized labels

`TECHNIQUE_IDS` is a `const` tuple in `src/types/lick.ts`, and `TECHNIQUES` in `src/lib/licks/techniques.ts` maps each id to an icon glyph and an i18n label key. `MUSICAL_KEYS` is a tuple in the same types module. A `Set`/`includes` check is the validation. The editor renders technique chips with `aria-pressed` and a native multi-selection; no free-text input exists. Both dictionaries get the ten labels and any shared copy; `tests/i18n.test.mjs` (which checks key parity) must keep passing.

### 6. BPM history is append-only and relative to the lick

Recording a BPM appends `{ id, bpm, date, notes }`, sets `currentBpm`, `lastPracticedAt = now` and increments `practiceCount` in one store action. "Mark practised" uses a separate action that touches only `lastPracticedAt` and `practiceCount`. The history is normalized sorted ascending, and the chart consumes it directly; no global or cross-lick aggregation exists.

Percentage of target = `round(current / target * 100)`, capped at 100; hidden when either value is missing.

### 7. Analytics are pure functions in `src/lib/licks/`

- `getLickProgress(lick)` → start BPM (first entry), current BPM (last entry), target, percentage.
- `getForgottenLick(licks, today)` → one lick or `null`, with the candidate rule and deterministic tie-break (most overdue first; otherwise lowest `practiceCount / max(daysSinceCreation, 1)`; then oldest `lastPracticedAt`, oldest `createdAt`, then `id`).
- `getTechniqueDistribution(licks)` and `getKeyDistribution(licks)` → ordered groups with counts and percentages over all licks, including an unclassified group when needed.
- `daysSince(date, today)` uses the existing local-date helpers so "today" is calendar-based, not 24-hour arithmetic.

These take plain arrays and a `Date`, so they are covered by node tests. The React components only select, format and draw.

### 8. UI: one list page with a dashboard, one detail page, no new route for the editor

- `/licks`: header, summary counts, forgotten-lick card, technique/key distributions, BPM chart with a lick selector (default: most recently practised, else first by title), and the lick cards. The card shows a monospaced tab preview, key, technique chips and target/current BPM.
- `/licks/[id]`: back link, full tab in a whitespace-preserving monospaced panel, metadata, BPM chart for that lick, record-BPM form (BPM + optional note), history list, mark-practised action, edit and delete.
- Creation and editing share `LickEditorModal`, opened from the list's "new lick" action and from the detail's edit action. This follows the proposal's `LickEditorModal` component while avoiding a third route.
- Deleting uses the existing `window.confirm` pattern with a localized confirmation, consistent with repertoire items.
- Navigation inserts "Licks" after "Repertoire", and the existing `startsWith` current-section check handles `/licks/[id]` without changes.
- A `loading.tsx` follows the other workspace sections.

Why hand-written SVG: consistent with all existing charts, no bundle dependency, and full control over the dashed target line and accessible text values. Recharts would add a dependency for one line chart and would not match the existing visual language.

### 9. Tablature display preserves characters; highlighting is character-neutral

The tab panel uses `whitespace-pre` and horizontal scrolling, never trimming or reflowing. The optional fret highlighter splits each line into text nodes and `<span>`s around digit runs; spaces are emitted as text nodes, so columns do not move. Highlighting is decorative (`aria-hidden` is not used on text); the raw text remains selectable and copyable.

Why not a rich syntax highlighter: techniques are not a fixed grammar in free text, and guessed coloring could mislabel a character. Digit emphasis gives the tablature a modern look without changing meaning.

### 10. Charts expose text values

The BPM line chart has `role="img"`, a `<title>` and a `<desc>`, plus a visually available summary (start, current, target, percentage) and a list/table of entries. The distributions pair each SVG with a legend list that already contains the name, count and percentage. This satisfies the accessibility requirement without adding a charting library.

## Risks / Trade-offs

- **The migration is lossy and effectively one-way** (structured notes become text; song practice-time attribution is lost) → preserve id and title, convert deterministically, and keep the source item in place if its conversion throws. Accept that the first cloud save replaces the legacy structure; mention it in the release note.
- **Very wide tabs inflate the JSON blob** (64 measures × 16 subdivisions) → the converter emits compact fixed-width text; the field stays a string, and existing limits on tab measures still bound the source. Monitor payload if this becomes a problem.
- **Legacy `"lick"` still exists in `RepertoireItemKind`** → new UI never produces it; normalization migrates any that appear. Removing the union member is a later cleanup once no stored data can contain it.
- **Concurrent edits on two devices** → the existing merge-by-id with local precedence applies unchanged; a lick is the conflict unit. This matches today's behavior for repertoire items.
- **Technique/key distribution double-counts multi-technique licks** by design, so shares can exceed 100% in total. The UI must label the percentages as share of licks per technique, not as parts of a single whole; the donut is used only for keys, where the groups are exclusive.
- **BPM target of 0 or negative input** → rejected by the shared 40–240 validation; no division by zero reaches the percentage.
- **“Forgotten” selection could feel arbitrary** → deterministic rules and visible reason text (days since practice or low frequency) make the proposal explainable.
- **Charts built by hand may drift from the app's design tokens** → reuse existing chart classes and muted/accent colors rather than introducing new palette values.

## Migration Plan

1. Ship the new types, normalization and migration function first; existing data loads and migrates on the next hydration, locally and in the cloud.
2. Ship the UI, navigation and analytics in the same release so migrated licks are reachable; there is no interval where licks exist but have no page.
3. Keep the repertoire's song creation path untouched; remove only the lick option and lick filters.
4. Rollback: the code can be reverted, but migrated cloud data has already lost its structured tab and its repertoire rows. Before rollout, take a database snapshot of `practice_data`; restoring it is the rollback path for a faulty conversion. Local guest data is likewise overwritten on next use.
5. Verify on a copy of real data: count licks before/after, ensure titles and tab text match, ensure no song is converted, and ensure the migration does not run twice.
