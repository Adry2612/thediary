# Proposal

## Why

Study material — a PDF, a tab, a backing track, a Songsterr or YouTube link —
is currently typed or uploaded again for every practice block and every
repertoire item that needs it. The same resource is duplicated by hand, and
there is no place to see everything the user has collected. A reusable library
lets one material be found once and attached wherever it is practised.

## What Changes

- Add a **study material library** that stores each resource once with a title,
  kind, source (URL, pasted text or uploaded file) and optional notes.
- Add a dedicated **Material de estudio** screen to create, edit, delete, search
  and filter the saved materials, reachable from Herramientas and from the
  practice material panel.
- Let the practice panel and the repertoire item panel attach a saved material
  from a picker instead of retyping it.
- An attachment is a **copy**: editing or deleting the library entry never
  changes a practice already saved, and deleting a library entry never deletes
  a file that an attachment still uses.
- Persist the library with the existing practice data (local namespace plus the
  cloud practice-data row) and keep using the existing local and cloud asset
  storage for uploaded files, so the feature works offline and follows the
  account across devices.

## Capabilities

### New Capabilities

- `study-material-library`: owns the reusable material catalogue, its kinds,
  search, persistence and the rule that attaching copies rather than links.

### Modified Capabilities

<!-- none: the practice panel keeps its existing rule that a block only shows
     its own material; this change only adds a source for that material. -->

## Impact

- New types in `src/types/practice.ts` and `src/types/practice-storage.ts`.
- `src/stores/usePracticeStore.ts`, `src/stores/normalizePracticeStorageState.ts`
  and `src/services/supabase/practice-data.ts`: new collection, normalization
  and cloud merge.
- New screen under `src/app/(workspace)/materials/` and components under
  `src/components/materials/`.
- `src/components/practice/PracticeMaterials.tsx`,
  `src/components/practice/AttachMaterialMenu.tsx` and
  `src/components/repertoire/RepertoireItemCard.tsx`: picker entry points.
- `src/components/tools/ToolsView.tsx`: link to the library.
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/dictionary.ts`: new section.
- Tests, `docs/materials.md` and a spec for the new capability.
