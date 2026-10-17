# Tasks

## 1. Difficulty on the item

- [x] 1.1 Add `RepertoireDifficulty` (`beginner` | `intermediate` | `advanced`) and the optional `difficulty` field to `RepertoireItem`, and drop an unknown value while keeping the item when the store is normalized. Verify with `npm run typecheck`.
- [x] 1.2 Offer the three difficulties plus "none" in the create form (`RepertoireSongForm`) and in the item's extra configuration, saving the choice and keeping it when other fields change. Verify with `npm run typecheck` and in the app.
- [x] 1.3 Show the chosen difficulty on the item in the library. Verify in the app.

## 2. Type label

- [x] 2.1 Add singular `song` / `lick` labels and use them on the item instead of the plural ones.
- [x] 2.2 Give `RepertoireItemCard` a `showKind` prop and pass `filter === "all"` from the library so the label hides while the list is filtered by type. Verify in the app.

## 3. Practice time of an item

- [x] 3.1 Add `getRepertoireItemPracticeStats(history)`, counting any completed phase that names the item with or without a part, and leave the per-part function as it is. Verify with `npm test`.
- [x] 3.2 Set `repertoireItemId` on the phase the quick practice creates, so a practice started from an item counts. Verify with `npm run typecheck`.
- [x] 3.3 Use the item-level time on the item, in the library total, and in the "most practiced" ordering. Verify with `npm test` and in the app.

## 4. Verification

- [x] 4.1 Run `npm test`, `npm run typecheck`, and `npm run build` together and verify all pass.
- [x] 4.2 In the app: set a difficulty on an item and see it in the library, check a song reads "Canción" and that the label disappears when filtering by songs, and complete a practice started from an item to see its minutes stop being 0.

## Workflow follow-up

- After the tasks pass, review the diff and validate with `openspec validate "improve-repertoire-library" --strict`.
