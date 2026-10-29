# Design

## Context

See `proposal.md` for the motivation. The state that shapes the approach:

- `PersistedPracticeState` holds `history`, `templates`, `repertoireItems`, `licks`, `customChords`, `weeklySchedule` and `practiceGoals`, and is merged with `practice_data` in Supabase.
- `SessionRecord` already records an optional `guitarId`; `PracticeLaunchPlan`, `ActivePracticeSession` and the manual and editor drafts carry it too.
- `useGuitarPreference` stores the last guitar type per device in `localStorage`.
- Tools already has the `ToolSection` shell used by the metronome, tuner, tones and delay panels.
- `PracticeAsset` + IndexedDB (`practice-library.ts`) + Supabase Storage (`saveCloudPracticeAsset`, `getCloudPracticeAsset`) already store and sync binary files, with `MAX_IMAGE_BYTES` and the accepted image types defined in `practice-attachments.ts`.
- `CoverArt` already solves the "fixed box, object-cover, icon when missing" pattern.
- The current feature also added `GuitarSetup` and `GuitarStringChange` arrays, a `/equipment` route and a home card, all of which this design replaces.

## Goals / Non-Goals

**Goals:**

- One small block in Tools, one row per guitar, no new section.
- One history per guitar with string changes and notes.
- A reminder that combines days and use, with honest reporting of partial attribution.
- Zero repeated questions when the user has one guitar.
- One photo per guitar that cannot break the row layout.

**Non-Goals:**

- Galleries, cropping, reordering or multiple photos.
- Structured setups (kind, luthier, cost).
- Renaming the Tools screen or adding sub-navigation.
- Attributing old practices to a guitar.

## Decisions

### 1. Maintenance is a utility, not a section

Add `src/components/tools/StringsPanel.tsx` as one more `ToolSection` in `ToolsView`, with id `tools-strings`. Remove the `/equipment` route, the navigation entry and `EquipmentWidget`.

- Alternative considered: a section of its own with cards. Rejected: the user does not want another top-level area, and the volume of data does not justify it.

### 2. Two tables instead of three

```ts
Guitar { id, name, intervalDays?, intervalHours?, photoAssetId?, createdAt, updatedAt }
GuitarEntry { id, guitarId, date, text, kind: "strings" | "note", createdAt, updatedAt }
```

`guitarSetups` and `stringChanges` disappear. `kind` is the only classification left: it tells the row which entry restarts the reminder. Brand, gauge, luthier and cost become free text inside `text`.

The newest entry with `kind: "strings"` is the reference. A guitar with an interval but no such entry is `no-history`, never `due`.

Migration runs in `normalizePracticeStorageState` and in `normalizePracticeData`: if the stored state has no `guitarEntries` but has the old arrays, map each string change to `{ kind: "strings", text: [brand, gauge].filter(Boolean).join(" · ") }` and each setup to `{ kind: "note", text: [description, luthier].filter(Boolean).join(" · ") }`, then drop the old keys. The same mapping is applied to cloud rows, so a device on an older build can still write and be merged.

### 3. A pure utility owns the calculations

`src/utils/equipment.ts`:

- `normalizeGuitar`, `normalizeGuitarEntry`, `normalizeGuitars`, `normalizeGuitarEntries`.
- `getLatestStringChange(entries, guitarId)`.
- `getGuitarUsageSeconds(history, guitarId, sinceDate?)`.
- `getGuitarAttribution(history, guitarId, sinceDate)` returning the recorded and missing session counts, so the row can state partial coverage.
- `getGuitarMaintenance(guitar, entries, history, today)` returning the latest change, days and hours since it, remaining values, `progress`, `state` (`no-interval | no-history | ok | soon | due`) and `limit`.
- `removeGuitarFromMaintenance(guitarId, guitars, entries)`.
- `sortGuitarsByMaintenance`.
- `resolvePracticeGuitarId({ explicitId, lastGuitarId, guitars })` for the inheritance rule.

Due is `daysRemaining <= 0 || hoursRemaining <= 0`; soon is `<= 7` days or `<= 2` hours. All pure and tested with fixed dates.

### 4. Inheritance instead of a question

`useGuitarPreference` gains `lastGuitarId` and `rememberGuitarId`, next to the existing type. Resolution order for a new practice:

1. Explicit identifier (template, repeated session, chosen in the form).
2. Last guitar used on the device, if it still exists.
3. The only guitar in the list.

`resolvePracticeGuitarId` returns `undefined` when nothing matches. The selector renders only when `guitars.length > 1`.

`SessionEditor` does **not** use the resolver: it reads `session.guitarId` and nothing else, so editing an old practice cannot invent attribution.

The guitar no longer declares an electric/acoustic type, so choosing a guitar no longer rewrites the practice type and changing the type no longer clears the guitar. `getGuitarIdForTypeChange` is removed.

- Alternative considered: asking every session with "sin guitarra concreta" preselected. Rejected: it produces a precise-looking number that is silently incomplete.

### 5. The photo reuses the existing file pipeline

`Guitar.photoAssetId` points at a `PracticeAsset` with `kind: "image"`. The blob lives in IndexedDB and, when signed in, in Supabase Storage. It never enters the synced practice JSON.

`src/utils/image.ts`:

- `getScaledDimensions(width, height, maxSide)` — pure, unit tested.
- `compressImage(file, { maxSide: 1200, quality: 0.82 })` — `createImageBitmap(file, { imageOrientation: "from-image" })`, canvas, `toBlob("image/webp", quality)`, falling back to `image/jpeg` when WebP is not produced.
- `validateImageFile(file)` reusing the accepted types and `MAX_IMAGE_BYTES` messages.

Saving order: guitar record first, asset second. If the asset fails, the guitar is kept and the dialog reports the photo error. Removing or replacing a photo deletes the previous asset.

Two small gaps must be filled:

- `deletePracticeAsset(assetId)` in `practice-library.ts`.
- `deleteCloudPracticeAsset(userId, assetId)` in `practice-files.ts`, which reads `storage_path` from `practice_assets`, removes the object and deletes the row.

Upload on save: always local, plus `saveCloudPracticeAsset` when a user is available.

### 6. The row keeps the layout fixed

`GuitarRow` renders:

- a `size-14 rounded-lg border border-line` box with `object-cover`, or a `GuitarIcon` in `text-muted/70`;
- the name and, under it, the state in words;
- `42 / 60 días · 12 / 40 h` in `font-mono tabular-nums`;
- the primary action ("Cambié las cuerdas") and a `⋯` menu with edit, history and delete.

The box has a fixed size and the image is absolutely contained, so nothing moves when it loads. There is no hero image and no per-row grid, which keeps a vertical phone photo and a horizontal one in the same height.

### 7. Home shows one line or nothing

`StringsReminder` renders a single line only when the most urgent guitar is `due` or `soon`, and links to `/tools#tools-strings`. When everything is up to date or there are no guitars, it renders nothing.

- Alternative considered: a card with a summary. Rejected: it adds noise for a task that is relevant six times a year.

### 8. Tests

- `equipment.test.mjs`: usage, attribution counts, day and hour states, no history, no interval, ordering, migration helpers, deletion, inheritance resolution.
- `image.test.mjs`: scaling dimensions and rejection rules.
- `practice-session-record`, `practice-launch` and `active-practice-session` keep covering `guitarId`.
- Store and normalizer tests updated to the two new arrays.

## Risks / Trade-offs

- **With one guitar, every practice is attributed to it** → a day playing another instrument counts towards it. Accepted in exchange for zero friction; the row states when attribution is incomplete, and a second guitar makes the selector appear.
- **A single history loses structure** → brand, gauge and luthier become text. Accepted: the user does not want the fields.
- **Deleted guitars can return after a sync from another device** → existing merge-by-id behaviour for every collection; deletion is immediate locally.
- **Compression quality on old browsers** → `createImageBitmap` with EXIF orientation is widely supported; when WebP is unavailable the JPEG fallback keeps the flow working.
- **Orphan files if a save is interrupted** → assets are written after the record; a failed write leaves at most one unreferenced blob, which the existing account-wide cleanup still removes.

## Migration Plan

No destructive migration. The persisted JSON gains `guitars` and `guitarEntries`; the normalizer converts `guitarSetups` and `stringChanges` into entries on load and on sync, then the old keys stop being written. Rolling back a build leaves sessions with an optional `guitarId` intact and the equipment arrays ignored.
