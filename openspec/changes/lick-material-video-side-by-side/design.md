# Design

## Context

See `proposal.md` - Why. The lick detail page currently renders the reference video and the study material as two independent sections stacked vertically, video first. `LickMaterials` lays out its resource selector as a `14rem` sidebar next to the preview from the `md` breakpoint, which assumes the full content width. The page column is `max-w-7xl`, so a two-column block has enough room at desktop widths but not on tablets or phones.

## Goals / Non-Goals

**Goals:**

- Make the material the primary surface and the video the secondary one when both exist.
- Keep the existing single-section layout when only one of them exists.
- Keep the material viewer usable inside a narrower column.
- Preserve the current video player, clip loop and material selection behavior.

**Non-Goals:**

- Changing the lick model, storage, sync, editor or practice session.
- Making the video sticky while the material scrolls.
- Adding a global media layout or a reusable split-view component.
- Changing the BPM chart and panel below the media block.

## Decisions

### D1 - Side by side from `lg`, stacked below it

Use a two-column CSS grid from the `lg` breakpoint (1024 px), with the material in a larger track and the video in a narrower one:

```txt
lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]
```

Below `lg`, the grid collapses to one column. The material is always first in the DOM, so the stacked order is material then video and screen readers reach the material first. This is simpler than separate desktop/mobile trees and keeps one source of truth for the sections.

The material title and its resource selector live in a header row above the content row. The content row holds the material preview and the video, and both rows use the same two-column tracks, so the video card starts at the same vertical position as the preview instead of at the material heading.

Alternative considered: a 50/50 split. Rejected because the material is the primary study surface and the Guitar Pro/PDF preview needs more width than a 16:9 video.

### D2 - `LickMaterials` gets an explicit stacked variant

Add a `layout` prop to `LickMaterials` with `sidebar` as the default and `stacked` for the primary column. In `stacked` mode the resource buttons become a horizontal scrolling row above the preview; the preview keeps the full column width. The practice session and a lick with material but no video keep the default sidebar.

Alternative considered: CSS container queries inside `LickMaterials`. Rejected for now because a prop makes the intended layout explicit and avoids introducing a container-query convention for one component.

### D3 - Conditions live in the page, components stay presentational

`LickDetailPage` computes `hasMaterial` and `hasVideo`. When both are true it renders a header row with the material title and selector and a content row with the preview and the video; otherwise it renders only the existing section for the block that exists. The page owns the selected material id in the split layout so the selector and preview can live in different rows. The video component and the material viewer do not need to know about each other.

### D4 - The video keeps its current card and aspect ratio

`LickReferenceVideo` stays unchanged. It fills the secondary column, keeps its 16:9 player, clip range and YouTube link, and aligns to the top of the grid. No sticky positioning is added: long material previews scroll with the page.

## Risks / Trade-offs

- [A Guitar Pro or PDF preview is too narrow in the primary column] → Use the stacked resource row, keep the material at roughly two thirds of the content width and stack below `lg`.
- [The video becomes too small in the secondary column] → It remains a 16:9 player with the existing "Open on YouTube" link; below `lg` it uses the full width.
- [Two long previews make the page very tall] → The grid aligns items to the top and the page scrolls normally; no fixed heights or inner scroll traps are introduced.
- [A lick with only one block inherits the new order] → Material-first is the intended priority; a lick with only a video still shows the video alone.

## Migration Plan

No data or schema changes. Deploy the layout change; rollback is a UI-only revert.
