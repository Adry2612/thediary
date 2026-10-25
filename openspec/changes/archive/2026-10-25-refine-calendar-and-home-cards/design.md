# Design

## Context

The working tree already contains `refine-home-calendar-and-next-blocks`: the annual calendar renders an inline `PracticeDaySummary` panel below the grid, `usePracticeDayTooltip` is used only by the weekly summary, `TimerCard` is wrapped in a plain `div` so the bar can observe its visibility, and `partShort` copy exists in both languages. See `proposal.md` for why those decisions are being revisited.

The main specs are two changes behind the working tree. This change's delta assumes `refine-practice-banner-and-calendar` and then `refine-home-calendar-and-next-blocks` are archived first; `openspec validate` reports that the home-plan `MODIFIED` requirement is not in the main spec yet. Archiving in that order resolves it.

## Goals / Non-Goals

**Goals:**
- Restore the annual calendar's day card next to the day without letting it capture pointer events.
- Make the timer and metronome cards share a height again on wide viewports.
- Remove the "Parte:" prefix from both block-detail surfaces.
- Turn the home repertoire list into a card grid with artwork, album/year and progress.

**Non-Goals:**
- Changing the weekly summary's interactive card, the floating bar, the upcoming-blocks timeline or the touch activation rules.
- Adding catalog fetching, new storage fields or new dependencies.
- Changing the timer engine, session format or API.

## Decisions

### Preview mode in the existing tooltip hook

`usePracticeDayTooltip` gains a `preview` option. In preview mode it opens immediately (no hover-intent delay), never marks the card as hovered, does not listen for card pointer entry/leave, and closes on any scroll, resize, Escape or pointer leave. The weekly summary keeps the default interactive mode unchanged.

Alternative: a second hook. Rejected because it would duplicate `getPracticeTooltipPosition`, the hide timer and the scroll/resize cleanup, and the two cards would drift.

### A compact body in `PracticeDaySummary`

The annual preview renders `PracticeDaySummary` with `compact`, which shows the date, session count, total time and at most three sessions (title, time, duration and BPM), then a "+N sesiones" line using the existing singular/plural keys. Phase lines and notes are omitted.

A non-interactive card cannot scroll, so the content has to be bounded. The full content stays in the weekly card, and clicking or tapping a practised day opens its detail page, where the complete session list lives.

Alternative: keep the full body and clip it at the card's max height. Rejected because the user cannot reach the hidden sessions, and the card would still look broken.

### The preview card never receives pointer events

The card is still rendered through a portal and positioned by `getPracticeTooltipPosition`, but in preview mode it gets `pointer-events-none` and no pointer handlers. The day under the card therefore receives `mouseenter`, `focus` and `click`, which is exactly the missing behaviour from the original card.

Alternative: reposition the card outside the grid. Rejected by the user: the card must stay next to the day, and the grid has no reliable free space at 1024 px or on mobile.

Trade-off: the card cannot be scrolled or hovered, hence the compact body. It still has a solid background so the text stays readable over the cells, and keyboard users keep `aria-describedby` pointing at it.

### Touch keeps the tested two-tap rule

`resolveDayActivation` is unchanged. The first tap on a day with practice arms it and shows the preview; the second tap on the same day navigates; a tap outside the grid closes the preview and clears the armed day. The document `pointerdown` listener keeps ignoring the grid so the opening tap does not immediately close the card.

### Equal heights by letting the timer card fill its grid item

The wrapper introduced for the visibility observer stays, but both the wrapper and the timer `Card` get `h-full`. The metronome is a direct grid child and already stretches. The grid columns stay at 1.25fr / 0.75fr; only the vertical gap disappears.

Alternative: change the grid to equal columns. Rejected because the unequal widths are intentional and unrelated to the reported regression.

### Home cards reuse `CoverArt`

`CoverArt` gains a card-sized variant (full-width square box, same rounded border and error fallback). `RecentRepertoire` renders up to four songs in a responsive grid: two columns on narrow viewports and in the home's narrow column, four when the section spans the full row. Each card is one `Link` to `/repertoire/[id]` with the cover, title, artist and album/year, a progress summary and a bar. The bar is decorative; the "X/Y partes aprendidas" text carries the value. Songs without parts show the no-parts message. The existing loading, empty and "Ver repertorio" states stay.

Album and year come from fields already stored on `RepertoireItem`; no fetch is added. Long text uses the same `break-words` + `hyphens-auto` treatment as the plan table.

### Copy cleanup

`partShort` is removed from both languages and from the i18n parity test. The new no-parts copy is added to `home` in both languages. The session-detail table keeps its hard-coded "Lick:" and "Material:" labels; only "Parte:" disappears.

## Risks / Trade-offs

- **The preview card visually covers cells** → It only covers them visually; events pass through, so hover and click still work. The solid background keeps the preview readable.
- **Compact preview hides phases and notes** → The "+N" line signals truncation, and the day detail shows everything. The weekly card keeps the detailed view.
- **A tap could close the preview it just opened** → The outside-tap listener ignores pointer-downs inside the grid, as it does today.
- **The timer card may grow beyond the metronome's natural height** → Both cards stretch to the row's tallest item, so they remain equal; only the metronome's internal empty space grows.
- **External cover URLs can fail** → `CoverArt` already falls back to the neutral placeholder and reserves the box, so the grid does not jump.
- **Archive order** → Archiving this change before `refine-home-calendar-and-next-blocks` would fail the `MODIFIED` home-plan requirement. The proposal and tasks record the required order.

## Migration Plan

No data or storage migration. Archive `refine-practice-banner-and-calendar`, then `refine-home-calendar-and-next-blocks`, then this change. Rolling back means restoring the panel and the `Parte:` prefix; no persisted state depends on either.

## Open Questions

None.
