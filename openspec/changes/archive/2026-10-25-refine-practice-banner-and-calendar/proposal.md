# Proposal

## Why

The floating practice bar is the only way back to a running practice, but it works against that job. Hovering it changes the background and the text stops reading cleanly, it carries a single "Volver a la práctica" pill instead of the controls the user needs, and only that pill is clickable — the bar itself, which is the bigger target, does nothing. On top of that, the bar disappears exactly where the practice is: once the user scrolls past the timer inside `/practice`, there is no clock and no way to pause or finish without scrolling back up.

On touch screens, the annual calendar only exposes its day summary on hover. A tap skips the summary and navigates to the day, so the information that makes the calendar useful on a phone (how long, how many sessions) is unreachable before the page changes.

## What Changes

- **The bar stops washing out on hover.** Hover no longer tints the surface or fades the text; the only feedback is a subtle border/contrast change, and the content keeps its normal opacity. Reduced-motion preferences are respected.
- **The bar gets play/pause and stop.** The "Volver a la práctica" pill is replaced by two controls: play/pause for the running timer and stop for finishing the practice. Each one reflects the timer state (paused, running, not resumable until the next block, session already completed).
- **The whole bar is the target.** Clicking anywhere on the bar that is not a control opens the practice. Inside `/practice`, where there is nowhere to navigate to, the same click scrolls back to the timer.
- **The bar also appears inside the practice.** When the timer card leaves the viewport while a practice is running, the same bar slides in at the bottom, with the same controls. It hides again as soon as the timer is back in view, and keeps clear of the home indicator on phones.
- **Stop finishes the practice, not just the clock.** It opens the existing "¿Terminar práctica?" confirmation and then the usual completion dialog. From another screen the confirmation still works, and confirming takes the user to `/practice` so the completion dialog is visible.
- **Touch gets a two-step calendar.** On a coarse pointer, the first tap on a day opens its summary; tapping the same day again opens the day detail; tapping another day moves the summary. Keyboard and assistive-technology activation still navigates straight away, and the mouse keeps hover to read and click to enter.

Out of scope: redesigning the timer card, changing the completion or save flow, adding swipe gestures, changing the month heatmap (it already selects a day and shows its summary below), the weekly summary, or the bar's clock format.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-session-management`: a new requirement describes the floating practice bar — legibility, play/pause and stop controls, the bar as the navigation target, and its appearance inside the practice when the timer is off-screen.
- `practice-dashboard`: the annual calendar's day summary gains a touch path, so the first tap opens the summary and the second opens the day instead of navigating immediately.

## Impact

- **UI**: `src/components/practice/PracticeSession.tsx` rebuilds the bar and renders it on both routes with a visibility check; `src/components/practice/TimerCard.tsx` hands its finish confirmation up so the bar can use the same one.
- **Hooks and logic**: a small visibility hook (IntersectionObserver) for the timer card, and touch-arming logic for the calendar (`src/components/dashboard/YearPracticeCalendar.tsx`), kept as pure helpers where possible so they can be tested with `node --test`.
- **Copy**: `src/i18n/translations.ts` (`es`/`en`) gains the control labels and the bar's accessible names; `src/i18n/dictionary.ts` follows.
- **No change** to the practice timer engine, the session store schema, the saved session format, the API, dependencies or configuration.
