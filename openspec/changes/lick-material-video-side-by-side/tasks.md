# Tasks

## 1. Page layout

- [x] 1.1 In `LickDetailPage`, compute whether the lick has material and a reference video, and choose between the split layout and the existing single-section layout. Verify with a lick that has both, one with only material and one with only video.
- [x] 1.2 Render the split layout as a responsive grid: material in the larger first column and video in the narrower second column from the `lg` breakpoint, stacked with material first below it. Verify at desktop, tablet and phone widths.
- [x] 1.3 Keep the BPM chart and BPM panel below the media block at full width, and confirm they do not move into either column.
- [x] 1.4 Align the top of the video card with the top of the material preview by placing the material title and selector in a header row and the preview and video in the next row; verify at desktop width.

## 2. Material panel

- [x] 2.1 Add a `layout` prop to `LickMaterials` with `sidebar` as the default and `stacked` for the primary column. Verify the practice session and single-block lick pages keep the sidebar layout.
- [x] 2.2 In `stacked` mode, show the resource buttons as a horizontal scrolling row above the preview. Verify selecting another resource updates the preview and the row does not overflow the column.
- [x] 2.3 Use the stacked variant only when the material shares the page with the video. Verify a lick with material but no video keeps the wider sidebar layout.

## 3. Documentation and verification

- [x] 3.1 Update `docs/licks.md` with the side-by-side behavior, material priority and narrow-screen order. Verify each statement matches the implemented page.
- [x] 3.2 Run `npm run typecheck`, `npm test` and `npm run build`; all three must pass.
- [x] 3.3 Check the result with a lick that has both blocks: material comes first in the DOM, no empty column appears when one block is missing, the video still plays its marked clip and the material preview remains usable at desktop, tablet and phone widths.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
