# Proposal

## Why

The mobile header still fails its safe-area contract: on an installed iPhone the top strip can end up under the status bar, and the fix delivered with `polish-pwa-mobile-experience` relied on a Tailwind `env()` value plus manifest-only standalone support, which is not enough to guarantee the inset on iOS. Now that the rest of the mobile polish is in place, the header is the remaining rough edge. At the same time, the header is static, so it disappears with the page and the user has to scroll back to the top to reach navigation; a native app keeps navigation one upward gesture away.

## What Changes

- **Make the safe area effective**: add iOS web-app metadata (`appleWebApp.capable`) with an **opaque** status bar so the installed app never paints the header under the clock, centralize the inset in CSS variables (`--app-safe-top`) with an `env()` fallback for edge-to-edge contexts, and apply it to the header and a persistent top strip.
- **Pin the header on phones**: the header becomes sticky below the tablet breakpoint instead of scrolling away with the page.
- **Hide on the way down, reveal on the way up**: scrolling down hides the header after a small threshold; the first upward movement brings it back. It is always visible at the top, on a route change, while the mobile menu is open, and while the guided tour is active.
- **Keep the status bar readable while hidden**: the reserved safe-area strip stays painted with the app background even when the navigation is hidden, so page content never appears blurred under the status bar.
- **Soften the transition**: hiding and revealing animate the header with a slide plus a short fade (and are disabled under `prefers-reduced-motion`), so the change is not abrupt.
- **Keep the header reachable by keyboard**: focusing a header control while it is hidden reveals it.
- **Fix the implementation, not the contract**: the safe-area behaviour is already required by the pending `polish-pwa-mobile-experience` change; this change makes it hold and adds the new scroll behaviour to `app-navigation`.

Assumptions (recorded):

- The auto-hide header is a mobile behaviour (below the `md` breakpoint); desktop keeps the current static header.
- Hiding starts after 64 px of downward scroll and showing after 8 px of upward scroll, so momentum jitter does not flicker the header.
- The safe-area strip is not part of the hidden navigation: it remains at the top as a canvas-coloured band.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-navigation`: adds the pinned mobile header, its safe-area strip and the hide-on-scroll-down / reveal-on-scroll-up behaviour.

## Impact

- **Metadata and styles**: `src/app/layout.tsx` (`appleWebApp`), `src/app/globals.css` (safe-area variables and strip), `src/components/layout/SiteNavigation.tsx` (sticky, hidden state, strip).
- **New logic**: `src/hooks/useHeaderAutoHide.ts` for scroll state and `src/utils/header-visibility.ts` for the pure hide/show decision.
- **Tutorial integration**: `src/types/tutorial.ts` and `src/components/tutorial/TutorialProvider.tsx` expose whether the tour is open so the header does not hide under the spotlight.
- **Tests**: new `node --test` cases for the visibility rule; existing `tutorial-*`, `i18n` and full suite must stay green. No new dependencies.
- **Out of scope**: desktop sticky/hide behaviour, a redesign of the header, and service-worker/offline support.
- **Related pending change**: `polish-pwa-mobile-experience` is complete but not archived. This change does not add another safe-area capability; it hardens the existing header contract and adds the scroll behaviour to `app-navigation`.
