# Design

## Context

See `proposal.md` — Why. The constraints that shape the approach:

- `PracticeSession` is mounted once from the root layout (`ActivePracticeSessionHost`) and lives for as long as there is an active session. It owns `usePracticeTimer`, `isCompleted`, the pending result, the completion dialog and the floating bar; the practice markup is hidden with `hidden`/`aria-hidden` when `pathname !== "/practice"`.
- `usePracticeTimer` already exposes `pause`, `resume`, `finish`, `reset`, `isRunning`, `awaitingPhaseAdvance`, `continueAfterBlockTime`, `currentPhase`, `remainingSeconds` and `currentPhaseIndex`. `finish()` completes the session without asking; the confirmation lives inside `TimerCard` as local state.
- The current bar is a `Link` wrapping the whole card, styled `bg-surface` with `hover:bg-white/[0.04]`; it renders only when `!isPracticeRoute`, and its only action is "Volver a la práctica".
- `PracticeCompletionDialog` is rendered by `PracticeSession` with `isVisible={isPracticeRoute}`; `discardSession()` clears the session and pushes `/practice`.
- The annual calendar (`YearPracticeCalendar`) wires `onMouseEnter` → hover-intent tooltip, `onFocus` → immediate tooltip, `onClick` → `router.push('/dashboard/practice/<date>')`, and renders the summary through a portal (`PracticeDayTooltip`). The month heatmap (`PracticeHeatmap`) is separate: it selects a day and shows its summary inline, with no navigation.
- `tests/architecture-layers.test.mjs` enforces `types ← utils ← services ← hooks ← components ← app`; `PlayIcon` and `PauseIcon` already exist in `icons.tsx`, and there is no stop icon (the finish button uses an inline square).
- The project tests pure modules with `node --test`; there is no component test harness.

## Goals / Non-Goals

**Goals:**

- One bar, one component, always reflecting the real timer state, on and off the practice route.
- Keep the interaction honest: the bar looks like a link, the controls look like controls, and stopping goes through the same confirmation as the timer card.
- Make the day summary reachable on touch without giving up the one-tap shortcut on mouse and keyboard.

**Non-Goals:**

- Rewriting `usePracticeTimer` or changing what `finish()` does.
- Changing the completion dialog, the save payload, the metronome or the split view.
- Touching the month heatmap or the weekly summary.
- Persisting a "bar hidden" preference or adding swipe-to-dismiss.

## Decisions

### D1 — The bar is a card with a link overlay, not a link wrapping buttons

The container becomes a `<div className="relative ...">` with:

- an absolutely positioned overlay (`<Link href="/practice">` off the practice route, `<button type="button">` on it) covering the card and carrying the accessible name "Volver a la práctica en curso: <name>" / "Ir al temporizador";
- the visible content (status dot, eyebrow, name, clock) above it with `pointer-events-none`;
- the two controls above it with `pointer-events-auto`, so they never trigger the overlay.

Why: a `<button>` inside an `<a>` is invalid HTML and breaks keyboard and assistive navigation; an `onClick` on a `div` with `role="link"` loses middle-click, open-in-new-tab and the native focus ring. The overlay keeps the whole card clickable and the semantics correct, and it lets the same card become a "scroll to timer" control on `/practice` by swapping the element.

Alternatives rejected:

- **Make the whole card a `button`.** It cannot contain the two controls.
- **Keep only the "Volver" pill as the link.** That is the current state and the target the user complained about.

### D2 — Hover changes the border, never the surface or the opacity

Drop `hover:bg-white/[0.04]`; the bar keeps `bg-surface` and the text keeps its colour. The hover feedback is a border that goes from `border-line` to a lighter tone, plus an optional tiny lift (`-translate-y-px`) behind `motion-safe`. The touch "sticky hover" then changes only a hairline, and the text never fades.

Hover styles are scoped to `@media (hover: hover)` so a tap on a phone does not leave the card in a hovered state.

### D3 — Play/pause mirrors `TimerCard`, stop shares the finish dialog

- Play/pause calls `resume()` when paused and `pause()` when running, uses `PlayIcon`/`PauseIcon` and is disabled exactly like the timer card's main button: no current phase, `isCompleted`, or `awaitingPhaseAdvance && !isRunning && !continueAfterBlockTime`.
- Stop opens the existing "¿Terminar práctica?" confirmation. That dialog currently lives inside `TimerCard`; it moves to its own `FinishPracticeDialog` rendered by `PracticeSession`, and `TimerCard` receives `onRequestFinish` instead of owning `isFinishDialogOpen`. `TimerCard` loses `onDiscard` because its only use was inside that dialog.
- The dialog keeps its three actions (keep practicing, exit without saving, finish and save). "Finish and save" calls `timer.finish()`; if the current route is not `/practice`, it then pushes `/practice` so `PracticeCompletionDialog` (`isVisible={isPracticeRoute}`) is on screen. "Exit without saving" keeps calling `discardSession()`, which already navigates.
- With `isCompleted`, both controls are disabled and the bar reports the completed status; the completion dialog owns the next step.

Why lift the dialog instead of duplicating it: two copies would drift on copy and on what "finish" means, and the bar must be able to finish from another route without inventing a second flow.

### D4 — Inside the practice, the bar follows the timer card

The timer card is wrapped in a `<div ref={timerRef}>` when composed, and a small `useElementVisibility(ref)` hook reports whether it intersects the viewport (`IntersectionObserver`, threshold 0). The bar renders when `!isPracticeRoute || !isTimerVisible`.

- The hook starts with `isVisible = true`, so the bar does not flash on mount before the observer's first callback.
- If `IntersectionObserver` is unavailable, the hook stays `true` and the bar never appears inside the practice, which is the current behaviour — a safe fallback.
- Activating the overlay on `/practice` scrolls the wrapper into view (`behavior: "smooth"` unless `prefers-reduced-motion`), which also hides the bar as the timer returns.

The bar keeps `max-w-2xl`, `mx-auto` and its existing `bottom-3`/`sm:bottom-5`, but the bottom offset becomes `max(0.75rem, env(safe-area-inset-bottom))` so it clears the home indicator; the practice page already reserves `pb-24`.

### D5 — The calendar decides per activation, with a pure helper

The click handler asks a pure function:

```ts
resolveDayActivation({ pointer: "coarse" | "fine", isKeyboard, hasPractice, armedDate, dateKey })
// → "arm" | "navigate"
```

- `isKeyboard` comes from `event.detail === 0` (clicks synthesised by keyboard or AT have no click count).
- `pointer` comes from `window.matchMedia("(hover: none)")` evaluated at click time, not at render, so a hybrid device follows the input actually used.
- `hasPractice` is false for a day without saved sessions; those days only ever open the summary, never navigate.
- `"arm"` means: store the date in `armedDateRef`, open the summary for that day, do not navigate. `"navigate"` means `router.push`.
- The armed date clears whenever the summary closes (the hook already knows: `hoveredDay === null`) and when the year changes.

`onFocus` still opens the summary for keyboard users, but it never arms: the arm only happens in the click handler, so a tap that focuses and clicks still needs its second tap.

Why a pure helper: the rule ("first tap reads, second tap enters, keyboard enters directly") is the part worth testing, and it is easier to lock down than the surrounding DOM code.

### D6 — The touch summary also closes with a tap outside

While the summary is open on a coarse pointer, a `pointerdown` outside the day grid and outside the summary card closes it. Mouse behaviour is untouched.

Why: on desktop the pointer leaving the grid is enough; on touch there is no "leave", and without this the summary would stay pinned across the page until a scroll.

The year strip's own horizontal scrolling is excluded from the "scroll closes the summary" rule, because focusing a day can nudge that strip and would otherwise close the summary in the same tap that opens it. `cells` is also memoised so `useLatestPracticeScroll` does not recentre the strip on every tooltip render, which would move the day under the finger between the two taps.

## Risks / Trade-offs

- **[The bar covers the bottom of the practice page]** → It only appears when the timer is off-screen, it is capped at `max-w-2xl`, and the page already reserves bottom padding; the safe-area offset keeps it above the home indicator.
- **[IntersectionObserver jitters while scrolling near the timer edge]** → The bar is shown when the timer is fully out of view; a small root margin (`0px`) avoids flicker at the boundary, and the transition is short.
- **[Lifting the finish dialog changes `TimerCard`'s contract]** → It is only used by `PracticeSession`; the prop swap is mechanical, and the dialog content moves verbatim.
- **[Two taps on touch feel slow for users who only want the detail]** → The first tap visibly opens the summary, the second is the same target, and keyboard/AT still navigates directly; the accessible label already announces that the cell opens details.
- **[A tap that focuses the day opens the summary twice]** → Focus and click both open the same summary for the same day; the hook already ignores a repeat for the same date key.
- **[Sticky `:hover` on touch keeps the bar highlighted]** → Hover styles are scoped to devices that actually hover.

## Migration Plan

Pure UI and interaction change: no storage migration, no API change, no new dependency. Deploy is a normal build; rollback is reverting the commit. An active session started with the previous version keeps working because the timer engine and the stored session shape are untouched.

## Open Questions

None.
