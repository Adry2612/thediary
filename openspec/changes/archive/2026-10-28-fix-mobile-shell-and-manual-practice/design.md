# Design

## Context

See `proposal.md` for motivation and the delta specs for the behavior contract.

Current state that shapes the approach:

- Every screen hand-rolls its container: `max-w-7xl` in the start, dashboard, repertoire, licks and recordings; `max-w-5xl` in the practice screen, the metronome and the practice-day detail; `max-w-3xl` in settings and account. Padding also differs (`py-12` without the desktop step in settings/account, `px-6 pt-16` in the practice skeleton).
- Page headers repeat a `font-mono text-xs uppercase tracking-…` paragraph above the `h1` in ten places, and `DialogHeader` renders the same eyebrow pattern inside dialogs.
- Text fields are 16 px only below the `sm` breakpoint (`text-base sm:text-sm`), and the editable repertoire artist drops to 12 px (`sm:text-xs`). The viewport declares `initial-scale` but no maximum scale.
- `ManualPracticeEntry` only stores a free-text name and a category per block. The session record already has `repertoireItemId` and `repertoirePartId` per phase, analytics already credits time through those fields, and the session editor already preserves them when saving.
- The pending `refactor-component-separation` change plans a `SectionHeader` primitive (eyebrow + title + description) and its wave 6 adoption. That primitive must not coexist with the new page header.

## Goals / Non-Goals

**Goals:**

- One page shell, one page header and one loading shell shared by every app screen.
- No zoom caused by interacting with the app, on every breakpoint the app supports.
- One name per section, used identically by the screen and the navigation.
- Manual practice blocks can link a repertoire song and credit their time.

**Non-Goals:**

- Redesigning the content inside each screen beyond its shell and header.
- Changing analytics, storage shape or cloud sync.
- Adding the song search to the session editor, which already preserves links.
- Replacing the `SectionHeader` work planned in the pending refactor; this change defines the page-level primitives that change will adopt.

## Decisions

### D1. Fixed-scale viewport plus interaction guards

Declare `maximumScale: 1` and `userScalable: false` in the Next viewport export, keep every text control at 16 px or more at all breakpoints, and add `touch-action: manipulation` to interactive elements to remove the double-tap zoom.

- Alternative considered: only raise the font size to 16 px everywhere. It fixes the reported focus zoom but leaves the double-tap zoom and contradicts the "no zoom at all" decision.
- Alternative considered: cancel multi-touch `touchmove` from JavaScript to block pinch on iOS. Rejected because it fights the browser, breaks expected gestures and has no effect on accessibility; the platform limitation is documented in Risks instead.

### D2. One `PageShell` primitive without width variants

`src/components/ui/PageShell.tsx` renders the shared column (`mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16`), accepts `as` so the practice screen can keep rendering a `div` while a practice is active, and passes `className` through for screen-specific composition (flex column, gap, `pb-0` while a practice runs).

- Alternative considered: keeping a `width` variant per screen (`wide`/`reading`/`form`). It preserves today's jump between screens, which is the defect.
- Narrow content (settings forms, the metronome card) is capped inside the shared column with its own `max-w-*`, so the screen margins never move.

### D3. `PageHeader` replaces the copied eyebrow blocks

`src/components/ui/PageHeader.tsx` composes the title, an optional description and a trailing actions slot, with the same spacing everywhere. It has no eyebrow. `DialogHeader` loses its `eyebrow` prop, and `SearchPickerDialog` stops requiring it.

- Alternative considered: build the `SectionHeader` from the pending refactor now, with a `page` variant that hides the eyebrow. Rejected: it would carry a prop that every page must suppress, and it duplicates the primitive that change is about to introduce. Coordination note goes into that change's tasks.

### D4. Loading states use the same shell

`Skeletons.tsx` adopts `PageShell` for `Home`, `Dashboard`, `Practice`, `Metronome`, `Recordings`, `Settings`, `Account`, `Repertoire`, `Licks` and `GenericPageSkeleton`, keeping only the inner placeholder shapes. Without this, the first paint still jumps and the shell only fixes the hydrated state.

### D5. Section names and eyebrow cleanup live in i18n

`home.title` → "Tu diario", `dashboard.title` → "Tu evolución" and `navigation.dashboard` → "Evolución", with the English dictionary updated in the same pass. `navigation.home` keeps "Inicio" so the first menu item does not repeat "thediary." from the header, and `practice.yourPractice` stays "Tu práctica". Every `*.eyebrow` key used only by the removed paragraphs is deleted, and the hardcoded "Detalle de práctica" eyebrow in the practice-day detail is removed with it.

### D6. Manual practice reuses the plan's song search

`ManualPracticeBlockDraft` and `ManualPracticeInput` gain optional `repertoireItemId`/`repertoirePartId`, plus the chosen song kept in the draft for display. `ManualPracticeEntry` renders `SongPickerDialog` for blocks whose category is `repertoire`, shows a "change song" action and an optional part selector, takes the song title as the block name when linked, and clears both fields when the category changes. Validation rejects a link that points to a missing song but never requires one, so a historical practice still saves.

`manualPracticeBlocksFromDrafts` maps the link into the phase, which is the only change the analytics layer needs because it already groups practice by `repertoireItemId`. `practice-session-editing` needs no change.

- Alternative considered: require the song for every repertoire block, as the plan editor does. Rejected because it would block recording a past practice of a song that is not in the repertoire yet.

## Risks / Trade-offs

- **iOS Safari ignores `user-scalable=no`** → The 16 px rule removes the focus zoom that was reported and `touch-action: manipulation` removes the double-tap zoom; pinch may still work in iOS Safari and installed iOS PWAs. The limitation is stated in the change summary, and no JavaScript guard is added.
- **Desktop fields grow when `sm:text-sm` is removed** → Keep the fixed field height and the existing paddings, then check every form at desktop width for overflow; the visual change is intentional and limited to input text size.
- **Narrow screens look sparse inside a 7xl column** → Cap their inner content and center single cards (metronome, account, settings) instead of widening them.
- **Removing the eyebrow prop breaks call sites** → TypeScript fails on every caller; migrate `DialogHeader`, `SearchPickerDialog`, `SongPickerDialog`, `TechniquePickerDialog`, `RepertoireItemDialog` and `TimerCard` in the same commit.
- **Coordination with the pending refactor** → `refactor-component-separation` wave 6 still plans to adopt `SectionHeader` and card tones. Its task text must point at `PageShell`/`PageHeader` so the page-level blocks are not reintroduced there.
- **Manual practice links change validation** → Cover the linked, unlinked, changed-category and missing-song cases in the Node tests before wiring the UI.

## Migration Plan

No data migration: stored sessions keep their shape and unlinked manual practices behave as before. Rollback is a revert of the change; no schema, bucket or stored field is added.

## Open Questions

None.
