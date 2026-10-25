# Design

## Context

See `proposal.md` for motivation and the spec delta for the contract. The header lives in `src/components/layout/SiteNavigation.tsx` and is rendered once by `src/app/layout.tsx`, inside `TutorialProvider` but outside the page. It currently has `pt-[env(safe-area-inset-top)]` and `bg-canvas`, but no `position: sticky`, so it scrolls away with the document.

The viewport export already contains `viewportFit: 'cover'`, and the built CSS contains `padding-top: env(safe-area-inset-top)`. The remaining gap is iOS standalone support: there is no `appleWebApp` metadata, so an “Add to Home Screen” install is not guaranteed to run edge-to-edge, and the `env()` value can stay at zero in a browser tab. The previous change `polish-pwa-mobile-experience` is complete but not archived; its `pwa-mobile-shell` spec is not in `openspec/specs` yet. This change therefore keeps the new contract in `app-navigation`, which already owns the header, and treats the safe-area correction as making an existing requirement effective rather than creating a second shell capability.

Constraints: Next.js 16 App Router, React 19, Tailwind 4, no new dependencies, pure logic in `src/utils` with `node --test` coverage, browser state in a hook, and the existing tutorial/spotlight and mobile-menu behavior must not regress.

## Goals / Non-Goals

**Goals:**

- Make the installed iOS app keep the header clear of the status bar, and reserve the real top inset wherever the platform exposes one.
- Keep the status-bar area painted when the navigation slides away.
- Make the mobile header sticky and auto-hide/reveal without layout jumps.
- Keep navigation reachable by keyboard, menu and guided tour.
- Cover the hide/reveal rule with pure tests and the safe-area/scroll behavior with browser checks.

**Non-Goals:**

- Changing the desktop header from its current static placement.
- Adding a service worker, install prompt or offline behavior.
- Redesigning the header, its menu or the tutorial.
- Managing the bottom/home-indicator inset for page content (already handled per dialog where needed).
- Changing the navigation routes or labels.

## Decisions

### Decision D1 (revised). Opaque status bar, inset variables for edge-to-edge contexts

Device testing showed that `statusBarStyle: 'black-translucent'` was the cause of the “blurred header”: in the installed app iOS drew the header under a translucent status bar and `env(safe-area-inset-top)` came back as `0`, so the reserved padding never materialised. The metadata now uses:

```
appleWebApp: {
  capable: true,
  title: 'thediary',
  statusBarStyle: 'black',
}
```

An opaque status bar means the webview starts below the clock/notch, so the header can never be painted (or blurred) underneath it. `env(safe-area-inset-top)` is then `0` by design and the layout adds no gap.

The inset variables and the strip are kept for contexts that really are edge-to-edge (Android standalone, future platforms, and testing):

```
:root {
  --app-safe-top: env(safe-area-inset-top, 0px);
  --app-safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

The header uses `padding-top: var(--app-safe-top)` and full-height dialogs can reuse `--app-safe-bottom` later. The variable is a single source of truth and can be overridden in DevTools/Playwright (`--app-safe-top: 47px`) to verify the layout without a notched device.

Alternatives rejected: keeping `black-translucent` and hoping the inset resolves (the device proves it does not), and relying on `theme-color` alone to colour the bar (it does not remove the overlap).

### D2. A persistent safe-area strip behind the header

Render a fixed, non-interactive strip in `SiteNavigation` (or the layout shell) with `height: var(--app-safe-top)`, `background-color: var(--color-canvas)`, `z-index` below the header, and `aria-hidden="true"`:

```
<div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[var(--app-safe-top)] bg-canvas" />
```

When the header is visible its own top padding paints the same area; when the header is hidden the strip remains, so page content never appears under the system status bar. Its height is zero on desktop, on iOS with the opaque status bar, and on devices without a cutout.

Alternative rejected: letting content scroll under the status bar while the header is hidden. That reintroduces the original “blurred top” problem and makes contrast depend on the page underneath.

### D3. Sticky on phones, static on desktop

Header classes: `sticky top-0 z-40` below `md`, `md:static md:z-auto`, with `bg-canvas`, the existing border and the safe-area padding. The hide transform is only applied below `md`; the auto-hide hook also checks `matchMedia('(max-width: 767px)')` and forces the visible state on larger screens.

Sticky keeps the header in the document flow, so pinning does not create a gap and hiding by `translateY(-100%)` does not change layout. The transform applies to the whole header, including its safe-area padding and the mobile section row; the fixed strip is separate and stays.

`overflow-x: clip` on the mobile `html/body` (from the previous change) does not create a scroll container, so sticky keeps working; the `overflow-x: hidden` fallback for very old engines is accepted as a degradation, not a target.

### D4. Pure visibility rule plus a scroll hook

Add `src/utils/header-visibility.ts` with an accumulation-based decision:

- `HEADER_HIDE_AFTER_PX = 64`: minimum scroll depth before hiding.
- `HEADER_HIDE_DISTANCE_PX = 8`: downward movement accumulated before hiding.
- `HEADER_SHOW_DISTANCE_PX = 8`: upward movement accumulated before showing.

The pure function receives the current scroll position, the accumulated downward/upward distance and the current hidden state, and returns the next hidden state. Rules:

- At or above the page top (`scrollY <= 0`) or inside the hide threshold, always visible.
- Visible + moving down past the threshold + at least 8 px accumulated down → hidden.
- Hidden + at least 8 px accumulated up → visible.
- Any other combination keeps the current state.

`src/hooks/useHeaderAutoHide.ts` owns the browser state:

- A passive `scroll` listener throttled with `requestAnimationFrame`.
- Tracks `lastY` and resets the down/up accumulators when the direction reverses, so slow 1 px scrolls still accumulate.
- Only reads/writes state when the resulting hidden value changes.
- Resets to visible on `pathname` change and whenever `disabled` becomes true.
- `disabled` is `isMenuOpen || tutorialOpen`; it also refuses to hide when the header is focused.
- Exposes `isHidden` and `reveal`; `SiteNavigation` attaches `onFocusCapture={reveal}` to the header.

Alternative rejected: a scroll-position-only rule with a single “last Y”. It flickers with momentum and never fires for slow scrolls; the accumulator is small and testable.

### D5. The tutorial exposes its open state

Extend `TutorialContextValue` in `src/types/tutorial.ts` with `isOpen: boolean` and include it in the memoized context value in `TutorialProvider`. `SettingsView` continues to use `openTutorial`; `SiteNavigation` reads `isOpen` through the existing hook. This keeps the spotlight target on screen for the first tour step and avoids coupling the header to tutorial internals.

Alternative rejected: querying the DOM for the spotlight overlay. It would be an implicit, fragile dependency and would not respond to React state changes.

### D6. Motion and accessibility

- Hiding animates `translate` + `opacity` for 300 ms with an ease-in curve; revealing takes 350 ms with `cubic-bezier(0.22, 1, 0.36, 1)` so the header settles instead of snapping. `motion-reduce:transition-none` under `prefers-reduced-motion`.
- `md:translate-y-0 md:opacity-100` neutralize both properties above the tablet breakpoint, so a resize from a hidden mobile state never leaves the desktop header faded.
- The hidden header remains in the accessibility tree (scroll-based hiding is visual); keyboard focus reveals it before activation, so the app name and menu stay reachable.
- The strip is `aria-hidden` and `pointer-events-none`.
- The z-order is: strip `z-30`, header `z-40`, tutorial overlay `z-100+`, dialogs in the top layer, tooltips `z-300`. Nothing overlaps the tutorial or dialogs.

## Risks / Trade-offs

- **`black-translucent` overlaps the status bar** → It was tried and rejected: on the installed iPhone the header sat under the translucent bar (the “blurred” top) and the inset resolved to zero. `black` moves the webview below the bar; the CSS variable remains for edge-to-edge platforms. Rollback is a one-line revert to `black-translucent` plus the inset padding.
- **An already installed icon may keep the old status-bar style** → iOS caches part of the web-app chrome per installation. The device pass in 3.3 includes removing and re-adding the icon before judging the fix.
- **Opaque bar colour vs. canvas** → The bar is the system's dark bar and `theme-color` is `#121211`; any difference is a few RGB points on a dark band, which is preferable to overlapping content.
- **Hiding navigation reduces discoverability** → The header returns on the first upward scroll, on focus, on route changes, and never hides while the menu/tour is open. This is the standard mobile pattern.
- **Sticky and `overflow-x`** → `clip` preserves sticky; the `hidden` fallback for old engines may break it. The app targets current iOS/Android browsers, and the fallback only affects the horizontal overflow guard.
- **Scroll listener cost** → Passive listener, rAF throttle, and state updates only on change; no layout reads beyond `window.scrollY`.
- **A persistent strip consumes the top inset** → It is exactly the device inset, which the status bar already covers; content is not reduced compared with a correct safe-area layout.
- **Tutorial state coupling** → Adding `isOpen` to the context is additive; the only consumer of `openTutorial` keeps working.

## Migration Plan

1. Ship as one deploy. No storage, schema or API change.
2. Rollback is a revert: the header returns to static placement, the metadata and CSS variables are removed, and the scroll hook is no longer used.
3. The previous change can be archived before or after this one; this delta only adds requirements to `app-navigation` and does not touch the pending `pwa-mobile-shell` spec.

## Open Questions

None. The two product assumptions (mobile-only auto-hide, persistent safe-area strip) are recorded in the proposal and reflected in the spec.
