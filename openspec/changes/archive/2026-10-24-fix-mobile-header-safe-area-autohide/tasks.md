# Tasks

## 1. Safe area

- [x] 1.1 Add `appleWebApp: { capable: true, title: 'thediary', statusBarStyle: 'black' }` to the root metadata (opaque bar: the installed app must never paint the header under the clock); verification: the rendered head contains `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-title=thediary` and `apple-mobile-web-app-status-bar-style=black`, and typecheck passes.
- [x] 1.2 Add `--app-safe-top` / `--app-safe-bottom` to `:root` in `globals.css` from `env(safe-area-inset-*)` with a `0px` fallback, apply `padding-top: var(--app-safe-top)` to the header, and render a fixed `aria-hidden` canvas strip of that height below the header; verification: with `--app-safe-top: 47px` overridden, the header padding and the strip are 47 px and the app name starts below 47 px; with `0px`, there is no extra gap.
- [x] 1.3 Confirm the strip stays painted when the header is hidden; verification: after hiding the header, the strip still covers the top 47 px with the canvas colour and page content is not visible under it.

## 2. Sticky auto-hide header

- [x] 2.1 Add `src/utils/header-visibility.ts` with the hide/show thresholds (`64 px` depth, `8 px` down, `8 px` up) and a pure function that returns the next hidden state from the scroll position, accumulated direction and current state; verification: new `tests/header-visibility.test.mjs` covers at-top, below threshold, hide after accumulated down, reveal after accumulated up, jitter and already-hidden cases.
- [x] 2.2 Add `src/hooks/useHeaderAutoHide.ts` using a passive scroll listener throttled with `requestAnimationFrame`, direction accumulators and `matchMedia('(max-width: 767px)')`; it exposes `isHidden` and `reveal`, resets on pathname change and is disabled on desktop and while `disabled` is true; verification: typecheck passes and a desktop scroll never sets the hidden state.
- [x] 2.3 Make `SiteNavigation` sticky on phones and static on desktop (`sticky top-0 z-40` below `md`, `md:static`), apply `-translate-y-full` only while hidden, add `motion-reduce:transition-none`, and expose `data-header-hidden` for verification; verification: scrolling down on a 390 px viewport hides the header with no layout jump, scrolling up shows it, and a 1024 px viewport keeps the current static header.
- [x] 2.4 Keep the header visible while the mobile menu is open: pass `isMenuOpen` into the hook's disabled input and verify scrolling with the menu open leaves the header and menu in place.
- [x] 2.5 Expose `isOpen` from `TutorialProvider` (`TutorialContextValue`) and disable the hide while the tour is active; verification: starting the tour and scrolling keeps the header visible, and `SettingsView`'s `openTutorial` still works.
- [x] 2.6 Reveal the header on keyboard focus with `onFocusCapture`; verification: hide the header, tab into it and confirm it becomes visible before the app-name link is activated.
- [x] 2.7 Smooth the hide/reveal: animate `translate` + `opacity` (300 ms ease-in out, 350 ms `cubic-bezier(0.22,1,0.36,1)` in), keep `motion-reduce:transition-none`, and neutralize both properties on `md`; verification: computed `transition-property` is `translate, opacity`, the header shows intermediate `translate`/`opacity` values mid-animation, ends at `-100% / 0` hidden and `0 / 1` visible, and desktop never fades.

## 3. Verification

- [x] 3.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: all three exit 0.
- [x] 3.2 Browser pass at 390 px and 1024 px: simulate the inset with `--app-safe-top: 47px`, verify the header/strip positions, scroll down/up, route change, open menu, open the tutorial and check the z-order against the spotlight; verification: a pass/fail note per scenario.
- [x] 3.3 Installed-PWA pass on a notched iPhone: remove any previous home-screen icon, add the HTTPS tunnel URL again, launch it and confirm the header sits entirely below the clock with no blurred band over it, hides/shows on scroll and keeps the top band canvas-coloured; verification: written pass/fail note, including a browser-tab run where the inset is zero.
- [x] 3.4 Confirm no dependency or configuration drift: `git diff package.json package-lock.json tsconfig.json next.config.ts`; verification: the diff is empty.

## Verification notes

- **390 px with `--app-safe-top: 47px`**: pass. Header is sticky, padding is 47 px, the strip is 47 px, the app name starts at 65 px; scrolling down 300 px hides the header (`data-header-hidden`, bottom at 0) and the strip stays painted; scrolling up 50 px reveals it.
- **Real `env()` path**: pass. With CDP `Emulation.setSafeAreaInsetsOverride` at 47 px top, `env(safe-area-inset-top)` resolves to 47 px, the header padding is 47 px, the strip is 47 px and the app name starts at 65 px.
- **Installed iOS status bar**: fix applied after the device report. `black-translucent` let the header sit (and blur) under the status bar and `env()` returned zero on the device; the metadata now uses the opaque `black` bar, which starts the webview below the clock, while the inset variables stay for edge-to-edge platforms.
- **Motion**: pass. `transition-property` is `translate, opacity`; mid-animation the header reports interpolated `translate`/`opacity` (for example `-4.7% / 0.95` after 80 ms), settles at `-100% / 0` hidden and `0 / 1` visible, and `prefers-reduced-motion: reduce` switches `transition-property` to `none`.
- **Production build (`:8080`)**: pass. The restarted production server serves the new head (`apple-mobile-web-app-status-bar-style=black`) and the animated classes; hide/show behave as in dev. (The previous `:8080` process was still serving the old build, which explains earlier device retests showing no change.)
- **Menu open**: pass. Scrolling with the mobile menu open keeps the header and menu visible.
- **Guided tour**: pass. The header stays visible while the tour is active; z-order is header 40, spotlight 100, tour dialog 102.
- **Keyboard focus**: pass. Focusing the app name while hidden reveals the header without moving `main` (same scroll position and `mainTop`).
- **Route change**: pass. Navigating to a song while the header is hidden reveals it on the new view.
- **1024 px**: pass. Header is static, safe-area padding and strip are 0 and scrolling 400 px never hides it.
- **Gates**: pass. `npm run typecheck`, `npm test` (551 tests) and `npm run build` exit 0.
- **Installed iPhone**: pass (confirmed by the user on the physical device): the header sits entirely below the clock, hides on scroll down and returns on scroll up.

## Workflow follow-up

- Archive the change after the review and the device pass are accepted.
- `polish-pwa-mobile-experience` is complete but unarchived. It can be archived before or after this change; this delta only adds `app-navigation` requirements and does not modify `pwa-mobile-shell`.
