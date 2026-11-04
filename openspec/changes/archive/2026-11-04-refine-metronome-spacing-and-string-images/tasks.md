# Tasks

## 1. Reparto de los pulsos

- [x] 1.1 In `src/components/practice/MetronomeCard.tsx`, restore the four-column width with `flex: 0 0 calc((100% - 1.5rem) / 4)` and `justify-center`, removing the fixed `w-12` width.
- [x] 1.2 Verify in the browser that 4/4 fills the card as before and that 6/8 and 9/8 keep the same cell width with the group centred, measuring zero offset against the card.
- [x] 1.3 Check 320, 375, 768 and 1280 px: no horizontal overflow and every dot stays inside the card.

## 2. Imágenes del catálogo

- [x] 2.1 Add an optional `image` to the set type in `src/utils/guitar-strings.ts` and to `src/data/guitar-strings.json`, and include it in the snapshot returned by `toGuitarStringSetSnapshot`.
- [x] 2.2 Carry `image` through the history snapshot: extend `GuitarStringSetSnapshot` in `src/types/equipment.ts` and keep it in `normalizeStringSet` in `src/utils/equipment.ts`, discarding anything that is not a path.
- [x] 2.3 Create `public/string-sets/` with a `README.md` explaining the format, the file name, the origin of each photo and the permission needed. The photos ship with the repository.
- [x] 2.4 Add `image?: string` to `SelectOption` and render the thumbnail in `src/components/ui/SelectField.tsx`, both in the open list and in the closed trigger, without changing its keyboard or placement behaviour.
- [x] 2.5 Add a `StringSetThumb` component with fixed sizes for the picker, the history and the row, a brand-initial placeholder and an `onError` fallback.
- [x] 2.6 Use it in `StringSetFields`, `GuitarHistoryDialog` and `GuitarRow`, so the thumbnail appears next to the set in the three places.
- [x] 2.7 Add the copy for the local folder note and the placeholder label to `src/i18n/es.ts` and `src/i18n/en.ts`.

## 3. Pruebas

- [x] 3.1 Cover in `tests/guitar-strings.test.mjs` that `image` is optional, that the snapshot keeps it and that a missing image does not break the catalogue.
- [x] 3.2 Cover in `tests/equipment.test.mjs` that a stored snapshot keeps a valid image path and drops an invalid one.
- [x] 3.3 Run `npm test`, `npm run typecheck` and `npm run build`; all three finish without failures.

## 4. Verificación en el navegador

- [x] 4.1 With the folder empty, open the picker and the history: every set shows the placeholder and no request fails visibly.
- [x] 4.2 Drop one local image, point a set at it, reload and confirm it appears in the picker, the history and the row.
- [x] 4.3 Break the path on purpose and confirm the placeholder returns without moving the layout.

## Workflow follow-up

- Archive after the browser checks pass and verify `practice-tools` and `guitar-maintenance` keep their existing requirements and gain the new ones.
- Document in `public/string-sets/README.md` that shipping the app with manufacturer photos requires their permission.
