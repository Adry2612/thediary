# Design

## Context

See `proposal.md` for motivation and `specs/app-accessibility/spec.md` for the required behavior.

Current state that shapes the approach:

- `src/app/globals.css` defines `--color-muted: #8a8884` as the app's secondary text tone, and the screens of the repertoire, the practice and the metronome use it (`text-muted`).
- The start and the dashboard are a cool-gray island built on Tailwind's `zinc` scale: `bg-zinc-900`/`950`, `border-zinc-800`, `text-zinc-100` for values and `text-zinc-400` for labels; 57 of their lines paint captions and meta with `text-zinc-500` and three with `text-zinc-600`.
- `SelectField` (`src/components/ui/SelectField.tsx`) builds its accessible name from the `ariaLabel` prop while its trigger shows the label of the selected option, and it is used both inside the field's `<label>` and as a stand-alone filter.
- `MetronomeCard` labels the dot of each beat with an `aria-label` on a `<span>` that has no role.

## Goals / Non-Goals

**Goals:**

- Every secondary text of the app meets the AA contrast, measured against the surface it actually sits on.
- The app's select can be named by the text it shows.
- No label on an element that cannot carry one.

**Non-Goals:**

- Reworking the tokens or unifying the start and the dashboard with the warm palette: the fix is the tone of that text, not the identity of those screens.
- The placeholder tone of the inputs and the tone of disabled options.
- Anything else the audit reported under performance.

## Decisions

### 1. The failing secondary text moves to the app's muted tone

`text-zinc-500` and `text-zinc-600` become `text-muted` (`#8a8884`) in the affected components. Measured with the WCAG formula, the token reaches 5.30:1 on the canvas, 5.01:1 on `zinc-900`, 5.62:1 on `zinc-950` and 4.60:1 on the hover fill those cards use, so it passes everywhere it appears today; the failing pairs it replaces (`zinc-500` over `zinc-900` at 3.67:1, `zinc-600` over the canvas at 2.42:1) match the numbers the audit reported.

Alternatives considered:

- Jumping to `text-zinc-400` (`#a1a1aa`, 6.9:1): rejected. It is the tone those same cards already use for their field labels, so the label and the description of a card would end up looking the same and the cards would lose a level; it is also a bigger visual jump than the muted tone.
- Inventing an intermediate gray (a "zinc-450"): rejected. The app already has a tone for secondary text, and adding a second one for a corner of the interface is worse than the small warm shift the token brings to those screens.
- Curiously, it is the audit itself that makes these numbers trustworthy: the same formula reproduces exactly the 3.67:1 the tool reported for the failing pair.

Risk worth writing down: the token would give only 4.21:1 over a solid `zinc-800`, so it must not be used as the text tone of a control whose background is that. Today no muted text sits on one: the `zinc-800` fills are hover states of controls painted with `zinc-200`/`zinc-300`, or decorative bars.

### 2. The select's accessible name carries the field and the value

`SelectField` composes its name as `field: value` when it has one, keeping the field's name alone when nothing is selected.

Alternatives considered:

- Removing `aria-label` and letting the visible text name the control: rejected. The name would become the value alone ("All states"), losing the field ("Progress") that tells the user what they are choosing.
- Wiring `aria-labelledby` from each visible label to the control: rejected for this change. It is the more precise pattern, but it needs every call site to hand over an id, and the composed name fixes the rule for all of them from one place.

### 3. The beat of the metronome keeps its label and gains a role

The dot becomes `role="img"`, the smallest role that accepts a name, so the beat and whether it is the active one are still announced.

Alternatives considered:

- Dropping the label and hiding the dot: rejected, it would throw away the only announcement of which beat is sounding.
- Labeling the wrapper of the beat: rejected, the wrapper is as generic as the dot and would fail the same rule.

## Risks / Trade-offs

- [The muted tone is slightly warmer than the zinc around it] → Both are almost neutral (a difference of about six units in the blue channel), so it does not read as a mismatch; and the alternative loses the internal hierarchy of the cards.
- [The composed name changes what a screen reader announces for every select of the app] → It now announces the field and the value, which is more useful than the field alone.

## Migration Plan

No data migration: only class names and accessible names change. Rollback is reverting the commit.
