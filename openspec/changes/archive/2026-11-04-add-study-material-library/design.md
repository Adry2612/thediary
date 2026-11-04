# Design

## Context

- Study material is a `PracticeResource` embedded in `PracticePhase.resources`
  and `RepertoireItem.resources`. It can be a URL, pasted tab text or an
  uploaded file referenced by `assetId`.
- `PracticeResource` already models tab, PDF, image, Songsterr, YouTube,
  Spotify and generic link kinds, and `ATTACHMENT_OPTIONS` centralises their
  labels and validation.
- Practice data persists through Zustand under a per-namespace local key,
  normalises on hydrate, and syncs through the `practice_data` row with a
  `mergeById` strategy.
- Uploaded files use `savePracticeAsset` locally and
  `saveCloudPracticeAsset` when there is an account.

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- One catalogue of reusable materials with create, edit, delete and search.
- Attach a catalogue entry anywhere material is attached today.
- Keep existing practices immutable when the catalogue changes.
- Reuse the current persistence, asset and sync infrastructure.

**Non-Goals:**

- Deduplicating materials with the same URL or file.
- Versioning a material or propagating edits into existing attachments.
- Sharing materials between accounts or making them public.
- Usage analytics per material.
- Saving an already-attached block resource into the library in one click
  (possible later; the library form and the attach form stay independent).

## Decisions

### Data model: a flat `StudyMaterial`

Add to `src/types/practice.ts`:

```ts
interface StudyMaterial {
  id: string;
  title: string;
  kind: PracticeResourceKind;
  url?: string;
  assetId?: string;
  fileName?: string;
  text?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

Flat fields mirror `PracticeResource`, so converting to an attachment is a
direct copy and search needs no nested traversal.

Alternative considered: nest a `PracticeResource` inside the entry. Rejected —
it adds a level that every form, search and normaliser would have to unwrap.

### Store and sync: a new collection in the existing practice state

Add `studyMaterials: StudyMaterial[]` to the store and to
`PersistedPracticeState`, with `saveStudyMaterial` and `deleteStudyMaterial`.
Include it in:

- `normalizePracticeStorageState` (default `[]`, drop entries without an id or
  title).
- `normalizePracticeData` and `mergePracticeData` in the Supabase service
  (`mergeById`, local wins on the same id, consistent with the other
  collections).
- `AppDataProvider` where it enumerates arrays for import counts.

No version bump is needed: an old state without the key normalises to `[]`, and
an old client simply ignores the extra key.

Alternative considered: a separate Zustand store. Rejected — it would need its
own persistence, namespace switching, cloud merge and sign-out cleanup for no
benefit.

### Copy on attach, never a live reference

Attaching converts the `StudyMaterial` into a `PracticeResource` with a fresh
id and copies title, kind, url, assetId, fileName and text. No
`libraryMaterialId` is stored.

Consequences, all intentional:

- Renaming or editing the catalogue entry leaves old attachments untouched.
- Deleting the entry leaves old attachments working.
- Removing an attachment never touches the catalogue.

Alternative considered: store a reference and resolve it on read. Rejected —
deleting or editing an entry would silently rewrite historical practices, and
resolution would complicate offline rendering and cloud sync.

### Files: reuse the asset flow and never delete shared assets

Library uploads use the same `savePracticeAsset` /
`saveCloudPracticeAsset` calls and the same `ATTACHMENT_OPTIONS` validation as
the practice panel. Deleting a material removes only the catalogue entry; the
asset stays because attachments may still reference it. This matches the
existing behaviour for practice resources.

Trade-off: deleting a file from the library does not reclaim disk. A future
cleanup can remove assets with no remaining reference; it is out of scope here.

### Screens: a dedicated route plus two entry points

- New route `src/app/(workspace)/materials/page.tsx` rendering
  `MaterialLibraryView`: list with search and kind filter, create/edit dialog,
  delete confirmation and toast feedback.
- Herramientas gets a full-width `ToolSection` with a short description, the
  material count and a link to the route.
- `AttachMaterialMenu` gains an option that opens `MaterialLibraryPicker`, a
  dialog with the same search/filter that returns one selected material to the
  caller. The picker also links to the full library route for management.

A dedicated route avoids crowding the seven-item header navigation and gives
the catalogue room to grow; keeping the picker as a dialog avoids leaving a
running practice.

Alternative considered: a new top-level navigation item. Rejected — the header
is already at seven items and the library is an occasional management screen.

### Localisation and feedback

New strings go in `src/i18n/dictionary.ts`, `es.ts` and `en.ts` under a
`materials` section. Saves and deletes confirm with the existing `Toast`;
validation errors stay inline, matching the rest of the app.

## Risks / Trade-offs

- **Catalogue and attachments diverging** → Expected by design; the UI copy
  says an attachment is a copy, and the copy-on-attach tests pin it.
- **Unused uploaded files after deletion** → Accepted for now; assets are
  shared and deleting them eagerly would break attachments.
- **A large catalogue slowing the screen** → Client-side filtering is enough
  for the realistic size; the list renders titles and metadata only, never file
  blobs.
- **Cloud merge duplicates** → `mergeById` keyed on the material id keeps one
  entry per id; normalisation drops malformed rows.
- **Namespace switching leaking data** → The new collection rides the same
  persisted state, so it inherits the existing namespace isolation.
- **Two i18n layers** → Add keys to the typed dictionary and the ES/EN objects;
  the legacy `translations.ts` overrides are left alone.
