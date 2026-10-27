# Tasks

## 1. Block-complete signal

- [x] 1.1 Add `shouldSignalBlockEnd(previous, next)` to `src/utils/practice-timer.ts` and cover the rising edge, repeated overtime ticks and pause/resume in `tests/practice-timer.test.mjs`.
- [x] 1.2 Use the helper in `src/hooks/usePracticeTimer.ts` so `playTransitionTone(false)` runs once per block transition, including when `continueAfterBlockTime` keeps the timer running.

## 2. Floating practice bar

- [x] 2.1 Rework `src/hooks/useElementVisibility.ts` to observe the current DOM node through a callback ref, measure it before observing, and expose whether the current node has been measured.
- [x] 2.2 Update `src/components/practice/PracticeSession.tsx` so the bar stays hidden on `/practice` until the timer card measurement exists, and re-evaluates after split view or route changes.
- [x] 2.3 Verify the bar manually: hidden at the top on entering `/practice`, hidden after toggling split view, visible only after scrolling the timer card out of view, and visible on other routes.

## 3. Songsterr material

- [x] 3.1 Add `songsterr` to `ATTACHMENT_TYPES`, the attach menu, the form's link fields and `usePracticeAttachment` validation with `normalizeSongsterrUrl`.
- [x] 3.2 Replace the Songsterr iframe in `src/components/practice/ResourcePreview.tsx` with a titled card that opens the validated URL in a new tab.
- [x] 3.3 Extend `tests/practice-resources.test.mjs` and the attachment configuration coverage so every attachment type has a label, form configuration and a resource kind.

## 4. Image material

- [x] 4.1 Add `image` to `PRACTICE_RESOURCE_KINDS` and `RESOURCE_LABELS`, and teach `getPracticeFileKind` the accepted image extensions.
- [x] 4.2 Add the image attachment type, menu entry, form copy and file acceptance to `usePracticeAttachment`, including the 10 MB limit and an error for SVG/HEIC/other formats.
- [x] 4.3 Render image resources in `ResourcePreview` with an inline preview and an "open in a new tab" action.
- [x] 4.4 Add a Supabase migration widening the `practice_assets.kind` check and the `practice-files` bucket MIME list for image assets.
- [x] 4.5 Add tests for image detection and the updated resource labels, then run `npm test` and `npm run typecheck`.

## 5. Change verification

- [x] 5.1 Run `openspec validate fix-practice-session-and-materials --strict` and fix any artifact or delta issues.
- [x] 5.2 Review the final diff for scope, Spanish UI copy consistency and no unrelated formatting churn.
