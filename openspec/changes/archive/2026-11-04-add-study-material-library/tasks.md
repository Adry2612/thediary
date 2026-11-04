# Tasks

## 1. Model and persistence

- [x] 1.1 Add the `StudyMaterial` type with title, kind, URL, asset, file name, text, notes and timestamps, plus the store actions to save and delete a material; verify `npm run typecheck` passes.
- [x] 1.2 Add `studyMaterials` to the persisted state and the hydration normaliser, defaulting to an empty array and dropping entries without an id or title; verify with a new unit test that an old state without the key hydrates empty and a malformed entry is discarded.
- [x] 1.3 Include the collection in the Supabase practice-data normaliser and merge by identifier; verify `tests/practice-data-merge.test.mjs` covers the new collection and `npm test` passes.
- [x] 1.4 Include the collection in the local import counts and any other place that enumerates persisted arrays; verify `npm run typecheck` and the import flow in the browser.
- [x] 1.5 Update `docs/cloud-storage-sync.md` with the new collection and its merge rule; verify the document matches the implementation.

## 2. Library screen

- [x] 2.1 Add a pure helper that sorts materials by most recently updated and filters them by text and kind; verify with unit tests for ordering, title/notes search, kind filter and the no-match case.
- [x] 2.2 Create the `/materials` route and the library view with the list, search, kind filter, loading state and empty state; verify in the browser that the list, search and filter work with saved and unsaved data.
- [x] 2.3 Add the create and edit dialog with title, kind, source, notes and the shared file/URL validation; verify saving a link, a pasted tab, a PDF and an image, and that a blank title is rejected inline.
- [x] 2.4 Add delete with confirmation and a success toast, keeping errors inline; verify cancelling keeps the material and confirming removes it.
- [x] 2.5 Add the Spanish and English strings under a `materials` section; verify `tests/i18n.test.mjs` and `npm run typecheck` pass.
- [x] 2.6 Create `docs/materials.md` describing the screen, the kinds and the copy rule; verify the steps match the built screen.

## 3. Attach from the library

- [x] 3.1 Add a pure conversion from a saved material to a practice resource that copies title, kind, URL, asset, file name and text under a fresh id; verify unit tests cover every kind and prove the source entry is not mutated.
- [x] 3.2 Add the library picker dialog with the same search and kind filter and an empty state; verify it opens from the practice material menu and from a repertoire item.
- [x] 3.3 Wire the picker into the practice material panel and the repertoire item panel so the chosen material attaches to the current block or item and appears immediately; verify in the browser while a block is running.
- [x] 3.4 Verify the copy rule end to end: attach a material, rename and delete the library entry, then reopen the practice and confirm the attachment keeps its title and source.
- [x] 3.5 Verify a block still shows only its own material after attaching from the library, and that closing the picker without choosing changes nothing.

## 4. Uploaded files

- [x] 4.1 Store library uploads through the existing local and cloud asset flow with the same format and size validation; verify a PDF and an image save, and that an unsupported or oversized file is rejected with the existing message.
- [x] 4.2 Make deleting a library entry remove only the entry and never the asset; verify a practice that still uses the file keeps opening it after the entry is deleted.
- [x] 4.3 Add the uploaded-file and deletion rules to `docs/materials.md`; verify the document matches the behaviour.

## 5. Entry points and integration

- [x] 5.1 Add the study material section with its count and link to the library route in Herramientas; verify the link opens `/materials`.
- [x] 5.2 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish green.
- [x] 5.3 Check the library and the picker on a phone viewport with a long title and no connection; verify no overflow and that saved materials still list and open.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
