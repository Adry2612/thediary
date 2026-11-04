# Tasks

## 1. Fuera la tarjeta

- [x] 1.1 Delete `src/app/dev/string-set-card/page.tsx`. Verify `http://localhost:3000/dev/string-set-card` answers 404.
- [x] 1.2 Rewrite `src/components/tools/StringSetThumb.tsx` so it only renders a photo and returns nothing when there is no `image` or it fails, and delete `src/utils/string-set-card.ts` with `tests/string-set-card.test.mjs`. Verify `npm run typecheck` and `npm test` pass.
- [x] 1.3 Render the thumb only when the set has a photo in `src/components/tools/StringSetFields.tsx` (preview) and `src/components/tools/GuitarHistoryDialog.tsx` (entries). Verify an entry and a preview without photo show only their text, with no empty box.

## 2. Quitar el hueco y los textos

- [x] 2.1 Remove `imageFallback` from `src/utils/select-options.ts`, the fallback branch in `SelectField` and its assignment in `StringSetFields`. Verify the picker shows a thumbnail only for sets with a photo and nothing for the rest.
- [x] 2.2 Remove `stringImagePlaceholder` and `stringImageHint` from `src/i18n/es.ts` and `src/i18n/en.ts`, along with the hint in `StringSetFields`. Verify a search for both keys returns no matches and `npm run typecheck` passes.

## 3. Borrar las fotos

- [x] 3.1 Delete the 20 `.webp` files from `public/string-sets/`, remove the `image` fields from `src/data/guitar-strings.json`, and rewrite the folder's `README.md` for personal photos only. Verify no set has an `image`, the folder holds only the README, and `npm test` passes.
- [x] 3.2 Check the Tools screen with no photos: the picker, the history and the row show text only, no empty box, no broken image and no request to `/string-sets/`. Verify the row keeps its height and the list stays aligned.

## 4. Limpieza de cambios

- [x] 4.1 Delete `openspec/changes/add-generated-string-set-cards/`. Verify `openspec list --json` no longer lists it and `openspec validate "simplify-string-set-thumbnails" --strict` passes.
- [x] 4.2 Confirm the delta names still match `refine-metronome-spacing-and-string-images` (it adds the two requirements this change modifies and removes). Verify `openspec validate "refine-metronome-spacing-and-string-images" --strict` passes and leave its artifacts untouched.

## 5. Cierre

- [x] 5.1 Run `npm test`, `npm run typecheck` and `npm run build`, and check the Tools screen at 320, 375, 768 and 1280 px. Verify no overflow, aligned rows and no thumbnail anywhere without a photo.

## Workflow follow-up

- Archive `refine-metronome-spacing-and-string-images` before this change; this delta modifies and removes requirements it introduces, so the reverse order fails.
- Archive this change after review.
