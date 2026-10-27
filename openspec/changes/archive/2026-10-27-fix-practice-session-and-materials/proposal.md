# Proposal

## Why

A practice block that is allowed to run past its planned time repeats the block-complete tone every timer tick, so the user hears an alarm loop instead of a single warning. Separately, the floating practice bar can appear on the practice screen before the timer card has left the viewport, usually after toggling split view or returning from another route, which contradicts the intended "only while the timer is out of view" behaviour.

At the same time, the study material attached to a block only offers tablature, PDF, YouTube and Spotify. Users cannot attach a photo or diagram as material, and Songsterr is already supported by the data model and preview but is missing from the attach menu, so the existing support is unreachable.

## What Changes

- Emit the block-complete tone once per block and phase transition: running overtime, pausing or resuming must not repeat it.
- Make the floating practice bar measure the actual timer card before deciding to show, re-observe it when the card is remounted (split view) and re-measure when returning to the practice screen, so it only appears when the card is out of view.
- Add image files as study material: upload from the device, store them with the same local/cloud asset flow as PDFs, preview them inline and offer opening them in a new tab.
- Expose Songsterr links in the attach menu: validate the URL, attach it to the block or repertoire item, and open it in a new tab instead of embedding it.
- Add the matching Supabase migration for the new image asset kind and the bucket's image MIME types.

Out of scope:

- Image URLs, image editing, thumbnails or galleries.
- HEIC/HEIF uploads (Safari-only preview); the form asks the user to convert them.
- Changes to recording storage, cloud-drive sync or the PDF/audio/Guitar Pro pipelines beyond accepting the new kind.
- Deleting the stored asset when a material is removed; that behaviour is unchanged for every kind.
- Reworking the timer's overtime semantics or the floating bar's actions; only the signal and visibility are corrected.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-session-management`: the block-complete signal fires once per block transition, the floating bar only appears after confirming the timer card is out of view, and study material can include image uploads and Songsterr links.

## Impact

- `src/hooks/usePracticeTimer.ts` and `src/utils/practice-timer.ts` for the one-shot phase signal.
- `src/hooks/useElementVisibility.ts` and `src/components/practice/PracticeSession.tsx` for the floating bar measurement lifecycle.
- `src/types/practice.ts`, `src/types/practice-attachment.ts`, `src/utils/practice-resources.ts`, `src/utils/practice-templates.ts`, `src/hooks/usePracticeAttachment.ts` and `src/components/practice/*` for image and Songsterr attachments.
- `src/components/practice/ResourcePreview.tsx` for the image preview and the external Songsterr link.
- New Supabase migration under `supabase/migrations/` for `practice_assets.kind` and the `practice-files` bucket MIME list.
- Node tests under `tests/` for the phase signal, file-kind detection, resource labels and attachment configuration.
