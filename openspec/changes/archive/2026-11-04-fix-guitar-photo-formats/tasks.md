# Tasks

## 1. Formatos

- [x] 1.1 Add `image/heic` and `image/heif` to the accepted MIME types and `.heic` and `.heif` to the accepted extensions and to the file input.
- [x] 1.2 Add `canDecodeImage` to `src/utils/image.ts` and check it when the photo is chosen, so an unreadable file is rejected before saving.

## 2. Interfaz

- [x] 2.1 Name the accepted formats in the hint and in the unsupported-file error, in Spanish and English.
- [x] 2.2 Add a distinct message for an image the browser cannot read, instead of the generic format error.

## 3. Verificación

- [x] 3.1 Update `tests/image.test.mjs`: HEIC and HEIF are accepted by MIME and by extension; a PDF is still rejected.
- [x] 3.2 Run `npm test`, `npm run typecheck` and `npm run build`; all three finish without failures.
- [x] 3.3 In the browser, choose a JPG and confirm it previews, then choose a HEIC in a browser without support and confirm the new message appears.

## Workflow follow-up

- Archive the change and verify `guitar-maintenance` keeps its existing requirements and gains the new one.
