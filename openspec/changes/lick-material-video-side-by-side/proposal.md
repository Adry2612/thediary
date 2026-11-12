# Proposal

## Why

On a lick page that has both a reference video and study material, the two blocks are stacked vertically. The user has to scroll between the video and the tab, so the video cannot be followed while reading the material. The material is the main study surface and should get the larger share of the page.

## What Changes

- When a lick has both a reference video and at least one study material, show them **side by side on large screens**.
- Give the material the **primary column**: it appears first in the document, takes the larger width and keeps the video as a secondary column.
- On narrow screens, stack the blocks with **material first and video second**.
- When only one of the two exists, keep the current single-section layout.
- Adapt the material panel to its narrower column: the resource tabs move above the preview instead of using the wide sidebar, so the Guitar Pro, PDF or image viewer keeps a usable width.
- The video keeps its current card, 16:9 player, clip range and YouTube link.
- No stored data, API, sync or database changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `licks-library`: the lick page layout when a lick has both study material and a YouTube reference clip.

## Impact

- **Code**: `src/app/(workspace)/licks/[id]/page.tsx` for the responsive two-column layout; `src/components/licks/LickMaterials.tsx` for the compact resource tabs; `LickReferenceVideo` stays as it is.
- **Docs**: `docs/licks.md`.
- **Tests**: existing test suite plus manual checks at desktop, tablet and phone widths.
- **Unchanged**: the lick model, material storage, Supabase, the editor, the practice session and the BPM panels.
