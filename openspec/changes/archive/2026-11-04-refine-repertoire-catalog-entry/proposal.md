# Proposal

## Why

The catalog lookup that completes a saved song's title, artist, album, year and
artwork already exists, but its entry point is buried at the bottom of the
expanded card and reads like a generic button. The user did not find it. The
preview that precedes the change also exposes the raw artwork URL, which adds
noise to a decision that is visual.

## What Changes

- Add a compact pencil icon to the header of every saved song's card, in both
  the repertoire list and the song detail page. Hovering or focusing it names
  the action ("Editar datos del tema") and activating it opens the existing
  catalog lookup.
- Keep the icon from triggering the card's own navigation when the card is shown
  in the list.
- Remove the now-redundant textual "Buscar datos" button from the expanded
  details so the song has one clear entry point.
- In the catalog change preview, show the current and the new artwork as
  images only. The raw URL/path is no longer printed; each image keeps an
  accessible description and a placeholder when that side has no artwork.
- Keep every existing behavior: the lookup is pre-filled with the song's title
  and artist, applying it preserves tuning, capo, parts, chord chart, tablature
  and material, and the song's title stays editable afterwards so the user can
  rename it (for example, "(acústico)").

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `repertoire-library`: the existing catalog completion gains a visible icon
  entry point on the song card, and the preview stops showing artwork URLs.

## Impact

- `src/components/repertoire/RepertoireItemCard.tsx`: header action, icon,
  tooltip, removal of the expanded text button.
- `src/components/repertoire/CatalogPreviewDialog.tsx`: artwork-only preview.
- `src/components/ui/icons.tsx`: reuse the existing `EditIcon`.
- `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/dictionary.ts`: the action
  label and preview placeholder strings.
- Tests for the card entry point and the preview, plus `docs/repertoire.md`.
