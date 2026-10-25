# Design

## Context

See `proposal.md` for motivation and the spec deltas for the contract. The app is a Next.js 16 App Router PWA (`public/site.webmanifest`, `display: standalone`) with Tailwind 4, no PWA plugin, and a palette declared in `src/app/globals.css`. The root layout (`src/app/layout.tsx`) exports only `metadata`; there is no `viewport` export, so the generated meta tag has no `viewport-fit` and `env(safe-area-inset-*)` cannot reserve the status bar.

The shell is `SiteNavigation` (a non-sticky header) followed by the page. Pages own their horizontal padding (`px-5 sm:px-8`); dialogs bypass it (`w-[calc(100%-2rem)]`, `w-[min(100%-1rem,46rem)]`). Text fields share `sharedFieldClasses` in `src/components/ui/Field.tsx` at `text-sm` (14 px), which is exactly the size that makes iOS/Android zoom on focus. Search has four implementations: repertoire (`SearchIcon` + `TextField`), licks (`TextField`), `SearchPickerDialog` (raw input), chord finder (raw input), plus the recordings text filter.

Repertoire creation is a route (`/repertoire/new`) with `RepertoireSongForm`; the form already reports the created id through `onCreated`, so it can live inside a dialog. The dashboard tooltip (`PracticeDayTooltip`) renders `session.title` and then every `phase.name`; a quick repertoire practice creates both with the same song title (`createQuickRepertoirePlan` in `src/utils/practice-launch.ts`).

Constraints: keep the existing visual language (no redesign), keep pinch zoom, do not add dependencies, and respect the layer rules in `docs/component-conventions.md` (`utils` is pure and testable, hooks own state, primitives live in `ui/`).

## Goals / Non-Goals

**Goals:**

- Reserve the top safe area once, in the shell, so every screen (including the mobile menu) is covered.
- Make mobile scrolling look native without removing the ability to scroll.
- Eliminate automatic zoom at its cause: control font size.
- Replace the creation page with a dialog without regressing the create → detail flow.
- Give search one anatomy and one accessible-name contract.
- Keep the tablature inside the app frame at 320–390 px.
- Deduplicate the day-summary line with a pure, tested rule.

**Non-Goals:**

- A general redesign of spacing, typography or colors.
- Hiding scrollbars on desktop, or disabling user zoom.
- Adding a PWA service worker, install prompt or offline cache.
- Turning the song detail editors into modals.
- Changing the practice data model or stored sessions.

## Decisions

### D1. Safe area from the viewport export plus header padding

Add `export const viewport: Viewport` to `src/app/layout.tsx` with `width: 'device-width'`, `initialScale: 1`, `viewportFit: 'cover'` and `themeColor: '#121211'`. Reserve the inset with `padding-top: env(safe-area-inset-top)` on the `<header>` in `SiteNavigation` (through a Tailwind arbitrary value or a small class in `globals.css`). `env()` is `0` in a normal desktop browser, so desktop layout is unchanged.

Alternative rejected: `padding-top` on `body`. It would also push dialog backdrops and fixed elements, and the requirement is about the header; the shell is the only element that needs it.

`maximumScale`/`userScalable: false` are explicitly **not** set: they would fix the zoom by removing an accessibility feature.

### D2. One mobile media block for scrollbars and horizontal overflow

In `globals.css`, inside `@media (max-width: 767px)` (the Tailwind `md` boundary):

- `* { scrollbar-width: none; -ms-overflow-style: none; }` and `*::-webkit-scrollbar { display: none; }`.
- `html, body { overflow-x: clip; }` (with `overflow-x: hidden` as the fallback for engines without `clip`).

Hiding the scrollbar does not change scrollability. `overflow-x: clip` on the root prevents a single wide child from moving the whole page while keeping `position: sticky` working (unlike `overflow: hidden`, which creates a scroll container). The wide calendars, tables and tablature keep their own `overflow-x-auto`.

Alternative rejected: adding a `.no-scrollbar` class to each container. There are more than ten scroll regions today and new ones would silently keep the desktop bar; the requirement is shell-wide.

Risk: a genuine overflow bug could be masked by `clip`; the verification tasks explicitly check 320/390/768 px with the clip disabled and enabled.

### D3. Prevent auto-zoom by raising mobile control text to 16 px

Change `sharedFieldClasses` from `text-sm` to `text-base sm:text-sm` so every `TextField`/`TextArea` is 16 px on phones and keeps 14 px from `sm` up. Apply the same pair to the new `SearchField`, to the raw text inputs that do not use `TextField` (account/password and delete-data dialogs, chord finder while it still has its own input, `AdjustableNumber` if it is below 16 px), and to any remaining raw `<input>`/`<textarea>` found by the audit task. The chord-name input in `ChordPicker` stays at its current large size.

Alternative rejected: a global `input { font-size: 16px }` in CSS. Tailwind utilities outrank element selectors unless `!important` is used, and that would also shrink intentionally large inputs. A class-level change is explicit and reviewable.

Verification is mechanical: at a 390 px viewport, every enabled `input`/`textarea` that is not a checkbox/radio/range must compute to at least 16 px, and pinch zoom must remain available.

### D4. One `SearchField` primitive in `ui/`

Add `src/components/ui/SearchField.tsx`, a server-safe primitive that composes the existing `TextField`:

```
label (visible, wrapping <label>)
  span.relative
    SearchIcon (aria-hidden, absolute left)
    TextField type="search" class="pl-10"
```

Props: `label`, `value`, `onChange`, `placeholder`, optional `inputRef`, `onKeyDown`, `id`, `disabled`, `className`, plus the native input props that call sites already use. The wrapping label provides the accessible name; the icon is already `aria-hidden` in `ui/icons.tsx`. No `variant` is introduced: all current occupants show a label, so a hidden-label variant would be speculative.

Call sites migrated in this change:

| Site | Current shape |
| --- | --- |
| `RepertoireView` | label + icon + `TextField` |
| `LicksView` | label + `TextField` without icon |
| `RecordingsLibrary` block-name filter | label + `TextField` |
| `SearchPickerDialog` (used by song and technique pickers) | raw input + icon + ref focus |
| `ChordFinderDialog` | raw input, no icon, `h-10` |

`ChordPicker` keeps its chord-name editor and its search **button**: it is not a filter field. The repertoire and licks placeholders/labels keep their i18n keys; the recordings one keeps `searchBlock`.

### D5. Creation dialog mounted on demand

`RepertoireView` replaces the `<Link href="/repertoire/new">` with a `<button>` (same classes and `PlusIcon`) that sets `isCreating`. A new `RepertoireItemDialog` renders `ModalDialog` + `DialogHeader` + `RepertoireSongForm` and is mounted only while open, so each opening starts from an empty draft and the title field can autofocus without stealing focus on page load.

- `ModalDialog` variant `lg` with `className="max-w-3xl"` (the same override pattern `SearchPickerDialog` already uses with `max-w-xl`). On phones it inherits `w-[calc(100%-2rem)]`; the form stacks because its grid is `lg:grid-cols-4`.
- `DialogHeader` reuses the existing i18n strings: eyebrow `library`, title `newItemTitle`, description `newItemDescription`, close label `close`.
- `onCreated(id)` closes the dialog and runs `router.push('/repertoire/' + id)`, preserving the current create → detail flow.
- `/repertoire/new/page.tsx` becomes a server component that calls `redirect('/repertoire')`, so old links do not 404. It no longer renders the form.

Alternative rejected: keeping the route and rendering the dialog over an intercepted route. That adds Next.js interception conventions for no product benefit and keeps two entry points to the same form.

Alternative rejected: rendering the dialog always and resetting state manually. Conditional mounting is smaller and removes a class of "stale draft" bugs.

### D6. Tablature frame at phone widths

- `TabEditor` toolbar: keep `flex flex-wrap` on `sm` and up, but on mobile give the resolution select and the fret field full width (`w-full sm:w-44`, `w-full sm:w-20`) and keep each label/control group in a `min-w-0` column so nothing is clipped. The measure stepper stays one row.
- `TabPlaybackBar` already wraps; ensure its BPM field keeps its `w-20` and the bar does not exceed the card.
- The editor grid keeps its measured fit-to-width behaviour (`getAvailableTabColumns`/`groupTabSystems`); add `min-w-0` to the measured wrapper and keep the existing `p-3` border container so no system can widen the page.
- `LickEditorModal` changes `w-[min(100%-1rem,46rem)]` to `w-[min(100%-2.5rem,46rem)]` on mobile (Tailwind resolves the subtraction), matching the app's `px-5` page margin; `sm:` keeps the current behavior.
- `TabView` already scrolls inside `overflow-x-auto`; only verify it stays inside its card.

No geometry constants change; `tests/repertoire-tab.test.mjs` must stay green.

### D7. Tooltip dedupe as a pure function

Add to `src/utils/practice-tooltip.ts`:

```
getSessionPhaseLines(session): SessionPhaseRecord[]
```

It returns `[]` when the session has exactly one phase whose trimmed, case-insensitive name equals the trimmed session title; otherwise it returns all phases. `PracticeDayTooltip` maps over that result, so the time/BPM line and the session title remain, and the duplicated block line disappears. Sessions with several blocks, or one block with a different name, render as today. No stored data is rewritten.

Alternative rejected: normalizing the session title when saving. It would not fix old sessions and would change stored data.

## Risks / Trade-offs

- **Hidden scrollbars reduce the affordance of horizontal areas** → Content still peeks past the card edge, and every scroll region keeps its `overflow-x-auto`; the spec requires scrollability, not a visual bar.
- **`overflow-x: clip` can mask a real overflow** → Verification at 320/390/768 px compares layout with the rule temporarily disabled and checks that no section is cut.
- **16 px mobile fields can change form density** → Only the mobile breakpoint changes; `sm:` keeps today's 14 px, and screenshots of account, repertoire creation, practice and settings are part of the manual pass.
- **A dialog changes the creation URL contract** → `/repertoire/new` redirects instead of 404; the header is the only product entry point afterwards.
- **`env(safe-area-inset-top)` is 0 in a desktop browser** → Validate in an installed/standalone context or with DevTools' safe-area emulation; also check a device without a notch for the no-extra-gap scenario.
- **Search standardization changes the chord finder's height** → Intended consistency; the finder's focus and Escape behavior (ref + `useDialogModal`) must be kept when swapping the raw input for `SearchField`.

## Migration Plan

1. Ship as one deploy; no schema, storage or API change, so there is no data migration.
2. Rollback is a revert of the change: stored practice sessions, repertoire items and search queries are untouched.
3. `/repertoire/new` keeps working through a redirect, so old bookmarks are not broken.

## Open Questions

None. The two product assumptions (no dedicated creation URL, pinch zoom stays) are recorded in the proposal and reflected in the specs.
