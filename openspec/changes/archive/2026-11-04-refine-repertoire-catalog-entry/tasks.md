# Tasks

## 1. Entry point on the song card

- [x] 1.1 Add a pencil icon action to the header of song cards in both the repertoire list and the song detail, with a hover/focus label that says it edits the song's data and the same name exposed to assistive technology; verify in the browser that activating it in the list opens the lookup without navigating to the song, and that it opens the lookup on the detail page.
- [x] 1.2 Stop the icon's click from reaching the card's navigation handler and keep the delete and expand controls working; verify with pointer and keyboard in the list.
- [x] 1.3 Remove the redundant expanded "Buscar datos" text button and any string left unused; verify the expanded card shows a single catalog entry point and `npm run typecheck` passes.
- [x] 1.4 Add the action label to the Spanish and English dictionaries; verify `tests/i18n.test.mjs` and `npm run typecheck`.

## 2. Artwork-only preview

- [x] 2.1 Change the catalog preview's cover row to render the current and the new artwork as images with descriptive alternative text and a placeholder on a side without one; verify in the browser that no URL or file path is printed.
- [x] 2.2 Keep the preview readable when the image fails to load; verify with a broken cover URL that the placeholder appears with no broken-image icon.
- [x] 2.3 Update the catalog preview tests and `tests/repertoire-catalog.test.mjs` where the preview data changes; verify `npm test` passes.

## 3. Documentation and verification

- [x] 3.1 Update `docs/repertoire.md` with the icon entry point, the hover label and the artwork-only preview; verify the described steps match the built screen.
- [x] 3.2 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish green.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
