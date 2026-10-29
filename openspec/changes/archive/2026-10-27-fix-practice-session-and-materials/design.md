# Design

## Context

See `proposal.md` — Why. Two existing mechanisms are involved:

- `usePracticeTimer` synchronises the runtime every 250 ms and plays the block-end tone whenever `awaitingPhaseAdvance` is true. With `continueAfterBlockTime`, that flag stays true while the timer keeps running, so the side effect repeats on every tick.
- `PracticeSession` decides whether to show the floating bar from `!isPracticeRoute || !isTimerVisible`. `useElementVisibility` creates one `IntersectionObserver` on mount and never rebinds it. Toggling split view replaces the timer card node, and the observer keeps watching the detached one.

Study material is already a `PracticeResource` with a `kind`, local/cloud assets in IndexedDB or Supabase, and a shared `ResourcePreview`. Songsterr is already a resource kind with URL validation and a preview branch, but it is not offered in `ATTACHMENT_TYPES`, so it cannot be attached from the UI.

## Goals / Non-Goals

**Goals:**

- Make the block-complete tone a one-shot signal per block transition.
- Make the floating bar react to the actual timer card element and to route/layout changes.
- Reuse the existing asset pipeline for images; only the kind, validation, preview and database constraint change.
- Expose Songsterr through the existing resource type and validation.

**Non-Goals:**

- Changing timer runtime semantics, overtime accounting or the bar's controls.
- Image URLs, galleries, thumbnails, editing or HEIC conversion.
- Removing assets when their material is removed.
- Adding a new storage bucket or a new image service.

## Decisions

### Block-complete signal: pure edge detection

Add `shouldSignalBlockEnd(previous, next)` to `practice-timer.ts` returning true only when `next.awaitingPhaseAdvance` is true and `previous.awaitingPhaseAdvance` is false. The hook keeps the previous runtime, calls the helper after `synchronizePracticeTimer` and plays the tone only when it returns true. The auto-advance branch keeps its own single sound.

Pausing already leaves `awaitingPhaseAdvance` true, so resuming the same block does not re-trigger the sound. Advancing or resetting clears the flag, so the next block can signal again. The helper is a pure function and can be tested without React.

Alternative considered: a "signalled phase index" ref. It also works, but duplicates state the runtime already carries and is harder to test.

### Floating bar: observe the real node and gate on a measurement

Rewrite `useElementVisibility` around a callback ref that stores the element in state. The effect then depends on the element and `rootMargin`, so replacing the card (split view) disconnects the old observer and attaches a new one. Before observing, the effect measures with `getBoundingClientRect()` and `window.innerHeight`, then the observer keeps it updated. The hook also returns whether it has measured the current element.

`PracticeSession` hides the bar on the practice route until a measurement exists; outside the practice route the bar behaves as before. This prevents both the stuck-visible state after a remount and the one-frame flash when arriving from another route. The existing `useAnimatedPresence` and its reduced-motion behaviour stay unchanged.

Alternatives considered: keep the `ref` API and pass a `key` to force the effect; it requires the caller to know every remount cause. A scroll listener would work but reinvents intersection tracking and misses layout changes.

### Images: a new asset kind through the existing pipeline

- Add `image` to `PRACTICE_RESOURCE_KINDS`, `RESOURCE_LABELS`, `ATTACHMENT_TYPES` and the attachment menu/form.
- `getPracticeFileKind` recognises jpg/jpeg/png/webp/avif/gif; `usePracticeAttachment` accepts only those for the image type, rejects files over 10 MB before saving, and reuses `savePracticeAsset` / `saveCloudPracticeAsset`.
- `PracticeAsset.kind` already derives from `PracticeResourceKind`, so the type follows automatically.
- `ResourcePreview` renders an `<img>` with `object-contain`, a capped height and the resource title as `alt`, plus an "Abrir en otra pestaña" link using the blob/signed URL from `useAssetUrl`.
- Supabase migration: widen the `practice_assets.kind` check with `image` and add the five image MIME types to the `practice-files` bucket. No new bucket or policy.
- Reject SVG (active content surface) and HEIC/HEIF (Chrome cannot render it) with an explicit message naming the accepted formats.

Alternatives considered: storing images as data URLs in the practice state; rejected because it inflates the synced JSON and duplicates the asset pipeline. A separate image table; rejected because the existing metadata table already fits.

### Songsterr: attach through the existing link flow

Add `songsterr` to `ATTACHMENT_TYPES`, the menu and the form's link fields. `usePracticeAttachment` validates with the existing `normalizeSongsterrUrl` and stores `{ kind: "songsterr", url }`. `ResourcePreview` stops embedding Songsterr and shows a titled card with an external link (`target="_blank"`, `rel="noopener noreferrer"`), matching the chosen behaviour and avoiding iframe restrictions.

Alternatives considered: keeping the iframe; rejected by the user in favour of an external tab. A generic "link" type; rejected because Songsterr already has a validated kind and label.

## Risks / Trade-offs

- [Blob URLs are scoped to the document] → The "open in new tab" action is only rendered while the blob URL exists; the anchor opens it from the same document. Signed cloud URLs do not have this constraint.
- [DB migration is not applied by the app] → Include a named migration file and mention it in the change summary; guest uploads work without it, cloud image upload fails clearly until applied.
- [Old Songsterr resources lose the iframe] → Accepted; the external link keeps them reachable. The change is recorded in the spec.
- [Observer logic has no React test harness] → Keep the measurement helper pure where possible and cover the behaviour manually (top of page, split view, route return, scroll past the card). Pure timer/file-kind logic gets node tests.
- [Image size can bloat local storage] → 10 MB client-side limit; the bucket retains its existing 50 MB limit.

## Migration Plan

1. Ship the code and the new migration together.
2. Apply `supabase/migrations/*_practice_image_assets.sql` in Supabase.
3. Rollback: revert the app; existing rows with `image` kind would be unreadable until the constraint is narrowed again, so do not roll back the constraint while image assets exist.
